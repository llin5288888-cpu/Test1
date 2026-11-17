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
const photo = (color, view) => photos[`${color}-${view}`] || "";
const euro = (n) => `${n} €`;
let color = product.colorways[0];
let view = 0;
let size = null;

const swatches = (cls) => product.colorways.map((c) => {
  const t = themeById(c);
  return `<button type="button" class="${cls}" role="radio" aria-checked="${c === color}" aria-label="${t.name}" data-color="${c}" style="--sw:linear-gradient(135deg, ${t.shoe.upper} 55%, ${t.shoe.sole} 55%)"></button>`;
}).join("");

$("#product").innerHTML = `
  <div class="fly product-media-wrap" data-dir="left">
    <button type="button" class="product-media" id="productOpen" aria-label="Fotos vom ${product.name} ansehen">
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
      <span>Farbe: <strong id="productColorName">${themeById(color).name}</strong></span>
      <div class="pswatches" role="radiogroup" aria-label="Farbe wählen">${swatches("pswatch")}</div>
    </div>
    <p class="product-desc">${product.description}</p>
    <div class="product-actions">
      <button type="button" class="btn" id="productPhotos">Mehr Fotos ansehen</button>
      <button type="button" class="btn btn-ghost" id="product3d">In 3D ansehen</button>
    </div>
  </div>`;

/* ---------- Galerie ---------- */
const dlg = $("#gallery");
dlg.innerHTML = `
  <div class="g-head">
    <div><strong>${product.name}</strong> <span class="g-sub">${product.subtitle}</span></div>
    <button type="button" class="g-close" aria-label="Galerie schließen">✕</button>
  </div>
  <div class="g-body">
    <div class="g-stage" id="gStage">
      <img id="gImg" alt="">
      <button type="button" class="g-nav g-prev" aria-label="Vorheriges Foto">‹</button>
      <button type="button" class="g-nav g-next" aria-label="Nächstes Foto">›</button>
      <span class="g-count" id="gCount"></span>
    </div>
    <div class="g-thumbs" id="gThumbs"></div>
    <aside class="g-info">
      <p class="product-price">${euro(product.price)}</p>
      <div class="product-colors">
        <span>Farbe: <strong id="gColorName"></strong></span>
        <div class="pswatches" role="radiogroup" aria-label="Farbe wählen">${swatches("pswatch")}</div>
      </div>
      <div class="g-sizes">
        <span>Größe (EU)</span>
        <div class="sizes" role="radiogroup" aria-label="Größe wählen">
          ${product.sizes.map((s) => `<button type="button" role="radio" aria-checked="false" data-size="${s}">${s}</button>`).join("")}
        </div>
      </div>
      <button type="button" class="btn g-add" id="gAdd">In den Warenkorb – ${euro(product.price)}</button>
      <ul class="g-details">${product.details.map((d) => `<li>${d}</li>`).join("")}</ul>
    </aside>
  </div>`;

function render() {
  const t = themeById(color), v = product.views[view];
  // Produktanzeige
  $("#productImg").src = photo(color, "front");
  $("#productImg").alt = `${product.name} in ${t.name}`;
  $$("#productThumbs img").forEach((img, i) => { img.src = photo(color, product.views[i].id); });
  $("#productColorName").textContent = t.name;
  // Galerie
  const g = $("#gImg");
  g.classList.remove("show");
  requestAnimationFrame(() => { g.src = photo(color, v.id); g.alt = `${product.name} in ${t.name}, ${v.label}`; g.classList.add("show"); });
  $("#gCount").textContent = `${view + 1} / ${product.views.length} · ${v.label}`;
  $("#gColorName").textContent = t.name;
  $("#gThumbs").innerHTML = product.views.map((pv, i) => `<button type="button" data-view="${i}" aria-current="${i === view}" aria-label="Foto: ${pv.label}"><img src="${photo(color, pv.id)}" alt=""></button>`).join("");
  $$(".pswatch").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.color === color)));
}

function openGallery(i = 0) {
  view = i;
  render();
  if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  document.body.classList.add("no-scroll");
}
function closeGallery() {
  if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
  document.body.classList.remove("no-scroll");
}
dlg.addEventListener("close", () => document.body.classList.remove("no-scroll"));
const step = (d) => { view = (view + d + product.views.length) % product.views.length; render(); };

$("#productOpen").addEventListener("click", () => openGallery(0));
$("#productPhotos").addEventListener("click", () => openGallery(0));
$("#productThumbs").addEventListener("click", (e) => { const b = e.target.closest("[data-view]"); if (b) openGallery(+b.dataset.view); });
$("#gThumbs").addEventListener("click", (e) => { const b = e.target.closest("[data-view]"); if (b) { view = +b.dataset.view; render(); } });
$(".g-prev", dlg).addEventListener("click", () => step(-1));
$(".g-next", dlg).addEventListener("click", () => step(1));
$(".g-close", dlg).addEventListener("click", closeGallery);
dlg.addEventListener("click", (e) => { if (e.target === dlg) closeGallery(); }); // Klick auf den abgedunkelten Hintergrund
dlg.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});
// Wischen auf dem Handy
let sx = null;
$("#gStage").addEventListener("pointerdown", (e) => { sx = e.clientX; });
$("#gStage").addEventListener("pointerup", (e) => {
  if (sx !== null && !e.target.closest(".g-nav") && Math.abs(e.clientX - sx) > 40) step(e.clientX < sx ? 1 : -1);
  sx = null;
});

// Farbwahl (Anzeige und Galerie gemeinsam)
document.addEventListener("click", (e) => {
  const b = e.target.closest(".pswatch");
  if (!b) return;
  color = b.dataset.color;
  render();
});
// Größe
$(".sizes", dlg).addEventListener("click", (e) => {
  const b = e.target.closest("[data-size]");
  if (!b) return;
  size = b.dataset.size;
  $$(".sizes button", dlg).forEach((x) => x.setAttribute("aria-checked", String(x === b)));
});
// In 3D ansehen: Farbe oben übernehmen und hochspringen
$("#product3d").addEventListener("click", (e) => {
  scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  setTimeout(() => hero && hero.setTheme(color, e.target), 350);
});

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

/* ---------- Warenkorb & Hinweis ---------- */
const cart = $(".cart");
const cartCount = $("#cartCount");
const toast = $("#toast");
let count = 0, toastT;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => toast.classList.remove("show"), 2400);
}
$("#gAdd").addEventListener("click", () => {
  if (!size) {
    showToast("Bitte wähle zuerst deine Größe");
    const s = $(".sizes", dlg);
    s.classList.remove("shake"); void s.offsetWidth; s.classList.add("shake");
    return;
  }
  cartCount.textContent = ++count;
  cart.classList.remove("bump"); void cart.offsetWidth; cart.classList.add("bump");
  showToast(`${product.name} ${themeById(color).name}, Gr. ${size} – ${euro(product.price)} liegt im Warenkorb`);
});
cart.addEventListener("click", () => showToast(count ? `${count} Artikel im Warenkorb – ${euro(count * product.price)}` : "Dein Warenkorb ist noch leer"));

/* ---------- Newsletter ---------- */
$("#newsletter").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#nlMsg").textContent = "Danke! Wir melden uns, sobald es Neues gibt.";
  e.target.reset();
});

render();
