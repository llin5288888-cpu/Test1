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

Eigenständige Demo-Website einer (fiktiven) Sneaker-Marke: `schuhe/index.html` im Browser öffnen.

- **Startseite:** Ein 3D-Leder-Sneaker (Three.js) steht hochkant und dreht sich beim Herunterscrollen einmal um 360°, mit weicher, nachfedernder Bewegung.
  Mit der Maus lässt er sich greifen und drehen (waagerecht ziehen = drehen, senkrecht ziehen = kippen), auf dem Handy mit dem Finger.
- **Farbauswahl:** Sechs Lederfarben (Cognac, Weiß, Schwarz, Salbei, Bordeaux, Marine). Beim Wechsel fließt die neue Farbe wie eine Flüssigkeit von der Auswahl aus über die ganze Seite.
  Schuh, Hintergrund, Schrift und Akzente passen sich an, im Hintergrund schwimmen weiche Farbflecken. Farben stehen in `schuhe/src/themes.js`.
- **Kollektion:** Sechs Modelle, die von außen hereinfliegen (linke Spalte von links, rechte von rechts, die Mitte von unten), mit Filter nach Kategorie und einem Warenkorb-Zähler.
- Funktioniert per Doppelklick auf `index.html`: Three.js ist in `script.js` gebündelt, das Modell steckt in `assets/shoe-model.js`.
- Code ändern: Quellen liegen in `schuhe/src/`. Danach `npm install` und `npm run build` im Ordner `schuhe/` ausführen.
  Nach einem Modellwechsel (`assets/shoe.glb`) zusätzlich `npm run model`. `npm run single` erzeugt die Einzeldatei `nordlauf.html`.
- 3D-Modell nach „Materials Variants Shoe“ © 2021 Shopify, CC BY 4.0. Zu Leder umgearbeitet: neue Narbungs-Textur, Rauheit und eine Farbmaske (`assets/leather-mask.jpg`), über die der Shader die Lederfarbe mischt. Die Karten der Kollektion nutzen weiterhin SVG-Grafiken.
