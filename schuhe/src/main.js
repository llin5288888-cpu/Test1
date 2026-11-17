// Einstieg: wird mit esbuild zu ../script.js gebündelt (npm run build).
import { initHero } from "./hero3d.js";
import product from "./product.json";
import { themeById } from "./themes.js";
import { PAGES } from "./pages.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

const hero = initHero();

/* ===================== WEICHES GLEITEN ZU DEN ABSCHNITTEN ===================== */
// Eigene Animation statt Sprung: sanft anfahren, gleiten, sanft abbremsen.
// Dauer wächst mit der Strecke – fliegt man über die Startseite, dreht sich der Schuh dabei mit.
let flight = null;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function flyTo(id) {
  const el = id === "top" ? null : document.getElementById(id);
  const headerH = $(".site-header").offsetHeight;
  const to = el ? Math.max(0, el.getBoundingClientRect().top + scrollY - headerH + 8) : 0;
  const from = scrollY, dist = to - from;
  if (flight) cancelAnimationFrame(flight.raf);
  if (reduced || Math.abs(dist) < 2) { scrollTo(0, to); return; }
  const dur = Math.min(1900, Math.max(650, 450 + Math.abs(dist) * 0.18));
  const start = performance.now();
  root.style.scrollBehavior = "auto"; // CSS-Glätten aus, sonst kämpfen zwei Animationen gegeneinander
  const stop = () => { if (flight) cancelAnimationFrame(flight.raf); flight = null; root.style.scrollBehavior = ""; removeEventListener("wheel", stop); removeEventListener("touchstart", stop); };
  addEventListener("wheel", stop, { passive: true, once: true }); // wer selbst scrollt, übernimmt
  addEventListener("touchstart", stop, { passive: true, once: true });
  const step = (now) => {
    const k = Math.min(1, (now - start) / dur);
    scrollTo(0, from + dist * ease(k));
    if (k < 1) flight.raf = requestAnimationFrame(step); else stop();
  };
  flight = { raf: requestAnimationFrame(step) };
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-scroll]");
  if (!a) return;
  e.preventDefault();
  closeMenu();
  const id = a.dataset.scroll;
  if (overlayOpen()) leaveOverlays(id); else flyTo(id);
});

/* ===================== HANDY-MENÜ ===================== */
const header = $(".site-header"), toggle = $(".nav-toggle");
function closeMenu() { header.classList.remove("menu-open"); toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Menü öffnen"); }
toggle.addEventListener("click", () => {
  const open = !header.classList.contains("menu-open");
  header.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
});
$("#mainNav").addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });
document.addEventListener("click", (e) => { if (!e.target.closest(".site-header")) closeMenu(); });

/* ===================== PRODUKT: KÜSTE Low ===================== */
// Fotos stammen aus dem virtuellen Fotostudio (npm run photos) und liegen als Daten-URLs vor.
const photos = window.PRODUCT_PHOTOS || {};
const photo = (c, v) => photos[`${c}-${v}`] || "";
const euro = (n) => `${n.toLocaleString("de-DE", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })} €`;
let color = product.colorways[0];
let view = 0;
let size = null;

const swatches = () => product.colorways.map((c) => {
  const t = themeById(c);
  return `<button type="button" class="pswatch" role="radio" aria-checked="${c === color}" aria-label="${t.name}" data-color="${c}" style="--sw:linear-gradient(135deg, ${t.shoe.upper} 55%, ${t.shoe.sole} 55%)"></button>`;
}).join("");
const PRICE_NOTE = `<p class="price-note">inkl. MwSt., kostenloser Versand · <a href="#versand">Details</a></p>`;

