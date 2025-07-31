// Pomocná funkce pro správný překlad HTML kódů na diakritiku.
function dekodujHtmlEntity(text) {
  if (text == null) return '';
  return text
    .replace(/&aacute;/g, 'á').replace(/&Aacute;/g, 'Á')
    .replace(/&eacute;/g, 'é').replace(/&Eacute;/g, 'É')
    .replace(/&iacute;/g, 'í').replace(/&Iacute;/g, 'Í')
    .replace(/&oacute;/g, 'ó').replace(/&Oacute;/g, 'Ó')
    .replace(/&uacute;/g, 'ú').replace(/&Uacute;/g, 'Ú')
    .replace(/&yacute;/g, 'ý').replace(/&Yacute;/g, 'Ý')
    .replace(/&caron;/g, 'ˇ').replace(/&ccaron;/g, 'č').replace(/&Ccaron;/g, 'Č')
    .replace(/&dcaron;/g, 'ď').replace(/&Dcaron;/g, 'Ď')
    .replace(/&ecaron;/g, 'ě').replace(/&Ecaron;/g, 'Ě')
    .replace(/&ncaron;/g, 'ň').replace(/&Ncaron;/g, 'Ň')
    .replace(/&rcaron;/g, 'ř').replace(/&Rcaron;/g, 'Ř')
    .replace(/&scaron;/g, 'š').replace(/&Scaron;/g, 'Š')
    .replace(/&tcaron;/g, 'ť').replace(/&Tcaron;/g, 'Ť')
    .replace(/&zcaron;/g, 'ž').replace(/&Zcaron;/g, 'Ž')
    .replace(/&uring;/g, 'ů').replace(/&Uring;/g, 'Ů')
    .replace(/&nbsp;/g, ' ');
}

// Hlavní funkce: Stahuje, čistí diakritiku, zapisuje a seřadí.
function stahniAseradSazby_finalni() {
  var list = SpreadsheetApp.getActiveSheet();
  list.clear();
  list.getRange("A1:D1").setValues([["Země", "Měnový kód", "Měna", "Sazba"]]).setFontWeight("bold");
  var url = 'https://www.mfcr.cz/cs/kontrola-a-regulace/legislativa/legislativni-dokumenty/2024/vyhlaska-c-373-2024-sb-58105';

  try {
    var obsahStranky = UrlFetchApp.fetch(url).getContentText();
    var regExpTabulky = /<table[^>]*>([\s\S]*?)<\/table>/g;
    var vsechnyTabulky = obsahStranky.match(regExpTabulky);

    if (!vsechnyTabulky) {
      list.getRange("A2").setValue("CHYBA: Na stránce se nepodařilo najít žádné tabulky.");
      return;
    }
    
    var dataProZapis = [];
    for (var t = 0; t < vsechnyTabulky.length; t++) {
      var obsahTabulky = vsechnyTabulky[t];
      var radky = obsahTabulky.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
      if (!radky) continue;
      
      for (var i = 0; i < radky.length; i++) {
        if (radky[i].includes('<th')) continue;
        var bunky = radky[i].match(/<td[^>]*>([\s\S]*?)<\/td>/g);
        
        if (bunky && bunky.length >= 4) {
          var zeme = dekodujHtmlEntity(bunky[0].replace(/<[^>]*>/g, '').replace(/\d+\)/g, '').trim());
          var menovyKod = dekodujHtmlEntity(bunky[1].replace(/<[^>]*>/g, '').trim());
          var menaNazev = dekodujHtmlEntity(bunky[2].replace(/<[^>]*>/g, '').trim());
          var sazba = dekodujHtmlEntity(bunky[3].replace(/<[^>]*>/g, '').trim());

          if (zeme && menovyKod && menaNazev && sazba) {
            dataProZapis.push([zeme, menovyKod, menaNazev, parseFloat(sazba) || sazba]);
          }
        }
      }
    }

    if (dataProZapis.length > 0) {
      list.getRange(2, 1, dataProZapis.length, 4).setValues(dataProZapis);
      list.getRange("A2:D" + (dataProZapis.length + 1)).sort([
        {column: 1, ascending: true}, 
        {column: 2, ascending: true}  
      ]);
    }
    
  } catch (e) {
    list.getRange("A2").setValue('Došlo k chybě: ' + e.toString());
  }
}

// Funkce pro vytvoření vlastního menu v tabulce.
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('Aktualizace sazeb')
      .addItem('Spustit stahování dat', 'stahniAseradSazby_finalni')
      .addToUi();
}

// Funkce pro API: Vrátí data z tabulky ve formátu JSON.
function doGet(e) {
  try {
    var list = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = list.getDataRange().getValues();
    var hlavicka = data.shift();
    
    var vysledek = data.map(function(radek) {
      var zaznam = {};
      hlavicka.forEach(function(nazevSloupce, index) {
        zaznam[nazevSloupce] = radek[index];
      });
      return zaznam;
    });
    
    return ContentService
      .createTextOutput(JSON.stringify(vysledek, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ chyba: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
