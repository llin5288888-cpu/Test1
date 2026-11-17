// Startseite: echter 3D-Schuh (Three.js), der sich beim Scrollen natürlich dreht.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Box3, Vector3, Mesh, PlaneGeometry,
  ShadowMaterial, DirectionalLight, HemisphereLight, PMREMGenerator, ACESFilmicToneMapping,
  SRGBColorSpace, PCFSoftShadowMap, MathUtils,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

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

  /* ---------- Scroll, Texte, Anzeige (läuft auch ohne WebGL) ---------- */
  let progress = 0;
  function readScroll() {
    const rect = hero.getBoundingClientRect();
    progress = clamp(-rect.top / (hero.offsetHeight - innerHeight), 0, 1);
    bgWord.style.transform = `translate3d(${-progress * 45}%, -50%, 0)`;
    chapters.forEach((c) => c.classList.toggle("is-active", progress >= +c.dataset.from && progress < +c.dataset.to));
    return rect.bottom > 0;
  }

  /* ---------- Bewegungsmodell ---------- */
  // Der Winkel folgt dem Ziel (Scroll + Ziehen) über eine leicht unterdämpfte Feder:
  // Der Schuh beschleunigt weich, schwingt minimal nach und kommt sanft zur Ruhe.
  const START = -0.55; // leichte 3/4-Ansicht zu Beginn
  let angle = START, vel = 0;
  let drag = 0, dragVel = 0, dragging = false, lastX = 0, lastT = 0;
  let tiltX = 0, tiltY = 0, curTX = 0, curTY = 0;

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    tiltX = (e.clientX / innerWidth) * 2 - 1;
    tiltY = (e.clientY / innerHeight) * 2 - 1;
  });
  wrap.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    dragging = true; lastX = e.clientX; lastT = performance.now(); dragVel = 0;
    wrap.classList.add("dragging");
    wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const now = performance.now();
    const d = (e.clientX - lastX) * 0.012;
    drag += d;
    const dt = Math.max(1, now - lastT) / 1000;
    dragVel = MathUtils.lerp(dragVel, d / dt, 0.5); // Wurfgeschwindigkeit fürs Nachdrehen
    lastX = e.clientX; lastT = now;
  });
  const endDrag = () => { dragging = false; wrap.classList.remove("dragging"); };
  wrap.addEventListener("pointerup", endDrag);
  wrap.addEventListener("pointercancel", endDrag);

  /* ---------- Farbwahl ---------- */
  let applyVariant = () => {};
  $$(".swatches button").forEach((b) => {
    b.addEventListener("click", () => {
      hero.dataset.color = b.dataset.color;
      $$(".swatches button").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      colorName.textContent = b.getAttribute("aria-label");
      applyVariant(b.dataset.variant);
      if (!reduced) dragVel += 9; // kleiner Schwung als Rückmeldung
    });
  });

  /* ---------- Three.js ---------- */
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (err) {
    wrap.classList.add("no-webgl");
    const loop = () => { readScroll(); requestAnimationFrame(loop); };
    loop();
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.85;

  const camera = new PerspectiveCamera(28, 1, 0.01, 10);
  const target = new Vector3(0, 0.065, 0);

  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(-0.35, 0.9, 0.45);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -0.3; key.shadow.camera.right = 0.3;
  key.shadow.camera.top = 0.3; key.shadow.camera.bottom = -0.3;
  key.shadow.camera.near = 0.1; key.shadow.camera.far = 2;
  key.shadow.radius = 8;
  key.shadow.bias = -0.0005;
  scene.add(key);
  const rim = new DirectionalLight(0xbcd0ff, 1.1);
  rim.position.set(0.5, 0.35, -0.6);
  scene.add(rim);
  scene.add(new HemisphereLight(0xffffff, 0x222222, 0.35));

  const ground = new Mesh(new PlaneGeometry(2, 2), new ShadowMaterial({ opacity: 0.45 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const turntable = new Group(); // dreht um die Hochachse
  const body = new Group();      // Neigung, Schweben
  turntable.add(body);
  scene.add(turntable);

  /* ---------- Größe & Ausschnitt ---------- */
  let W = 1, H = 1, mobile = false;
  function resize() {
    W = wrap.clientWidth; H = wrap.clientHeight;
    mobile = W < 760;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    // Schuh soll auf dem Desktop ~50 % der Breite einnehmen, mobil ~85 %
    const shoeLen = 0.31;
    const frac = mobile ? 0.84 : Math.min(0.46, 700 / W);
    const tanHalf = Math.tan(MathUtils.degToRad(camera.fov / 2));
    let dist = shoeLen / (frac * 2 * tanHalf * camera.aspect);
    dist = Math.max(dist, 0.26 / (0.62 * 2 * tanHalf)); // nicht höher als ~62 % der Höhe
    const elev = MathUtils.degToRad(13);
    camera.position.set(0, target.y + Math.sin(elev) * dist, Math.cos(elev) * dist);
    camera.lookAt(target);
    // Bildausschnitt verschieben: Desktop rechts von der Mitte, mobil im oberen Drittel
    if (mobile) camera.setViewOffset(W, H, 0, H * 0.17, W, H);
    else camera.setViewOffset(W, H, -W * 0.12, 0, W, H);
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);

  /* ---------- Modell laden ---------- */
  let model = null;
  const variantCache = {};
  try {
    const bin = atob(window.SHOE_GLB_B64 || "");
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    new GLTFLoader().parse(buf.buffer, "", (gltf) => {
      model = gltf.scene;
      const box = new Box3().setFromObject(model);
      const c = box.getCenter(new Vector3());
      model.position.set(-c.x, -box.min.y, -c.z);
      model.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = true;
        o.userData.originalMaterial = o.material;
      });
      body.add(model);

      const ext = gltf.userData.gltfExtensions && gltf.userData.gltfExtensions.KHR_materials_variants;
      const names = ext ? ext.variants.map((v) => v.name.toLowerCase()) : [];
      applyVariant = (name) => {
        const idx = names.indexOf(String(name).toLowerCase());
        if (idx < 0) return;
        model.traverse(async (o) => {
          const def = o.isMesh && o.userData.gltfExtensions && o.userData.gltfExtensions.KHR_materials_variants;
          if (!def) return;
          const map = def.mappings.find((m) => m.variants.includes(idx));
          if (!map) { o.material = o.userData.originalMaterial; return; }
          const k = map.material;
          variantCache[k] = variantCache[k] || gltf.parser.getDependency("material", k);
          o.material = await variantCache[k];
          gltf.parser.assignFinalMaterial(o);
        });
      };
      const active = $(".swatches [aria-checked='true']");
      if (active) applyVariant(active.dataset.variant);
      // Shader vorab kompilieren, damit die erste Drehung nicht ruckelt
      renderer.compile(scene, camera);
      requestAnimationFrame(() => wrap.classList.add("ready"));
    }, (err) => { console.error(err); wrap.classList.add("no-webgl"); });
  } catch (err) {
    console.error(err);
    wrap.classList.add("no-webgl");
  }

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
    if (reduced) { angle = goal; vel = 0; }
    else {
      const k = 38, c = 2 * Math.sqrt(k) * 0.82; // leicht unterdämpft
      vel += (k * (goal - angle) - c * vel) * dt;
      angle += vel * dt;
    }
    curTX += (tiltX - curTX) * (1 - Math.exp(-4 * dt));
    curTY += (tiltY - curTY) * (1 - Math.exp(-4 * dt));

    if (visible) {
      const t = now / 1000;
      const float = reduced ? 0 : Math.sin(t * 1.3) * 0.006 + 0.012;
      turntable.rotation.y = angle + curTX * 0.25;
      // In Kurven leicht neigen (wie ein Objekt mit Masse), Maus kippt sanft mit
      body.rotation.z = clamp(-vel * 0.012, -0.12, 0.12) + Math.sin(progress * TAU) * 0.06;
      body.rotation.x = curTY * 0.12 + Math.sin(t * 0.9) * (reduced ? 0 : 0.015);
      body.position.y = float;
      ground.material.opacity = 0.5 - float * 8;
      renderer.render(scene, camera);

      const deg = Math.round(((((angle - START) * 180) / Math.PI) % 360 + 360) % 360);
      degreeText.textContent = deg + "°";
      degreeBar.style.strokeDashoffset = 119.4 * (1 - deg / 360);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
