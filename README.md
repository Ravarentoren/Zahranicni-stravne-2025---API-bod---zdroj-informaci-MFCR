# Zahraniční stravnéBot 2025 - PerDiem CZ - Zdroj informací MFČR a MPSV
# Ohleduplně získává a parsuje informace s oficiálních webových stránek MFČR a MPSV, které dále upravuje až do výsledného formátu CSV pro další možnosti zpracování.
--------
# -*- coding: utf-8 -*-
"""
Zahraniční stravnéBot-2025-PerDiem CZ
Autor:Tento skript byl vytvořen [Raverentoren] za asistence umělé inteligence Gemini od společnosti Google. Logika pro stahování a parsování dat byla generována a laděna v rámci dialogu.
"""

# Importujeme všechny potřebné knihovny
import requests
from bs4 import BeautifulSoup
import csv
from datetime import datetime # TOTO JE NOVÉ - import pro práci s datem

# URL adresa a hlavička pro maskování
url = "https://ppropo.mpsv.cz/vyhlaska_373_2024"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

print(f"Pokouším se stáhnout stránku: {url}")

try:
    response = requests.get(url, headers=headers, timeout=10)

    if response.status_code == 200:
        print("✅ Stránka byla úspěšně stažena!")
        
        soup = BeautifulSoup(response.text, 'lxml')
        tabulka = soup.find('table')
        vysledna_data = []

        if tabulka:
            print("✅ Tabulka nalezena, zpracovávám řádky...")
            radky = tabulka.find_all('tr')

            for radek in radky[1:]:
                bunky = radek.find_all('td')
                
                stat = bunky[0].get_text(strip=True)
                kod_meny = bunky[1].get_text(strip=True)
                sazba = bunky[3].get_text(strip=True)
                
                vysledna_data.append([stat, sazba, kod_meny])

            print(f"Celkem nalezeno {len(vysledna_data)} záznamů.")

            # 1. Získáme a naformátujeme aktuální datum
            dnes = datetime.now()
            datum_pro_nazev = dnes.strftime("%Y-%m-%d")
            
            # 2. Vytvoříme dynamický název souboru
            nazev_souboru = f"sazby_stravneho_{datum_pro_nazev}.csv"
            
            print(f"Ukládám data do souboru: {nazev_souboru}")

            with open(nazev_souboru, mode='w', newline='', encoding='utf-8') as soubor:
                zapisovac = csv.writer(soubor)
                zapisovac.writerow(['Země', 'Sazba', 'Měnový kód'])
                zapisovac.writerows(vysledna_data)
            
            print(f"🎉 Hotovo! Data byla úspěšně uložena do souboru {nazev_souboru}.")
            
        else:
            print("❌ V obsahu stránky nebyla nalezena žádná tabulka.")
    else:
        print(f"❌ Chyba: Server odpověděl se stavovým kódem {response.status_code}")
except requests.exceptions.RequestException as e:
    print(f"❌ Došlo k chybě při připojování: {e}")

-----

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

