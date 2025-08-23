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

