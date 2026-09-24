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

- Das Kontaktformular prüft alle Eingaben, der Versand ist aber nur simuliert. Für echten Versand in `js/contact.js` einen Endpunkt (eigenes Backend, Formspree o. ä.) per `fetch()` anbinden.
- Alle Bilder sind selbst erstellte SVG-Illustrationen in `img/` und können durch echte Produktfotos ersetzt werden.
- Firmen- und Rechtsangaben sind Platzhalter und müssen vor einer Veröffentlichung ersetzt werden.
