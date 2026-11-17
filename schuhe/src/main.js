// Einstieg: wird mit esbuild zu ../script.js gebündelt (npm run build).
import { initHero } from "./hero3d.js";
import products from "./products.json";
import { themeById } from "./themes.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const hero = initHero();

/* ===================== KOLLEKTION ===================== */
// Produktfotos stammen aus dem virtuellen Fotostudio (tools/render-products.cjs) und liegen als Daten-URLs vor.
const photos = window.PRODUCT_PHOTOS || {};
const grid = $("#grid");
grid.innerHTML = products.map((p) => {
  const t = themeById(p.theme);
  return `
  <div class="fly-cell" data-cat="${p.cat}">
    <article class="card fly">
      <div class="card-media">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        <img src="${photos[p.id] || ""}" alt="${p.name} – Leder-Sneaker im Fotostudio" loading="lazy" width="1000" height="750">
        <button class="view3d" type="button" data-theme="${p.theme}">In 3D ansehen</button>
      </div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <span class="price">${p.price} €</span>
        <div>
          <span class="cat">${p.label}</span>
          <div class="dots"><i style="--d:${t.shoe.upper}"></i><i style="--d:${t.shoe.sole}"></i></div>
        </div>
        <button class="add" type="button" aria-label="${p.name} in den Warenkorb" data-name="${p.name}">+</button>
      </div>
    </article>
  </div>`;
}).join("");

// "In 3D ansehen": Farbe übernehmen und zum drehenden Schuh springen
grid.addEventListener("click", (e) => {
  const b = e.target.closest(".view3d");
  if (!b) return;
  scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  setTimeout(() => hero && hero.setTheme(b.dataset.theme, b), 350);
});

// Statische .fly-Elemente in eine Zelle packen: Der Observer beobachtet die unbewegte
// Zelle, damit das weit nach außen verschobene Element trotzdem erkannt wird.
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
}, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });

// Richtung je nach Position: linke Spalte von links, rechte von rechts, Mitte von unten
function setGridDirections() {
  const cells = $$(".fly-cell", grid).filter((c) => !c.hidden);
  const g = grid.getBoundingClientRect();
  const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
  cells.forEach((cell, i) => {
    const card = $(".fly", cell);
    const r = cell.getBoundingClientRect();
    const rel = (r.left + r.width / 2 - g.left) / g.width;
    let dir;
    if (cols === 1) dir = i % 2 ? "right" : "left";
    else if (rel < 0.4) dir = "left";
    else if (rel > 0.6) dir = "right";
    else dir = "up";
    card.dataset.dir = dir;
    card.style.setProperty("--delay", `${(i % cols) * 0.12}s`);
  });
}

function startFly(cells) {
  cells.forEach((c) => $(".fly", c).classList.remove("in"));
  void grid.offsetWidth; // Ausgangszustand festschreiben, damit die Animation neu startet
  cells.forEach((c) => io.observe(c));
}

setGridDirections();
startFly($$(".fly-cell"));
let resizeT;
addEventListener("resize", () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(setGridDirections, 150);
});

// Filter
$$(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    $$(".chip").forEach((c) => c.classList.toggle("is-active", c === chip));
    const f = chip.dataset.filter;
    const cells = $$(".fly-cell", grid);
    cells.forEach((c) => { c.hidden = f !== "alle" && c.dataset.cat !== f; });
    setGridDirections();
    startFly(cells.filter((c) => !c.hidden));
  });
});

// Warenkorb & Hinweis
const cart = $(".cart");
const cartCount = $("#cartCount");
const toast = $("#toast");
let count = 0, toastT;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => toast.classList.remove("show"), 2200);
}
grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add");
  if (!btn) return;
  cartCount.textContent = ++count;
  cart.classList.remove("bump");
  void cart.offsetWidth;
  cart.classList.add("bump");
  showToast(`${btn.dataset.name} liegt im Warenkorb`);
});
cart.addEventListener("click", () => showToast(count ? `${count} Artikel im Warenkorb` : "Dein Warenkorb ist noch leer"));

// Newsletter
$("#newsletter").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#nlMsg").textContent = "Danke! Wir melden uns, sobald es Neues gibt.";
  e.target.reset();
});
