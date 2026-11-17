# HALDEN – Website

Statische Website einer (fiktiven) Uhrenmanufaktur für das Produkt **HALDEN One**, eine minimalistische Automatikuhr.
Neutrale Farben mit schwarzen Akzenten, komplett ohne Build-Schritt.

## Seiten

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: großes Hero-Bild mit Firmentext, danach Produktdetails, Varianten, technische Daten, Kundenstimmen |
| `suche.html` | Funktionierende Suche (Produkte, Details, FAQ, Seiten) mit Filtern und Hervorhebung, `?q=` in der URL |
| `team.html` | Team, Werte und offene Stellen |
| `kontakt.html` | Kontaktdaten und Formular mit Validierung (`?betreff=beratung` wählt den Betreff vor) |
| `datenschutz.html` | Datenschutzerklärung (DSGVO-Muster) |
| `impressum.html` | Impressum |

Fußbereich auf allen Seiten: Datenschutz, Impressum, Cookie-Einstellungen, Newsletter. Beim ersten Besuch erscheint ein Cookie-Hinweis.

## Starten

`index.html` einfach im Browser öffnen, oder lokal servieren:

```bash
python3 -m http.server 8000
```

## Hinweise

- **Kontaktformular:** Standardmäßig öffnet sich beim Absenden das E-Mail-Programm des Besuchers mit fertig ausgefüllter Nachricht an `MAIL_TO`.
  Für Versand direkt aus der Seite ein kostenloses Formular bei [Formspree](https://formspree.io) anlegen und die Adresse in `js/contact.js` bei `FORM_ENDPOINT` eintragen
  (z. B. `"https://formspree.io/f/abcdwxyz"`). Formspree dann in der Datenschutzerklärung als Dienstleister ergänzen.
- Alle Bilder sind selbst erstellte SVG-Illustrationen in `img/` und können durch echte Produktfotos ersetzt werden.
- Firmen- und Rechtsangaben sind Platzhalter und müssen vor einer Veröffentlichung ersetzt werden.

## Schuh-Website NORDLAUF (`schuhe/`)

Eigenständige Demo-Website einer (fiktiven) Sneaker-Marke. Am einfachsten `schuhe/nordlauf.html` per Doppelklick öffnen (alles in einer Datei),
oder `schuhe/index.html` zusammen mit den übrigen Dateien.

- **Startseite:** Ein 3D-Leder-Sneaker (KÜSTE Low) steht hochkant und dreht sich beim Herunterscrollen einmal um 360°, mit weicher, nachfedernder Bewegung.
  Mit der Maus lässt er sich greifen und drehen (waagerecht ziehen = drehen, senkrecht ziehen = kippen), auf dem Handy mit dem Finger.
- **Der Schuh:** komplett im Code modelliert (`src/sneaker.js`): flacher Low-Top-Court-Schuh mit Cupsole, Schutzleiste und Zehenkappe,
  Schnürleiste, Fersenkappe, gepolstertem Kragen, Zunge mit Etikett, Schnürsenkeln, Ziernähten und Ledernarbung. Keine fremden Logos.
- **Farbauswahl:** Sechs zweifarbige Varianten (Panda, Cognac, Salbei, Bordeaux, Marine, Schwarz). Beim Wechsel fließt die neue Farbe wie eine Flüssigkeit
  über die ganze Seite; Schuh, Hintergrund, Schrift und Akzente passen sich an, im Hintergrund schwimmen weiche Farbflecken. Farben: `src/themes.js`.
- **Kollektion:** Sechs Modelle mit Produktfotos aus einem virtuellen Fotostudio (`src/studio.js`), die von außen hereinfliegen,
  mit Filter (Klassik, Saison, Limitiert), Warenkorb-Zähler und „In 3D ansehen“ (übernimmt die Farbe oben im 3D-Schuh).

### Entwickeln

Im Ordner `schuhe/`: `npm install`, dann
- `npm run build` – bündelt `src/` zu `script.js`
- `npm run photos` – rendert die Produktfotos neu (`assets/products/*.jpg`, `assets/product-photos.js`; benötigt Playwright mit Chromium)
- `npm run single` – erzeugt die Einzeldatei `nordlauf.html`

Produkte stehen in `src/products.json` (Name, Preis, Farbvariante, Hintergrund und Kamerawinkel fürs Foto).
