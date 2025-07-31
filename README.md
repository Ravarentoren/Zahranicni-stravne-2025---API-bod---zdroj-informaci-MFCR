// Pomocná funkce pro správný překlad HTML kódů na diakritiku.

function dekodujHtmlEntity(text) {

if (text == null) return '';

return text

.replace(/á/g, 'á').replace(/Á/g, 'Á')

.replace(/é/g, 'é').replace(/É/g, 'É')

.replace(/í/g, 'í').replace(/Í/g, 'Í')

.replace(/ó/g, 'ó').replace(/Ó/g, 'Ó')

.replace(/ú/g, 'ú').replace(/Ú/g, 'Ú')

.replace(/ý/g, 'ý').replace(/Ý/g, 'Ý')

.replace(/ˇ/g, 'ˇ').replace(/č/g, 'č').replace(/Č/g, 'Č')

.replace(/ď/g, 'ď').replace(/Ď/g, 'Ď')

.replace(/ě/g, 'ě').replace(/Ě/g, 'Ě')

.replace(/ň/g, 'ň').replace(/Ň/g, 'Ň')

.replace(/ř/g, 'ř').replace(/Ř/g, 'Ř')

.replace(/š/g, 'š').replace(/Š/g, 'Š')

.replace(/ť/g, 'ť').replace(/Ť/g, 'Ť')

.replace(/ž/g, 'ž').replace(/Ž/g, 'Ž')

.replace(/ů/g, 'ů').replace(/Ů/g, 'Ů')

.replace(/ /g, ' ');

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

