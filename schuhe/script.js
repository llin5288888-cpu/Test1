(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ===================== HERO: 3D-Schuh dreht beim Scrollen ===================== */
  const hero = $("#hero");
  const wrap = $("#shoeWrap");
  const shoe = $("#shoe3d");
  const front = $(".front", shoe);
  const back = $(".back", shoe);
  const shadow = $("#shadow");
  const bgWord = $("#bgWord");
  const chapters = $$(".chapter");
  const degreeText = $("#degreeText");
  const degreeBar = $("#degreeBar");
  const SLICES = 14;

  // Zwischen Vorder- und Rückseite liegen Schichten der Silhouette – so hat der Schuh
  // beim Drehen echte Tiefe, statt flach wie ein Blatt Papier zu werden.
  const slices = [];
  for (let i = 0; i < SLICES; i++) {
    const s = front.cloneNode(true);
    s.classList.remove("face", "front");
    s.classList.add("slice");
    s.removeAttribute("role");
    s.removeAttribute("aria-label");
    s.setAttribute("aria-hidden", "true");
    shoe.insertBefore(s, back);
    slices.push(s);
  }
  function layoutDepth() {
    const depth = wrap.offsetWidth * 0.14;
    front.style.transform = `translateZ(${depth / 2}px)`;
    back.style.transform = `translateZ(${-depth / 2}px)`;
    slices.forEach((s, i) => {
      const z = -depth / 2 + (depth * (i + 1)) / (SLICES + 1);
      s.style.transform = `translateZ(${z}px)`;
    });
  }
  layoutDepth();
  addEventListener("resize", layoutDepth);

  // Maus-Neigung
  let tiltX = 0, tiltY = 0, curTiltX = 0, curTiltY = 0;
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    tiltX = (e.clientX / innerWidth) * 2 - 1;
    tiltY = (e.clientY / innerHeight) * 2 - 1;
  });

  // Ziehen zum Drehen
  let dragOffset = 0, dragging = false, lastX = 0;
  wrap.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    dragOffset += (e.clientX - lastX) * 0.6;
    lastX = e.clientX;
  });
  const endDrag = () => { dragging = false; };
  wrap.addEventListener("pointerup", endDrag);
  wrap.addEventListener("pointercancel", endDrag);

  let curRot = 0;
  function frame(t) {
    const rect = hero.getBoundingClientRect();
    if (rect.bottom > 0) {
      const p = clamp(-rect.top / (hero.offsetHeight - innerHeight), 0, 1);
      const targetRot = p * 360 + dragOffset;
      curRot += (targetRot - curRot) * (reduced ? 1 : 0.09);
      curTiltX += (tiltX - curTiltX) * 0.06;
      curTiltY += (tiltY - curTiltY) * 0.06;

      const float = reduced ? 0 : Math.sin(t / 900) * 10;
      const rx = 10 - curTiltY * 12;
      const ry = curRot + curTiltX * 18;
      const rz = -10 + Math.sin(p * Math.PI * 2) * 8;
      const sc = 1 - Math.sin(p * Math.PI) * 0.08;
      shoe.style.transform = `translate3d(0, ${float}px, 0) scale(${sc}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;

      const side = Math.abs(Math.cos((ry * Math.PI) / 180));
      shadow.style.transform = `scaleX(${0.45 + side * 0.55}) scaleY(${1 - float / 60})`;
      bgWord.style.transform = `translate3d(${-p * 45}%, -50%, 0)`;

      const deg = Math.round(((curRot % 360) + 360) % 360);
      degreeText.textContent = deg + "°";
      degreeBar.style.strokeDashoffset = 119.4 * (1 - deg / 360);

      chapters.forEach((c) => {
        c.classList.toggle("is-active", p >= +c.dataset.from && p < +c.dataset.to);
      });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Farbwahl
  const colorName = $("#colorName");
  $$(".swatches button").forEach((b) => {
    b.addEventListener("click", () => {
      hero.dataset.color = b.dataset.color;
      $$(".swatches button").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      colorName.textContent = b.getAttribute("aria-label");
      if (!reduced) dragOffset += 360; // kleine Extra-Drehung als Feedback
    });
  });

  /* ===================== KOLLEKTION ===================== */
  const swatchHex = { glut: "#ff5a1f", eis: "#6fb7ff", wald: "#3f7d4f", nacht: "#d4ff3a", sand: "#d9c7a7", koralle: "#ff7b72" };
  const products = [
    { name: "AERO 01", cat: "running", label: "Running", price: 159, color: "glut", colors: ["glut", "eis", "nacht"], badge: "Neu" },
    { name: "BÖE Racer", cat: "running", label: "Running · Wettkampf", price: 179, color: "eis", colors: ["eis", "koralle"], badge: "Bestseller" },
    { name: "FJORD Trail", cat: "trail", label: "Trail", price: 169, color: "wald", colors: ["wald", "sand"] },
    { name: "DÜNE Low", cat: "lifestyle", label: "Lifestyle", price: 119, color: "sand", colors: ["sand", "eis", "glut"] },
    { name: "MOOR GTX", cat: "trail", label: "Trail · Wasserdicht", price: 189, color: "nacht", colors: ["nacht", "wald"], badge: "Wasserdicht" },
    { name: "HAFEN Classic", cat: "lifestyle", label: "Lifestyle", price: 129, color: "koralle", colors: ["koralle", "sand", "nacht"] },
  ];

  const grid = $("#grid");
  grid.innerHTML = products.map((p) => `
    <div class="fly-cell" data-cat="${p.cat}">
      <article class="card fly" data-color="${p.color}">
        <div class="card-media">
          ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
          <svg viewBox="0 0 600 300" role="img" aria-label="${p.name}"><use href="#shoe"/></svg>
        </div>
        <div class="card-body">
          <h3>${p.name}</h3>
          <span class="price">${p.price} €</span>
          <div>
            <span class="cat">${p.label}</span>
            <div class="dots">${p.colors.map((c) => `<i style="--d:${swatchHex[c]}" title="${c}"></i>`).join("")}</div>
          </div>
          <button class="add" type="button" aria-label="${p.name} in den Warenkorb" data-name="${p.name}">+</button>
        </div>
      </article>
    </div>`).join("");

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
})();
