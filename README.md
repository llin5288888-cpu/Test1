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
- **Der Schuh:** 3D-Modell „boing01白“ von yihsuanchen13 ([Sketchfab](https://sketchfab.com/3d-models/f3cb4debfb024e7580fc2f52ae13a295), CC BY 4.0),
  über die paprika3D-Bibliothek für das Web optimiert. Das weiße Modell wird im Shader eingefärbt: Obermaterial und Plateau-Sohle getrennt (`src/shoeModel.js`).
  Die Namensnennung im Fußbereich ist Pflicht der Lizenz und muss stehen bleiben.
- **Farbauswahl:** Sechs Varianten (Panda, Cognac, Salbei, Bordeaux, Marine, Schwarz), jeweils Leder- und Sohlenfarbe. Beim Wechsel fließt die neue Farbe wie eine Flüssigkeit
  über die ganze Seite; Schuh, Hintergrund, Schrift und Akzente passen sich an, im Hintergrund schwimmen weiche Farbflecken. Farben: `src/themes.js`.
- **Produkt:** Eine Produktanzeige für den KÜSTE Low (130 €), die von außen hereinfliegt. Ein Klick öffnet die **Produktseite im Vollformat**
  (Adresse `#produkt`, der Zurück-Knopf des Browsers funktioniert): große Fotos mit fünf Ansichten je Farbe (Pfeile, Pfeiltasten, Wischen),
  Farbwahl, Größenwahl und „In den Warenkorb“. Die Fotos stammen aus einem virtuellen Fotostudio (`src/studio.js`).
- **Warenkorb:** Beim Kaufen fährt der Warenkorb von rechts heraus, mit Foto, Farbe, Größe, Menge (+/−), Entfernen und Summe.
  Er bleibt im Browser gespeichert. „Zur Kasse“ ist eine Demo und bestellt nichts.

- **Navigation:** Menüknöpfe gleiten mit einer animierten Fahrt zum Abschnitt (kein Sprung). Auf dem Handy gibt es ein aufklappbares Menü.
- **Unterseiten** (öffnen im Vollformat mit weißem Hintergrund, eigene Adresse, Zurück-Knopf funktioniert):
  Impressum, Datenschutz, AGB, Widerrufsbelehrung, „Vertrag widerrufen“ (Widerrufsfunktion), Versand & Zahlung, FAQ, Kontakt, Größentabelle, Barrierefreiheit, Kasse.
- **Kasse (Demo):** Bestellübersicht mit MwSt.-Ausweis, Pflichtfeld-Prüfung, Knopf „Zahlungspflichtig bestellen“ und Bestellbestätigung. Es wird nichts bestellt.
- **Datenschutz/Technik:** Schriften (Inter, Archivo Black, SIL OFL) sind eingebettet, die Seite lädt nichts von fremden Servern und setzt keine Cookies.
  Preisangaben mit „inkl. MwSt.“, strukturierte Produktdaten (schema.org) und Open-Graph-Angaben für Suchmaschinen und soziale Netzwerke.

**Wichtig vor einer Veröffentlichung:** Alle gelb markierten Platzhalter in den Rechtstexten (`src/pages.js`) ersetzen und die Texte von einer Fachperson prüfen lassen.

### Entwickeln

Im Ordner `schuhe/`: `npm install`, dann
- `npm run build` – bündelt `src/` zu `script.js`
- `npm run model` – bettet `assets/shoe.glb` in `assets/shoe-model.js` ein (damit die Seite per Doppelklick läuft)
- `npm run photos` – rendert die Produktfotos neu: jede Farbe aus jedem Blickwinkel (`assets/products/*.jpg`, `assets/product-photos.js`; benötigt Playwright mit Chromium)
- `npm run single` – erzeugt die Einzeldatei `nordlauf.html`
- `node tools/embed-fonts.mjs` – bettet die Schriften in `assets/fonts.css` ein

Das Produkt steht in `src/product.json` (Name, Preis, Texte, Größen, Farben, Fotohintergründe und Kamerawinkel).
