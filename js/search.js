/* HALDEN – Clientseitige Suche über Produkte, Seiten und FAQ */
(function () {
  "use strict";

  var INDEX = [
    { cat: "Produkt", title: "HALDEN One – Sand", url: "index.html#varianten", img: "img/variante-sand.svg",
      text: "Helles Zifferblatt in Sand, Edelstahlgehäuse, braunes Lederarmband. Automatikwerk, 40 mm. 690 €.",
      tags: "uhr armbanduhr hell beige leder braun automatik" },
    { cat: "Produkt", title: "HALDEN One – Graphit", url: "index.html#varianten", img: "img/variante-graphit.svg",
      text: "Schwarzes Zifferblatt, dunkel beschichtetes Gehäuse und schwarzes Lederarmband. 740 €.",
      tags: "uhr armbanduhr schwarz dunkel leder automatik" },
    { cat: "Produkt", title: "HALDEN One – Stein", url: "index.html#varianten", img: "img/variante-stein.svg",
      text: "Grau-steinfarbenes Zifferblatt, poliertes Gehäuse, anthrazitfarbenes Armband. 690 €.",
      tags: "uhr armbanduhr grau leder automatik" },
    { cat: "Detail", title: "Zifferblatt & Saphirglas", url: "index.html#details", img: "img/detail-zifferblatt.svg",
      text: "Gewölbtes Saphirglas mit Innenentspiegelung, reduzierte Indizes und schlanke Zeiger.",
      tags: "glas kratzfest zeiger indizes design" },
    { cat: "Detail", title: "Gehäuse – nur 9,8 mm flach", url: "index.html#details", img: "img/detail-profil.svg",
      text: "Gehäuse aus 316L-Edelstahl, 40 mm Durchmesser, verschraubte Krone, wasserdicht bis 10 bar.",
      tags: "edelstahl wasserdicht krone größe durchmesser höhe" },
    { cat: "Detail", title: "Automatikwerk mit 42 h Gangreserve", url: "index.html#details", img: "img/detail-uhrwerk.svg",
      text: "Mechanisches Automatikkaliber, reguliert in fünf Lagen, sichtbar durch den Glasboden.",
      tags: "uhrwerk kaliber mechanisch gangreserve aufzug" },
    { cat: "Detail", title: "Lederarmband aus Italien", url: "index.html#details", img: "img/detail-armband.svg",
      text: "Vollnarbiges, pflanzlich gegerbtes Leder mit Schnellwechsel-Federstegen in 20 mm.",
      tags: "armband leder wechseln schnellwechsel" },
    { cat: "Seite", title: "Unser Team", url: "team.html", img: "img/team-lena.svg",
      text: "Lernen Sie die Menschen kennen, die jede HALDEN in Hamburg entwerfen und montieren.",
      tags: "mitarbeiter gründer uhrmacher jobs karriere über uns" },
    { cat: "Seite", title: "Kontakt & Beratung", url: "kontakt.html", img: "img/detail-profil.svg",
      text: "Schreiben Sie uns, vereinbaren Sie einen Termin im Atelier oder fragen Sie nach Service.",
      tags: "kontakt telefon email adresse atelier termin beratung" },
    { cat: "Seite", title: "Datenschutzerklärung", url: "datenschutz.html", img: "img/hero.svg",
      text: "Informationen zur Verarbeitung Ihrer personenbezogenen Daten gemäß DSGVO.",
      tags: "datenschutz dsgvo cookies daten privatsphäre" },
    { cat: "Seite", title: "Impressum", url: "impressum.html", img: "img/hero.svg",
      text: "Angaben gemäß § 5 DDG, Kontakt und Verantwortliche.",
      tags: "impressum anbieter rechtliches" },
    { cat: "FAQ", title: "Wie lange ist die Garantie?", url: "kontakt.html?betreff=service", img: "img/detail-uhrwerk.svg",
      text: "Jede HALDEN One hat 5 Jahre Herstellergarantie auf Werk und Gehäuse.",
      tags: "garantie gewährleistung service reparatur" },
    { cat: "FAQ", title: "Wie schnell wird geliefert?", url: "kontakt.html?betreff=bestellung", img: "img/variante-sand.svg",
      text: "Innerhalb Deutschlands versenden wir versichert in 1–3 Werktagen, kostenlos.",
      tags: "lieferung versand lieferzeit bestellung kosten" },
    { cat: "FAQ", title: "Kann ich die Uhr zurückgeben?", url: "kontakt.html?betreff=bestellung", img: "img/variante-stein.svg",
      text: "Sie haben 30 Tage Rückgaberecht – ungetragen und in Originalverpackung.",
      tags: "rückgabe umtausch widerruf retoure" },
    { cat: "FAQ", title: "Ist die Uhr wasserdicht?", url: "index.html#details", img: "img/detail-profil.svg",
      text: "Ja, bis 10 bar (100 m). Geeignet zum Schwimmen, nicht zum Tauchen.",
      tags: "wasser schwimmen dusche wasserdicht" }
  ];

  var input = document.getElementById("search-input");
  var form = document.getElementById("search-form");
  var list = document.getElementById("results");
  var meta = document.getElementById("search-meta");
  var chips = document.querySelectorAll(".chip");
  if (!input || !list) return;

  var activeCat = "Alle";

  function normalize(s) {
    return s.toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function highlight(text, terms) {
    var safe = escapeHtml(text);
    if (!terms.length) return safe;
    var re = new RegExp("(" + terms.map(escapeRegExp).join("|") + ")", "gi");
    return safe.replace(re, "<mark>$1</mark>");
  }

  function score(item, terms) {
    var title = normalize(item.title);
    var hay = normalize(item.title + " " + item.text + " " + item.tags + " " + item.cat);
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = normalize(terms[i]);
      if (hay.indexOf(t) === -1) return 0; // alle Begriffe müssen vorkommen
      total += title.indexOf(t) !== -1 ? 3 : 1;
    }
    return total || 1;
  }

  function render() {
    var q = input.value.trim();
    var terms = q ? q.split(/\s+/) : [];
    var hits = INDEX
      .filter(function (it) { return activeCat === "Alle" || it.cat === activeCat; })
      .map(function (it) { return { it: it, s: score(it, terms) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; });

    if (!hits.length) {
      meta.textContent = "";
      list.innerHTML = '<li class="no-results"><strong>Keine Treffer für „' + escapeHtml(q) +
        '“.</strong><br>Versuchen Sie z. B. „Leder“, „Garantie“ oder „wasserdicht“ – oder <a href="kontakt.html">fragen Sie uns direkt</a>.</li>';
      return;
    }
    meta.textContent = q
      ? hits.length + (hits.length === 1 ? " Ergebnis" : " Ergebnisse") + " für „" + q + "“"
      : "Alle Inhalte (" + hits.length + ")";
    list.innerHTML = hits.map(function (r) {
      var it = r.it;
      return '<li><a class="result" href="' + it.url + '">' +
        '<img src="' + it.img + '" alt="" loading="lazy">' +
        '<div><span class="cat">' + it.cat + '</span>' +
        '<h3>' + highlight(it.title, terms) + '</h3>' +
        '<p>' + highlight(it.text, terms) + '</p></div></a></li>';
    }).join("");
  }

  function syncUrl() {
    var url = new URL(window.location.href);
    if (input.value.trim()) url.searchParams.set("q", input.value.trim());
    else url.searchParams.delete("q");
    history.replaceState(null, "", url);
  }

  // Suchbegriff aus URL (?q=...) übernehmen
  var initial = new URLSearchParams(window.location.search).get("q");
  if (initial) input.value = initial;

  input.addEventListener("input", function () { render(); syncUrl(); });
  form.addEventListener("submit", function (e) { e.preventDefault(); render(); syncUrl(); });
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); c.setAttribute("aria-pressed", "false"); });
      chip.classList.add("active");
      chip.setAttribute("aria-pressed", "true");
      activeCat = chip.getAttribute("data-cat");
      render();
    });
  });
  document.querySelectorAll("[data-suggest]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      input.value = a.getAttribute("data-suggest");
      render(); syncUrl(); input.focus();
    });
  });

  render();
})();