$("#product").innerHTML = `
  <div class="fly product-media-wrap" data-dir="left">
    <button type="button" class="product-media" id="productOpen" aria-label="Produktseite ${product.name} öffnen">
      <img id="productImg" src="${photo(color, "front")}" alt="${product.name} in ${themeById(color).name}" width="1000" height="750">
      <span class="more-photos">${product.views.length} Fotos ansehen</span>
    </button>
    <div class="product-thumbs" id="productThumbs">
      ${product.views.map((v, i) => `<button type="button" data-view="${i}" aria-label="Foto: ${v.label}"><img src="${photo(color, v.id)}" alt="" loading="lazy"></button>`).join("")}
    </div>
  </div>
  <div class="fly product-info" data-dir="right">
    <span class="badge-inline">Neu</span>
    <h3>${product.name}</h3>
    <p class="product-sub">${product.subtitle}</p>
    <p class="product-price">${euro(product.price)}</p>
    ${PRICE_NOTE}
    <div class="product-colors">
      <span>Farbe: <strong class="color-label"></strong></span>
      <div class="pswatches" role="radiogroup" aria-label="Farbe wählen">${swatches()}</div>
    </div>
    <p class="product-desc">${product.description}</p>
    <div class="product-actions">
      <button type="button" class="btn" id="productPhotos">Ansehen & kaufen</button>
      <button type="button" class="btn btn-ghost" id="product3d">In 3D ansehen</button>
    </div>
  </div>`;

/* ---------- Produktseite im Vollformat ---------- */
const pdp = $("#pdp");
pdp.innerHTML = `
  <button type="button" class="pdp-back" data-back>← Zurück</button>
  <div class="pdp-grid">
    <div class="pdp-gallery">
      <div class="pdp-thumbs" id="pdpThumbs"></div>
      <div class="pdp-stage" id="pdpStage">
        <img id="pdpImg" alt="">
        <button type="button" class="g-nav g-prev" aria-label="Vorheriges Foto">‹</button>
        <button type="button" class="g-nav g-next" aria-label="Nächstes Foto">›</button>
        <span class="g-count" id="pdpCount"></span>
      </div>
    </div>
    <div class="pdp-info">
      <span class="badge-inline">Neu</span>
      <h1>${product.name}</h1>
      <p class="product-sub">${product.subtitle}</p>
      <p class="product-price">${euro(product.price)}</p>
      ${PRICE_NOTE}
      <div class="product-colors">
        <span>Farbe: <strong class="color-label"></strong></span>
        <div class="pswatches" role="radiogroup" aria-label="Farbe wählen">${swatches()}</div>
      </div>
      <div class="g-sizes">
        <span>Größe (EU) · <a href="#groessen">Größentabelle</a></span>
        <div class="sizes" role="radiogroup" aria-label="Größe wählen">
          ${product.sizes.map((s) => `<button type="button" role="radio" aria-checked="false" data-size="${s}">${s}</button>`).join("")}
        </div>
      </div>
      <button type="button" class="btn g-add" id="pdpAdd">In den Warenkorb – ${euro(product.price)}</button>
      <ul class="pdp-perks"><li>Kostenloser Versand</li><li>30 Tage Probelaufen</li><li>Lieferung in 2–4 Werktagen</li></ul>
      <p class="product-desc" style="margin-top:1.2rem">${product.description}</p>
      <ul class="g-details">${product.details.map((d) => `<li>${d}</li>`).join("")}</ul>
    </div>
  </div>`;

