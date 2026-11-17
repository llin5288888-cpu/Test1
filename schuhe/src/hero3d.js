// Startseite: 3D-Leder-Sneaker (Three.js), steht hochkant und dreht sich beim Scrollen.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Box3, Vector3, Mesh, PlaneGeometry, Color,
  ShadowMaterial, DirectionalLight, HemisphereLight, PMREMGenerator, ACESFilmicToneMapping,
  SRGBColorSpace, VSMShadowMap, MathUtils,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { THEMES, themeById, applyPageColors } from "./themes.js";
import { createLiquid } from "./liquid.js";
import { loadShoe } from "./shoeModel.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const TAU = Math.PI * 2;

export function initHero() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = $("#hero");
  const wrap = $("#shoeWrap");
  const canvas = $("#shoeCanvas");
  const bgWord = $("#bgWord");
  const chapters = $$(".chapter");
  const degreeText = $("#degreeText");
  const degreeBar = $("#degreeBar");
  const colorName = $("#colorName");
  const swatchBox = $("#swatches");

  /* ---------- Farbwahl + schwimmender Hintergrund ---------- */
  let theme = THEMES[0];
  applyPageColors(theme);
  const liquid = createLiquid($("#liquid"), theme, reduced);
  let onTheme = () => {};

  swatchBox.innerHTML = THEMES.map((t, i) => `<button type="button" role="radio" aria-checked="${i === 0}" aria-label="${t.name}" data-id="${t.id}" style="--sw:linear-gradient(135deg, ${t.shoe.upper} 55%, ${t.shoe.sole} 55%)"></button>`).join("");
  function setTheme(id, originEl) {
    const next = themeById(id);
    if (next === theme) return;
    theme = next;
    const btn = $(`[data-id="${id}"]`, swatchBox);
    $$("button", swatchBox).forEach((x) => x.setAttribute("aria-checked", String(x === btn)));
    colorName.textContent = theme.name;
    const r = (originEl || btn).getBoundingClientRect();
    liquid.pour(theme, r.left + r.width / 2, r.top + r.height / 2);
    applyPageColors(theme);
    onTheme(theme);
  }
  $$("button", swatchBox).forEach((b) => b.addEventListener("click", () => setTheme(b.dataset.id)));

  /* ---------- Scroll, Texte, Anzeige ---------- */
  let progress = 0;
  function readScroll() {
    const rect = hero.getBoundingClientRect();
    progress = clamp(-rect.top / (hero.offsetHeight - innerHeight), 0, 1);
    bgWord.style.transform = `translate3d(${-progress * 45}%, -50%, 0)`;
    chapters.forEach((c) => c.classList.toggle("is-active", progress >= +c.dataset.from && progress < +c.dataset.to));
    return rect.bottom > 0;
  }

  /* ---------- Bewegungsmodell ---------- */
  // Winkel folgt dem Ziel (Scroll + Ziehen) über eine leicht unterdämpfte Feder.
  const START = 0.5; // Start: Schnürung und Außenseite im Blick
  let angle = START, vel = 0;
  let drag = 0, dragVel = 0, dragging = false, lastX = 0, lastY = 0, lastT = 0;
  let pitch = 0, pitchVel = 0, pitchGoal = 0; // senkrechtes Kippen mit der Maus
  let tiltX = 0, tiltY = 0, curTX = 0, curTY = 0;

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    tiltX = (e.clientX / innerWidth) * 2 - 1;
    tiltY = (e.clientY / innerHeight) * 2 - 1;
  });
  wrap.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    dragging = true; lastX = e.clientX; lastY = e.clientY; lastT = performance.now(); dragVel = 0;
    wrap.classList.add("dragging");
    wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const now = performance.now();
    const d = (e.clientX - lastX) * 0.012;
    drag += d;
    if (e.pointerType === "mouse") pitchGoal = clamp(pitchGoal + (e.clientY - lastY) * 0.006, -0.7, 0.7);
    const dt = Math.max(1, now - lastT) / 1000;
    dragVel = MathUtils.lerp(dragVel, d / dt, 0.5);
    lastX = e.clientX; lastY = e.clientY; lastT = now;
  });
  const endDrag = () => { dragging = false; pitchGoal = 0; wrap.classList.remove("dragging"); };
  wrap.addEventListener("pointerup", endDrag);
  wrap.addEventListener("pointercancel", endDrag);

  /* ---------- Three.js ---------- */
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (err) {
    wrap.classList.add("no-webgl");
    const loop = () => { readScroll(); requestAnimationFrame(loop); };
    loop();
    return { setTheme };
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = VSMShadowMap; // weiche, unscharfe Schattenkanten

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.9;

  const camera = new PerspectiveCamera(26, 1, 0.01, 10);
  const target = new Vector3(0, 0, 0);

  const key = new DirectionalLight(0xffffff, 2.4);
  key.position.set(-0.4, 1.0, 0.55);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -0.3, right: 0.3, top: 0.3, bottom: -0.3, near: 0.1, far: 3 });
  key.shadow.mapSize.set(512, 512);
  key.shadow.radius = 14;
  key.shadow.blurSamples = 20;
  key.shadow.bias = -0.0005;
  scene.add(key);
  const rim = new DirectionalLight(0xfff2e0, 1.3);
  rim.position.set(0.6, 0.3, -0.5);
  scene.add(rim);
  scene.add(new HemisphereLight(0xffffff, 0x332211, 0.35));

  const ground = new Mesh(new PlaneGeometry(3, 3), new ShadowMaterial({ opacity: 0.3 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.21;
  ground.receiveShadow = true;
  scene.add(ground);

  // Gruppen: lean (Neigung/Schweben) > turntable (Drehung um die Hochachse) > upright (hochkant) > Modell
  const lean = new Group();
  const turntable = new Group();
  const upright = new Group();
  upright.rotation.z = MathUtils.degToRad(78); // Spitze nach oben, leicht schräg
  lean.add(turntable); turntable.add(upright); scene.add(lean);

  /* ---------- Größe & Ausschnitt ---------- */
  let W = 1, H = 1, mobile = false;
  function resize() {
    W = wrap.clientWidth; H = wrap.clientHeight;
    mobile = W < 760;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const tall = 0.3; // Höhe des hochkant stehenden Schuhs (Modelleinheiten)
    const frac = mobile ? 0.46 : 0.64; // Anteil an der Bildhöhe
    const tanHalf = Math.tan(MathUtils.degToRad(camera.fov / 2));
    let dist = tall / (frac * 2 * tanHalf);
    dist = Math.max(dist, 0.2 / ((mobile ? 0.8 : 0.4) * 2 * tanHalf * camera.aspect)); // nicht zu breit
    const elev = MathUtils.degToRad(6);
    camera.position.set(0, Math.sin(elev) * dist, Math.cos(elev) * dist);
    camera.lookAt(target);
    if (mobile) camera.setViewOffset(W, H, 0, H * 0.16, W, H);
    else camera.setViewOffset(W, H, -W * 0.12, H * 0.035, W, H);
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);

  /* ---------- Modell ---------- */
  const keys = ["upper", "sole"];
  const from = {}, to = {};
  let colors = null, colorT = 1;
  onTheme = (t) => {
    if (!colors) return;
    for (const k of keys) { from[k] = colors[k].clone(); to[k] = new Color(t.shoe[k]); }
    colorT = reduced ? 0.999 : 0;
  };
  loadShoe(window.SHOE_GLB_B64 || "").then((shoe) => {
    const box = new Box3().setFromObject(shoe.root);
    shoe.root.position.sub(box.getCenter(new Vector3()));
    upright.add(shoe.root);
    colors = shoe.colors;
    for (const k of keys) colors[k].set(theme.shoe[k]);
    renderer.compile(scene, camera);
    requestAnimationFrame(() => wrap.classList.add("ready"));
  }).catch((err) => { console.error(err); wrap.classList.add("no-webgl"); });

  /* ---------- Animationsschleife ---------- */
  let prev = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    const visible = readScroll();

    if (!dragging) {
      drag += dragVel * dt;
      dragVel *= Math.exp(-2.6 * dt); // Reibung: Schwung läuft natürlich aus
    }
    const goal = START + progress * TAU + drag;
    if (reduced) { angle = goal; vel = 0; pitch = pitchGoal; }
    else {
      const k = 38, c = 2 * Math.sqrt(k) * 0.82;
      vel += (k * (goal - angle) - c * vel) * dt;
      angle += vel * dt;
      const kp = 30, cp = 2 * Math.sqrt(kp) * 0.7;
      pitchVel += (kp * (pitchGoal - pitch) - cp * pitchVel) * dt;
      pitch += pitchVel * dt;
    }
    curTX += (tiltX - curTX) * (1 - Math.exp(-4 * dt));
    curTY += (tiltY - curTY) * (1 - Math.exp(-4 * dt));

    if (colorT < 1 && colors) {
      colorT = Math.min(1, colorT + dt / 1.1);
      const e = colorT < 0.5 ? 2 * colorT * colorT : 1 - Math.pow(-2 * colorT + 2, 2) / 2;
      for (const k of keys) colors[k].lerpColors(from[k], to[k], e);
    }

    if (visible && !document.documentElement.dataset.pdp) { // pausiert, solange die Produktseite offen ist
      const t = now / 1000;
      turntable.rotation.y = angle + curTX * 0.3;
      lean.rotation.z = clamp(-vel * 0.012, -0.14, 0.14) + Math.sin(progress * TAU) * 0.05;
      lean.rotation.x = pitch + curTY * 0.12 + (reduced ? 0 : Math.sin(t * 0.9) * 0.02);
      lean.position.y = reduced ? 0 : Math.sin(t * 1.3) * 0.006;
      renderer.render(scene, camera);

      const deg = Math.round(((((angle - START) * 180) / Math.PI) % 360 + 360) % 360) % 360;
      degreeText.textContent = deg + "°";
      degreeBar.style.strokeDashoffset = 119.4 * (1 - deg / 360);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { setTheme };
}
