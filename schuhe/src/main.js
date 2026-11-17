// Einstieg: wird mit esbuild zu ../script.js gebündelt (npm run build).
import { initHero } from "./hero3d.js";
import product from "./product.json";
import { themeById } from "./themes.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const hero = initHero();

/* ===================== PRODUKT: KÜSTE Low ===================== */
// Fotos stammen aus dem virtuellen Fotostudio (npm run photos) und liegen als Daten-URLs vor.
const photos = window.PRODUCT_PHOTOS || {};
const photo = (c, v) => photos[`${c}-${v}`] || "";
const euro = (n) => `${n.toLocaleString("de-DE")} €`;
let color = product.colorways[0];
let view = 0;
let size = null;

const swatches = () => product.colorways.map((c) => {
  const t = themeById(c);
  return `<button type="button" class="pswatch" role="radio" aria-checked="${c === color}" aria-label="${t.name}" data-color="${c}" style="--sw:linear-gradient(135deg, ${t.shoe.upper} 55%, ${t.shoe.sole} 55%)"></button>`;
}).join("");

/* ---------- Produktanzeige auf der Startseite ---------- */
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
  <button type="button" class="pdp-back" id="pdpBack">← Zurück</button>
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
      <div class="product-colors">
        <span>Farbe: <strong class="color-label"></strong></span>
        <div class="pswatches" role="radiogroup" aria-label="Farbe wählen">${swatches()}</div>
      </div>
      <div class="g-sizes">
        <span>Größe (EU)</span>
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

// Öffnen/Schließen über die Adresse (#produkt), damit der Zurück-Knopf des Browsers funktioniert
const ROUTE = "#produkt";
let returnY = 0;
function openProduct(i = 0) {
  view = i;
  render();
  if (location.hash !== ROUTE) location.hash = ROUTE; else showPdp();
}
function showPdp() {
  if (!pdp.hidden) return;
  returnY = scrollY;
  pdp.hidden = false;
  document.documentElement.dataset.pdp = "1";
  pdp.scrollTop = 0;
  pdp.classList.remove("enter"); void pdp.offsetWidth; pdp.classList.add("enter");
  document.body.classList.add("no-scroll");
  $("#pdpBack").focus({ preventScroll: true });
}
function hidePdp() {
  if (pdp.hidden) return;
  pdp.hidden = true;
  delete document.documentElement.dataset.pdp;
  document.body.classList.remove("no-scroll");
}
function closeProduct() {
  if (history.state && history.state.fromSite) history.back();
  else { history.replaceState(null, "", location.pathname + location.search); hidePdp(); scrollTo(0, returnY); }
}
addEventListener("hashchange", (e) => {
  if (location.hash === ROUTE) {
    history.replaceState({ fromSite: true }, "");
    showPdp();
  } else if (!pdp.hidden) {
    hidePdp();
    const target = location.hash && document.querySelector(location.hash);
    if (target) target.scrollIntoView(); else scrollTo(0, returnY);
  }
});
if (location.hash === ROUTE) { render(); showPdp(); }

const step = (d) => { view = (view + d + product.views.length) % product.views.length; render(); };
$("#productOpen").addEventListener("click", () => openProduct(0));
$("#productPhotos").addEventListener("click", () => openProduct(0));
$("#productThumbs").addEventListener("click", (e) => { const b = e.target.closest("[data-view]"); if (b) openProduct(+b.dataset.view); });
$("#pdpThumbs").addEventListener("click", (e) => { const b = e.target.closest("[data-view]"); if (b) { view = +b.dataset.view; render(); } });
$(".g-prev", pdp).addEventListener("click", () => step(-1));
$(".g-next", pdp).addEventListener("click", () => step(1));
$("#pdpBack").addEventListener("click", closeProduct);
addEventListener("keydown", (e) => {
  if (drawerOpen && e.key === "Escape") { closeDrawer(); return; }
  if (pdp.hidden) return;
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
  if (e.key === "Escape") closeProduct();
});
// Wischen auf dem Handy
let sx = null;
$("#pdpStage").addEventListener("pointerdown", (e) => { sx = e.clientX; });
$("#pdpStage").addEventListener("pointerup", (e) => {
  if (sx !== null && !e.target.closest(".g-nav") && Math.abs(e.clientX - sx) > 40) step(e.clientX < sx ? 1 : -1);
  sx = null;
});

// Farbe (Startseite und Produktseite gemeinsam)
document.addEventListener("click", (e) => {
  const b = e.target.closest(".pswatch");
  if (!b) return;
  color = b.dataset.color;
  render();
});
// Größe
$(".sizes", pdp).addEventListener("click", (e) => {
  const b = e.target.closest("[data-size]");
  if (!b) return;
  size = b.dataset.size;
  $$(".sizes button", pdp).forEach((x) => x.setAttribute("aria-checked", String(x === b)));
});
// In 3D ansehen: Farbe oben übernehmen und hochspringen
$("#product3d").addEventListener("click", (e) => {
  scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  setTimeout(() => hero && hero.setTheme(color, e.target), 350);
});

/* ===================== WARENKORB ===================== */
const KEY = "nordlauf-cart";
let items = [];
try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch { items = []; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* privates Fenster o. Ä. */ } };

const cartBtn = $(".cart");
const drawer = $("#drawer"), shade = $("#drawerShade");
let drawerOpen = false;
const totalQty = () => items.reduce((n, it) => n + it.qty, 0);

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
  if (pdp.hidden) document.body.classList.remove("no-scroll");
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
    case "checkout": showToast("Demo-Shop: Hier ginge es zur Kasse – es wird nichts bestellt."); return;
  }
  save();
  renderCart();
});

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
// Jedes .fly-Element kommt in eine unbewegte Zelle: Der Observer beobachtet die Zelle,
// damit das weit nach außen verschobene Element trotzdem erkannt wird.
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
  $("#nlMsg").textContent = "Danke! Wir melden uns, sobald es Neues gibt.";
  e.target.reset();
});

render();
renderCart();