function render() {
  const t = themeById(color), v = product.views[view];
  $("#productImg").src = photo(color, "front");
  $("#productImg").alt = `${product.name} in ${t.name}`;
  $$("#productThumbs img").forEach((img, i) => { img.src = photo(color, product.views[i].id); });
  $$(".color-label").forEach((el) => { el.textContent = t.name; });
  $$(".pswatch").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.color === color)));
  const img = $("#pdpImg");
  img.classList.remove("show");
  requestAnimationFrame(() => { img.src = photo(color, v.id); img.alt = `${product.name} in ${t.name}, ${v.label}`; img.classList.add("show"); });
  $("#pdpCount").textContent = `${view + 1} / ${product.views.length} · ${v.label}`;
  $("#pdpThumbs").innerHTML = product.views.map((pv, i) => `<button type="button" data-view="${i}" aria-current="${i === view}" aria-label="Foto: ${pv.label}"><img src="${photo(color, pv.id)}" alt=""></button>`).join("");
}
const step = (d) => { view = (view + d + product.views.length) % product.views.length; render(); };
function openProduct(i = 0) { view = i; render(); go("produkt"); }
$("#productOpen").addEventListener("click", () => openProduct(0));
$("#productPhotos").addEventListener("click", () => openProduct(0));
$("#productThumbs").addEventListener("click", (e) => { const b = e.target.closest("[data-view]"); if (b) openProduct(+b.dataset.view); });
$("#pdpThumbs").addEventListener("click", (e) => { const b = e.target.closest("[data-view]"); if (b) { view = +b.dataset.view; render(); } });
$(".g-prev", pdp).addEventListener("click", () => step(-1));
$(".g-next", pdp).addEventListener("click", () => step(1));
let sx = null; // Wischen auf dem Handy
$("#pdpStage").addEventListener("pointerdown", (e) => { sx = e.clientX; });
$("#pdpStage").addEventListener("pointerup", (e) => {
  if (sx !== null && !e.target.closest(".g-nav") && Math.abs(e.clientX - sx) > 40) step(e.clientX < sx ? 1 : -1);
  sx = null;
});
document.addEventListener("click", (e) => { // Farbe (Startseite und Produktseite gemeinsam)
  const b = e.target.closest(".pswatch");
  if (!b) return;
  color = b.dataset.color;
  render();
});
$(".sizes", pdp).addEventListener("click", (e) => {
  const b = e.target.closest("[data-size]");
  if (!b) return;
  size = b.dataset.size;
  $$(".sizes button", pdp).forEach((x) => x.setAttribute("aria-checked", String(x === b)));
});
$("#product3d").addEventListener("click", (e) => {
  flyTo("top");
  setTimeout(() => hero && hero.setTheme(color, e.target), reduced ? 0 : 500);
});

/* ===================== UNTERSEITEN (über die Adresse) ===================== */
// #produkt → Produktseite, #impressum, #datenschutz, #kasse … → Unterseite im Vollformat.
// So funktionieren Zurück/Vorwärts im Browser, und jede Seite hat eine eigene, teilbare Adresse.
const page = $("#page");
const PAGE_IDS = [...Object.keys(PAGES), "kasse"];
let returnY = 0;
let pendingFly = null; // Ziel, zu dem nach dem Schließen einer Unterseite geglitten wird
const overlayOpen = () => !pdp.hidden || !page.hidden;
function setOverlay(on) {
  if (on) root.dataset.pdp = "1"; else delete root.dataset.pdp; // pausiert 3D-Schuh und Farbhintergrund
  document.body.classList.toggle("no-scroll", on || drawerOpen);
}
function show(el) {
  el.hidden = false;
  el.scrollTop = 0;
  el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter");
  const back = $("[data-back]", el);
  if (back) back.focus({ preventScroll: true });
}
function renderPage(id) {
  const p = id === "kasse" ? checkoutPage() : PAGES[id];
  page.classList.toggle("wide", id === "kasse");
  page.innerHTML = `<div class="page-inner"><button type="button" class="pdp-back" data-back>← Zurück</button><h1>${p.title}</h1>${p.html}</div>`;
  document.title = `${p.title} | NORDLAUF`;
}
const BASE_TITLE = document.title;
function route() {
  const id = location.hash.slice(1);
  const wasOpen = overlayOpen();
  if (id === "produkt" || PAGE_IDS.includes(id)) {
    if (!wasOpen) returnY = scrollY;
    if (id === "produkt") { page.hidden = true; if (pdp.hidden) show(pdp); document.title = `${product.name} – ${euro(product.price)} | NORDLAUF`; }
    else { pdp.hidden = true; renderPage(id); show(page); }
    setOverlay(true);
    return;
  }
  // keine Unterseite: zurück zur Startseite
  pdp.hidden = true; page.hidden = true; setOverlay(false);
  document.title = BASE_TITLE;
  if (wasOpen) {
    scrollTo(0, returnY);
    const to = pendingFly || (id && document.getElementById(id) ? id : null);
    pendingFly = null;
    if (to) requestAnimationFrame(() => flyTo(to));
  }
}
function go(id) {
  if (location.hash === `#${id}`) route();
  else location.hash = id;
}
// Nur einfache #namen verwenden (kein pushState): funktioniert so auch eingebettet, z. B. als claude.ai-Artefakt
function leaveOverlays(flyTarget = null) {
  pendingFly = flyTarget;
  if (location.hash && location.hash !== "#") location.hash = "";
  else route();
}
function back() {
  if (history.state && history.state.fromSite) history.back();
  else leaveOverlays();
}
addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if ((id === "produkt" || PAGE_IDS.includes(id)) && !(history.state && history.state.fromSite)) history.replaceState({ fromSite: true }, "");
  route();
});
document.addEventListener("click", (e) => { if (e.target.closest("[data-back]")) back(); });
addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (header.classList.contains("menu-open")) { closeMenu(); return; }
    if (drawerOpen) { closeDrawer(); return; }
    if (overlayOpen()) { back(); return; }
  }
  if (!pdp.hidden && !drawerOpen) {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  }
});

