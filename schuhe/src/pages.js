// Unterseiten (öffnen im Vollformat über die Adresse, z. B. #impressum).
// WICHTIG: Rechtstexte sind Vorlagen für einen Demo-Shop. Alles in <span class="ph">…</span> ist ein Platzhalter
// und muss ersetzt werden. Vor einer echten Veröffentlichung von einer Fachperson (Anwalt/Anwältin) prüfen lassen.
const PH = (t) => `<span class="ph">${t}</span>`;

export const COMPANY = {
  name: "NORDLAUF GmbH",
  street: "Musterstraße 1",
  city: "20095 Hamburg",
  country: "Deutschland",
  email: "info@nordlauf.example",
  phone: "+49 40 000000-0",
};
const C = COMPANY;
const address = `${PH(C.name)}<br>${PH(C.street)}<br>${PH(C.city)}<br>${C.country}`;

export const PAGES = {
  impressum: {
    title: "Impressum",
    html: `
      <p class="lead-small">Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</p>
      <h2>Anbieter</h2>
      <p>${address}</p>
      <h2>Vertreten durch</h2>
      <p>Geschäftsführung: ${PH("Vorname Nachname")}</p>
      <h2>Kontakt</h2>
      <p>Telefon: ${PH(C.phone)}<br>E-Mail: ${PH(C.email)}<br>Kontaktformular: <a href="#kontakt">nordlauf.de/kontakt</a></p>
      <h2>Registereintrag</h2>
      <p>Eintragung im Handelsregister<br>Registergericht: Amtsgericht ${PH("Hamburg")}<br>Registernummer: HRB ${PH("000000")}</p>
      <h2>Umsatzsteuer-ID</h2>
      <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: ${PH("DE000000000")}</p>
      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>${PH("Vorname Nachname")}, Anschrift wie oben</p>
      <h2>Verbraucherstreitbeilegung</h2>
      <p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      <h2>Haftung für Inhalte und Links</h2>
      <p>Wir erstellen die Inhalte dieser Seiten mit Sorgfalt. Für die Inhalte verlinkter fremder Seiten sind ausschließlich deren Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar; bei Bekanntwerden entfernen wir solche Links umgehend.</p>
      <h2>Bildnachweis</h2>
      <p>3D-Modell des Schuhs: „boing01白“ von <a href="https://sketchfab.com/3d-models/f3cb4debfb024e7580fc2f52ae13a295" rel="noopener" target="_blank">yihsuanchen13</a>, lizenziert unter <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener" target="_blank">CC BY 4.0</a>, über paprika3D für das Web optimiert und von uns eingefärbt. Produktfotos: daraus gerendert.</p>`,
  },

  datenschutz: {
    title: "Datenschutzerklärung",
    html: `
      <p class="lead-small">Stand: ${PH("November 2026")}</p>
      <h2>1. Verantwortlicher</h2>
      <p>${address}<br>E-Mail: ${PH(C.email)}</p>
      <h2>2. Kurz gesagt</h2>
      <p>Wir setzen keine Tracking- oder Werbe-Cookies ein, binden keine Analyse-Tools ein und laden keine Schriften oder Skripte von fremden Servern. Wir verarbeiten nur die Daten, die wir zum Betrieb der Seite, zur Beantwortung deiner Anfragen und zur Abwicklung deiner Bestellung brauchen.</p>
      <h2>3. Hosting und Server-Logfiles</h2>
      <p>Diese Website wird bei ${PH("Name des Hosting-Anbieters, Anschrift")} betrieben. Beim Aufruf werden technisch notwendige Daten (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browser-Typ) in Server-Logfiles gespeichert, um die Seite sicher und stabil auszuliefern. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Die Logfiles werden nach ${PH("7 Tagen")} gelöscht. Mit dem Anbieter besteht ein Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO).</p>
      <h2>4. Lokale Speicherung im Browser (Warenkorb)</h2>
      <p>Damit dein Warenkorb beim nächsten Besuch noch da ist, speichern wir seinen Inhalt (Modell, Farbe, Größe, Menge) im lokalen Speicher deines Browsers. Diese Daten verlassen dein Gerät nicht und sind für den von dir gewünschten Dienst unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Du kannst sie jederzeit löschen, indem du den Warenkorb leerst oder die Website-Daten in deinem Browser löschst.</p>
      <h2>5. Kontaktformular und E-Mail</h2>
      <p>Wenn du uns schreibst, verarbeiten wir deine Angaben (Name, E-Mail-Adresse, Nachricht), um deine Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Anfragen) bzw. lit. f DSGVO (allgemeine Anfragen). Wir löschen die Daten, wenn die Anfrage erledigt ist und keine Aufbewahrungspflichten entgegenstehen.</p>
      <h2>6. Bestellungen</h2>
      <p>Für die Abwicklung deiner Bestellung verarbeiten wir Name, Anschrift, E-Mail-Adresse, Bestell- und Zahlungsdaten (Art. 6 Abs. 1 lit. b DSGVO). Zur Lieferung geben wir Name und Anschrift an den beauftragten Versanddienstleister ${PH("Name")} weiter, zur Zahlung die nötigen Daten an den gewählten Zahlungsdienstleister ${PH("z. B. PayPal, Stripe")}. Handels- und steuerrechtliche Unterlagen bewahren wir bis zu 10 Jahre auf (Art. 6 Abs. 1 lit. c DSGVO).</p>
      <h2>7. Newsletter</h2>
      <p>Für den Newsletter brauchen wir nur deine E-Mail-Adresse. Wir nutzen das Double-Opt-in-Verfahren: Erst nach Bestätigung des Links in unserer E-Mail wirst du eingetragen. Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die du jederzeit über den Abmeldelink oder per E-Mail widerrufen kannst.</p>
      <h2>8. Deine Rechte</h2>
      <p>Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO). Eine erteilte Einwilligung kannst du jederzeit mit Wirkung für die Zukunft widerrufen. Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der für uns zuständigen ${PH("Behörde für Datenschutz und Informationsfreiheit")}.</p>
      <h2>9. Keine automatisierte Entscheidungsfindung</h2>
      <p>Eine automatisierte Entscheidungsfindung einschließlich Profiling findet nicht statt.</p>`,
  },

  agb: {
    title: "Allgemeine Geschäftsbedingungen",
    html: `
      <h2>§ 1 Geltungsbereich</h2>
      <p>Diese AGB gelten für alle Bestellungen, die Verbraucherinnen und Verbraucher über den Online-Shop von ${PH(C.name)} (nachfolgend „wir“) abschließen. Vertragssprache ist Deutsch.</p>
      <h2>§ 2 Vertragsschluss</h2>
      <p>Die Darstellung der Produkte im Shop ist kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung. Mit dem Klick auf „Zahlungspflichtig bestellen“ gibst du ein verbindliches Angebot ab. Den Eingang bestätigen wir per E-Mail; der Vertrag kommt mit unserer Auftragsbestätigung oder der Lieferung zustande. Vor dem Absenden kannst du deine Eingaben jederzeit prüfen und korrigieren.</p>
      <h2>§ 3 Preise und Versandkosten</h2>
      <p>Alle Preise sind Endpreise in Euro und enthalten die gesetzliche Mehrwertsteuer. Der Versand innerhalb Deutschlands, nach Österreich und in die Schweiz ist kostenlos; bei Lieferungen in die Schweiz können Zölle und Einfuhrabgaben anfallen.</p>
      <h2>§ 4 Lieferung</h2>
      <p>Die Lieferzeit beträgt 2–4 Werktage innerhalb Deutschlands, sofern bei dem Produkt nichts anderes angegeben ist.</p>
      <h2>§ 5 Zahlung</h2>
      <p>Wir bieten die im Bestellprozess angezeigten Zahlungsarten an (${PH("z. B. Rechnung, PayPal, Kreditkarte, Vorkasse")}). Bei Vorkasse liefern wir nach Zahlungseingang.</p>
      <h2>§ 6 Eigentumsvorbehalt</h2>
      <p>Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.</p>
      <h2>§ 7 Widerrufsrecht</h2>
      <p>Verbraucherinnen und Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Einzelheiten findest du in der <a href="#widerruf">Widerrufsbelehrung</a>. Den Widerruf kannst du auch direkt über die Schaltfläche <a href="#widerrufen">„Vertrag widerrufen“</a> erklären.</p>
      <h2>§ 8 Gewährleistung</h2>
      <p>Es gilt das gesetzliche Mängelhaftungsrecht. Darüber hinaus bieten wir freiwillig 30 Tage Probelaufen: Passt dir der Schuh nicht, nehmen wir ihn innerhalb von 30 Tagen nach Erhalt zurück. Deine gesetzlichen Rechte bleiben davon unberührt.</p>
      <h2>§ 9 Streitbeilegung</h2>
      <p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>`,
  },

  widerruf: {
    title: "Widerrufsbelehrung",
    html: `
      <p class="notice">Du kannst den Widerruf auch direkt online erklären: <a class="btn btn-inline" href="#widerrufen">Vertrag widerrufen</a></p>
      <h2>Widerrufsrecht</h2>
      <p>Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem du oder ein von dir benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen hast bzw. hat.</p>
      <p>Um dein Widerrufsrecht auszuüben, musst du uns (${PH(C.name)}, ${PH(C.street)}, ${PH(C.city)}, E-Mail: ${PH(C.email)}, Telefon: ${PH(C.phone)}) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief, eine E-Mail oder über die Schaltfläche „Vertrag widerrufen“) über deinen Entschluss, diesen Vertrag zu widerrufen, informieren. Du kannst dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.</p>
      <p>Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absendest.</p>
      <h2>Folgen des Widerrufs</h2>
      <p>Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die wir von dir erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass du eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt hast), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über deinen Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das du bei der ursprünglichen Transaktion eingesetzt hast, es sei denn, mit dir wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden dir wegen dieser Rückzahlung Entgelte berechnet.</p>
      <p>Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis du den Nachweis erbracht hast, dass du die Waren zurückgesandt hast, je nachdem, welches der frühere Zeitpunkt ist.</p>
      <p>Du hast die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem du uns über den Widerruf dieses Vertrags unterrichtest, an uns zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn du die Waren vor Ablauf der Frist von vierzehn Tagen absendest. Wir tragen die Kosten der Rücksendung der Waren.</p>
      <p>Du musst für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.</p>
      <h2>Muster-Widerrufsformular</h2>
      <div class="formbox">
        <p>(Wenn du den Vertrag widerrufen willst, dann fülle bitte dieses Formular aus und sende es zurück.)</p>
        <p>An ${PH(C.name)}, ${PH(C.street)}, ${PH(C.city)}, E-Mail: ${PH(C.email)}:</p>
        <p>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)</p>
        <p>— Bestellt am (*)/erhalten am (*)<br>— Name des/der Verbraucher(s)<br>— Anschrift des/der Verbraucher(s)<br>— Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)<br>— Datum</p>
        <p>(*) Unzutreffendes streichen.</p>
      </div>`,
  },

  widerrufen: {
    title: "Vertrag widerrufen",
    html: `
      <p>Hier kannst du einen Kaufvertrag online widerrufen. Gib dafür an, welche Bestellung du widerrufen möchtest. Du erhältst anschließend sofort eine Eingangsbestätigung per E-Mail.</p>
      <form class="form" id="withdrawForm" novalidate>
        <div class="field"><label for="wName">Name</label><input id="wName" name="name" autocomplete="name" required></div>
        <div class="field"><label for="wMail">E-Mail-Adresse</label><input id="wMail" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="wOrder">Bestellnummer</label><input id="wOrder" name="order" placeholder="z. B. NL-123456" required></div>
        <div class="field"><label for="wItems">Welche Artikel? (optional)</label><input id="wItems" name="items" placeholder="leer lassen = ganze Bestellung"></div>
        <button class="btn" type="submit">Widerruf bestätigen</button>
        <p class="form-msg" role="status"></p>
      </form>
      <p class="small">Demo-Shop: Das Formular sendet nichts ab. Im echten Shop wird der Widerruf gespeichert und sofort per E-Mail bestätigt.</p>`,
  },

  versand: {
    title: "Versand & Zahlung",
    html: `
      <h2>Versand</h2>
      <table class="table">
        <thead><tr><th>Land</th><th>Lieferzeit</th><th>Kosten</th></tr></thead>
        <tbody>
          <tr><td>Deutschland</td><td>2–4 Werktage</td><td>kostenlos</td></tr>
          <tr><td>Österreich</td><td>3–5 Werktage</td><td>kostenlos</td></tr>
          <tr><td>Schweiz</td><td>4–7 Werktage</td><td>kostenlos, ggf. zzgl. Zoll</td></tr>
        </tbody>
      </table>
      <p>Wir versenden klimaneutral mit ${PH("Versanddienstleister")}. Sobald dein Paket unterwegs ist, bekommst du eine E-Mail mit Sendungsverfolgung.</p>
      <h2>Zahlung</h2>
      <ul class="list"><li>Rechnung (zahlbar in 14 Tagen)</li><li>PayPal</li><li>Kreditkarte (Visa, Mastercard)</li><li>Vorkasse per Überweisung</li></ul>
      <p>Alle Preise inkl. gesetzlicher MwSt.</p>
      <h2>Rücksendung</h2>
      <p>Rücksendungen sind innerhalb von 30 Tagen kostenlos. Lege einfach den beigefügten Rücksendeschein bei oder schreib uns über das <a href="#kontakt">Kontaktformular</a>.</p>`,
  },

  faq: {
    title: "Häufige Fragen",
    html: `
      <details><summary>Fällt der KÜSTE Low normal aus?</summary><p>Ja, er fällt größengerecht aus. Bei breiten Füßen empfehlen wir eine halbe Nummer größer. Unsere <a href="#groessen">Größentabelle</a> hilft dir bei der Wahl.</p></details>
      <details><summary>Wie hoch ist die Sohle?</summary><p>Die Plateau-Sohle aus Naturkautschuk ist an der Ferse etwa 4 cm hoch, vorne etwa 3,5 cm.</p></details>
      <details><summary>Wie pflege ich das Leder?</summary><p>Mit einem weichen, leicht feuchten Tuch abwischen und gelegentlich eine farblose Lederpflege auftragen. Nicht in die Waschmaschine geben.</p></details>
      <details><summary>Was kostet der Versand?</summary><p>Nichts – innerhalb Deutschlands, nach Österreich und in die Schweiz versenden wir kostenlos. Mehr unter <a href="#versand">Versand & Zahlung</a>.</p></details>
      <details><summary>Kann ich den Schuh zurückgeben?</summary><p>Ja. Du hast 30 Tage Probelaufen und dein gesetzliches Widerrufsrecht. Den Widerruf kannst du direkt über <a href="#widerrufen">„Vertrag widerrufen“</a> erklären.</p></details>
      <details><summary>Wann kommt meine Bestellung an?</summary><p>Innerhalb Deutschlands meist nach 2–4 Werktagen. Du bekommst eine E-Mail mit Sendungsverfolgung.</p></details>`,
  },

  kontakt: {
    title: "Kontakt",
    html: `
      <div class="two">
        <div>
          <p>Fragen zur Größe, zu deiner Bestellung oder einfach Feedback? Schreib uns – wir antworten werktags innerhalb von 24 Stunden.</p>
          <p><strong>${PH(C.name)}</strong><br>${PH(C.street)}<br>${PH(C.city)}</p>
          <p>Telefon: ${PH(C.phone)}<br>Mo–Fr, 9–17 Uhr<br>E-Mail: ${PH(C.email)}</p>
        </div>
        <form class="form" id="contactForm" novalidate>
          <div class="field"><label for="cName">Name</label><input id="cName" name="name" autocomplete="name" required></div>
          <div class="field"><label for="cMail">E-Mail-Adresse</label><input id="cMail" name="email" type="email" autocomplete="email" required></div>
          <div class="field"><label for="cTopic">Thema</label>
            <select id="cTopic" name="topic"><option>Frage zum Produkt</option><option>Größenberatung</option><option>Meine Bestellung</option><option>Rücksendung</option><option>Sonstiges</option></select></div>
          <div class="field"><label for="cMsg">Nachricht</label><textarea id="cMsg" name="message" rows="5" required></textarea></div>
          <label class="check"><input type="checkbox" name="privacy" required> Ich habe die <a href="#datenschutz">Datenschutzerklärung</a> gelesen. Meine Angaben werden zur Beantwortung meiner Anfrage verwendet.</label>
          <button class="btn" type="submit">Nachricht senden</button>
          <p class="form-msg" role="status"></p>
        </form>
      </div>`,
  },

  groessen: {
    title: "Größentabelle",
    html: `
      <p>Miss deinen Fuß am besten abends: Stell dich auf ein Blatt Papier, markiere Ferse und längsten Zeh und miss den Abstand. Liegt dein Wert zwischen zwei Größen, nimm die größere.</p>
      <table class="table">
        <thead><tr><th>EU</th><th>UK</th><th>US Damen</th><th>US Herren</th><th>Fußlänge</th></tr></thead>
        <tbody>
          ${[[37, 4, 6.5, 5, 23.5], [38, 5, 7.5, 6, 24.1], [39, 6, 8.5, 6.5, 24.8], [40, 6.5, 9, 7, 25.4], [41, 7.5, 10, 8, 26.0],
             [42, 8, 10.5, 8.5, 26.7], [43, 9, 11.5, 9.5, 27.3], [44, 9.5, 12, 10, 27.9], [45, 10.5, 13, 11, 28.6], [46, 11, 13.5, 12, 29.2]]
            .map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4].toFixed(1).replace(".", ",")} cm</td></tr>`).join("")}
        </tbody>
      </table>`,
  },

  barrierefreiheit: {
    title: "Erklärung zur Barrierefreiheit",
    html: `
      <p>Wir möchten, dass alle Menschen unseren Shop nutzen können. Die Seite ist mit Tastatur bedienbar, Bilder haben Textalternativen, Bewegungen werden reduziert, wenn du in deinem System „Bewegung reduzieren“ eingestellt hast, und Texte haben ausreichend Kontrast.</p>
      <h2>Bekannte Einschränkungen</h2>
      <p>Das drehbare 3D-Modell auf der Startseite ist ein zusätzliches, visuelles Angebot. Alle Informationen zum Produkt findest du auch als Text und in den Produktfotos.</p>
      <h2>Feedback</h2>
      <p>Ist dir eine Barriere aufgefallen? Schreib uns über das <a href="#kontakt">Kontaktformular</a> oder an ${PH(C.email)}. Zuständige Marktüberwachungsbehörde: ${PH("Name und Anschrift der zuständigen Behörde")}.</p>`,
  },
};