/* ---------- Formulare auf den Unterseiten ---------- */
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
function validate(form) {
  let ok = true;
  $$("[required]", form).forEach((f) => {
    const bad = f.type === "checkbox" ? !f.checked : f.type === "email" ? !emailOk(f.value.trim()) : !f.value.trim();
    f.classList.toggle("invalid", bad);
    if (bad && ok) { f.focus(); ok = false; }
  });
  return ok;
}
page.addEventListener("submit", (e) => {
  const form = e.target;
  e.preventDefault();
  const msg = $(".form-msg", form);
  if (!validate(form)) { if (msg) msg.textContent = "Bitte fülle die markierten Felder aus."; return; }
  if (form.id === "contactForm") {
    msg.textContent = "Danke! Deine Nachricht ist angekommen – wir melden uns innerhalb von 24 Stunden. (Demo: es wurde nichts versendet.)";
    form.reset();
  } else if (form.id === "withdrawForm") {
    const nr = form.order.value.trim();
    msg.textContent = `Dein Widerruf für Bestellung ${nr} ist eingegangen (${new Date().toLocaleString("de-DE")}). Eine Bestätigung geht an ${form.email.value.trim()}. (Demo)`;
    form.reset();
  } else if (form.id === "checkoutForm") {
    placeOrder(form);
  }
});
page.addEventListener("input", (e) => { if (e.target.classList.contains("invalid")) e.target.classList.remove("invalid"); });

/* ===================== WARENKORB ===================== */
const KEY = "nordlauf-cart";
let items = [];
try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch { items = []; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* privates Fenster o. Ä. */ } };

const cartBtn = $(".cart");
const drawer = $("#drawer"), shade = $("#drawerShade");
let drawerOpen = false;
const totalQty = () => items.reduce((n, it) => n + it.qty, 0);
const vatOf = (gross) => Math.round((gross - gross / 1.19) * 100) / 100;

function renderCart(addedKey) {
  $("#cartCount").textContent = totalQty();
  $("#drawerCount").textContent = items.length ? `(${totalQty()})` : "";
  if (!items.length) {
    $("#drawerItems").innerHTML = `<div class="drawer-empty"><p>Dein Warenkorb ist noch leer.</p></div>`;
    $("#drawerFoot").innerHTML = `<button type="button" class="btn" data-act="shop">Zum ${product.name}</button>`;
    return;
  }
  $("#drawerItems").innerHTML = items.map((it) => {
    const t = themeById(it.color);
    return `<div class="ci${it.key === addedKey ? " added" : ""}" data-key="${it.key}">
      <img src="${photo(it.color, "front")}" alt="${product.name} in ${t.name}">
      <div>
        <h3>${product.name}</h3>
        <p>${t.name} · Gr. ${it.size}</p>
        <div class="qty" aria-label="Menge">
          <button type="button" data-act="minus" aria-label="Eins weniger">−</button><span>${it.qty}</span><button type="button" data-act="plus" aria-label="Eins mehr">+</button>
        </div>
        <button type="button" class="ci-remove" data-act="remove">Entfernen</button>
      </div>
      <span class="ci-price">${euro(it.qty * product.price)}</span>
    </div>`;
  }).join("");
  const sum = totalQty() * product.price;
  $("#drawerFoot").innerHTML = `
    <div class="row"><span>Zwischensumme</span><span>${euro(sum)}</span></div>
    <div class="row"><span>Versand</span><span>kostenlos</span></div>
    <div class="row total"><span>Gesamt</span><span>${euro(sum)}</span></div>
    <div class="row" style="font-size:.8rem"><span>inkl. 19 % MwSt.</span><span>${euro(vatOf(sum))}</span></div>
    <button type="button" class="btn" data-act="checkout">Zur Kasse</button>
    <button type="button" class="link" data-act="close">Weiter einkaufen</button>`;
}
function openDrawer() {
  drawerOpen = true;
  shade.hidden = false;
  drawer.removeAttribute("inert");
  drawer.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => { shade.classList.add("show"); drawer.classList.add("open"); });
  document.body.classList.add("no-scroll");
  $("#drawerClose").focus({ preventScroll: true });
}
function closeDrawer() {
  drawerOpen = false;
  shade.classList.remove("show");
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  drawer.setAttribute("inert", "");
  setTimeout(() => { if (!drawerOpen) shade.hidden = true; }, 350);
  document.body.classList.toggle("no-scroll", overlayOpen());
}
$("#pdpAdd").addEventListener("click", () => {
  if (!size) {
    showToast("Bitte wähle zuerst deine Größe");
    const s = $(".sizes", pdp);
    s.classList.remove("shake"); void s.offsetWidth; s.classList.add("shake");
    return;
  }
  const key = `${color}-${size}`;
  const found = items.find((it) => it.key === key);
  if (found) found.qty++; else items.push({ key, color, size, qty: 1 });
  save();
  renderCart(key);
  cartBtn.classList.remove("bump"); void cartBtn.offsetWidth; cartBtn.classList.add("bump");
  openDrawer();
});
cartBtn.addEventListener("click", () => { renderCart(); openDrawer(); });
$("#drawerClose").addEventListener("click", closeDrawer);
shade.addEventListener("click", closeDrawer);
drawer.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const row = b.closest(".ci"), it = row && items.find((x) => x.key === row.dataset.key);
  switch (b.dataset.act) {
    case "plus": it.qty++; break;
    case "minus": it.qty--; if (it.qty < 1) items = items.filter((x) => x !== it); break;
    case "remove": items = items.filter((x) => x !== it); break;
    case "close": closeDrawer(); return;
    case "shop": closeDrawer(); openProduct(0); return;
    case "checkout": closeDrawer(); go("kasse"); return;
  }
  save();
  renderCart();
});

/* ===================== KASSE (Demo) ===================== */
let lastOrder = null;
function checkoutPage() {
  if (lastOrder) {
    const o = lastOrder;
    return { title: "Danke für deine Bestellung!", html: `
      <div class="done">
        <div class="big" aria-hidden="true">✓</div>
        <p>Bestellnummer <strong>${o.nr}</strong> · ${o.qty} Artikel · <strong>${euro(o.sum)}</strong></p>
        <p>Eine Bestätigung geht an <strong>${o.email}</strong>. Die Lieferung an ${o.name} dauert 2–4 Werktage.</p>
        <p class="small">Demo-Shop: Es wurde nichts bestellt und nichts bezahlt.</p>
        <p><a class="btn" href="#top" data-scroll="top">Zurück zur Startseite</a></p>
      </div>` };
  }
  if (!items.length) {
    return { title: "Kasse", html: `<p>Dein Warenkorb ist leer.</p><p><a class="btn" href="#produkt">Zum ${product.name}</a></p>` };
  }
  const sum = totalQty() * product.price;
  return { title: "Kasse", html: `
    <p class="demo-banner">Demo-Shop: Hier wird nichts bestellt und nichts bezahlt. Bitte keine echten Zahlungsdaten eingeben.</p>
    <div class="checkout">
      <form class="form" id="checkoutForm" novalidate>
        <fieldset><legend>Kontakt</legend>
          <div class="field"><label for="kMail">E-Mail-Adresse</label><input id="kMail" name="email" type="email" autocomplete="email" required></div>
        </fieldset>
        <fieldset><legend>Lieferadresse</legend>
          <div class="row2">
            <div class="field"><label for="kFirst">Vorname</label><input id="kFirst" name="first" autocomplete="given-name" required></div>
            <div class="field"><label for="kLast">Nachname</label><input id="kLast" name="last" autocomplete="family-name" required></div>
          </div>
          <div class="field"><label for="kStreet">Straße und Hausnummer</label><input id="kStreet" name="street" autocomplete="street-address" required></div>
          <div class="row3">
            <div class="field"><label for="kZip">PLZ</label><input id="kZip" name="zip" inputmode="numeric" autocomplete="postal-code" required></div>
            <div class="field"><label for="kCity">Ort</label><input id="kCity" name="city" autocomplete="address-level2" required></div>
          </div>
          <div class="field"><label for="kCountry">Land</label>
            <select id="kCountry" name="country" autocomplete="country-name"><option>Deutschland</option><option>Österreich</option><option>Schweiz</option></select></div>
        </fieldset>
        <fieldset><legend>Zahlungsart</legend>
          <label class="pay"><input type="radio" name="pay" value="Rechnung" checked> Rechnung (zahlbar in 14 Tagen)</label>
          <label class="pay"><input type="radio" name="pay" value="PayPal"> PayPal</label>
          <label class="pay"><input type="radio" name="pay" value="Kreditkarte"> Kreditkarte – Eingabe beim Zahlungsanbieter</label>
          <label class="pay"><input type="radio" name="pay" value="Vorkasse"> Vorkasse per Überweisung</label>
        </fieldset>
        <p class="small">Mit deiner Bestellung erklärst du dich mit unseren <a href="#agb">AGB</a> einverstanden. Hinweise zum <a href="#widerruf">Widerrufsrecht</a> und zum <a href="#datenschutz">Datenschutz</a>.</p>
        <button class="btn order-btn" type="submit">Zahlungspflichtig bestellen</button>
        <p class="form-msg" role="status"></p>
      </form>
      <aside class="summary">
        <h2>Deine Bestellung</h2>
        ${items.map((it) => `<div class="sum-item"><img src="${photo(it.color, "front")}" alt=""><div><strong>${product.name}</strong><p>${themeById(it.color).name} · Gr. ${it.size} · ${it.qty}×</p></div><span>${euro(it.qty * product.price)}</span></div>`).join("")}
        <div class="sum-row"><span>Zwischensumme</span><span>${euro(sum)}</span></div>
        <div class="sum-row"><span>Versand</span><span>kostenlos</span></div>
        <div class="sum-row total"><span>Gesamt</span><span>${euro(sum)}</span></div>
        <div class="sum-row small"><span>enthaltene MwSt. (19 %)</span><span>${euro(vatOf(sum))}</span></div>
      </aside>
    </div>` };
}
function placeOrder(form) {
  const sum = totalQty() * product.price;
  lastOrder = {
    nr: "NL-" + String(Math.floor(100000 + Math.random() * 900000)),
    qty: totalQty(), sum,
    email: form.email.value.trim(), name: `${form.first.value.trim()} ${form.last.value.trim()}`,
  };
  items = []; save(); renderCart();
  renderPage("kasse");
  show(page);
  lastOrder = null; // beim nächsten Öffnen der Kasse wieder das Formular zeigen
}

/* ---------- Hinweis ---------- */
const toast = $("#toast");
let toastT;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => toast.classList.remove("show"), 2600);
}

/* ---------- Reinfliegen von außen ---------- */
$$(".fly").forEach((el) => {
  if (el.parentElement.classList.contains("fly-cell")) return;
  const cell = document.createElement("div");
  cell.className = "fly-cell";
  el.before(cell);
  cell.append(el);
});
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    $(".fly", en.target).classList.add("in");
    io.unobserve(en.target);
  });
}, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
$$(".fly-cell").forEach((c) => io.observe(c));

/* ---------- Newsletter ---------- */
$("#newsletter").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = $("#nlMail");
  if (!emailOk(f.value.trim())) { $("#nlMsg").textContent = "Bitte gib eine gültige E-Mail-Adresse ein."; return; }
  $("#nlMsg").textContent = "Fast geschafft! Bitte bestätige den Link in der E-Mail, die wir dir gerade geschickt haben. (Demo)";
  e.target.reset();
});

render();
renderCart();
// Direkt mit einer Unterseiten-Adresse geöffnet (z. B. …/index.html#impressum)
if (location.hash) {
  const id = location.hash.slice(1);
  if (id === "produkt" || PAGE_IDS.includes(id)) route();
  else if (document.getElementById(id)) requestAnimationFrame(() => flyTo(id));
}
