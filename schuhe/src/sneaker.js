// Prozedural modellierter Leder-Sneaker im Stil eines klassischen Low-Top-Court-Schuhs
// (flache Cupsole, Zehenkappe, Schnürleiste, Fersenkappe, gepolsterter Kragen) – ohne fremde Logos.
// Koordinaten: x = Länge (Ferse 0 → Spitze L), y = oben, z = Seite (+ außen, − innen). Einheit: Meter.
import {
  BufferGeometry, Float32BufferAttribute, Mesh, Group, Vector2, Vector3, CatmullRomCurve3, TubeGeometry,
  MeshPhysicalMaterial, MeshStandardMaterial, CanvasTexture, RepeatWrapping, DoubleSide, BackSide, FrontSide,
  ShapeUtils, SRGBColorSpace, Color, PlaneGeometry,
} from "three";

const L = 0.29;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// Monotone kubische Interpolation (Fritsch–Carlson) durch Stützpunkte [[x,y],...]
function mono(pts) {
  const n = pts.length, xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const d = [], m = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

/* ---------------- Grundform (Leisten) ---------------- */
const hwMid = mono([[0.1, 0.0335], [0.17, 0.0362], [0.33, 0.0378], [0.52, 0.0452], [0.66, 0.0488], [0.78, 0.0472], [0.89, 0.0398]]);
function halfWidth(u) {
  if (u < 0.1) { const t = (0.1 - u) / 0.1; return 0.0335 * Math.sqrt(Math.max(0, 1 - t * t)); }
  if (u > 0.89) { const t = (u - 0.89) / 0.11; return 0.0398 * Math.sqrt(Math.max(0, 1 - t * t)); }
  return hwMid(u);
}
const yBase = (u) => (u > 0.55 ? 0.022 * ((u - 0.55) / 0.45) ** 2 : 0) + (u < 0.14 ? 0.004 * ((0.14 - u) / 0.14) ** 2 : 0);
const soleH = (u) => 0.028 - 0.007 * u;
const lastMid = mono([[0, 0.135], [0.25, 0.128], [0.36, 0.1], [0.48, 0.09], [0.62, 0.078], [0.76, 0.064], [0.86, 0.053], [0.9, 0.048]]);
// Spitze im Profil abgerundet (elliptisch auslaufend)
const lastH = (u) => (u <= 0.9 ? lastMid(u) : 0.048 * Math.sqrt(Math.max(0.0004, 1 - ((u - 0.9) / 0.1) ** 2)));
const P_EXP = 0.8;
const qExp = (u) => lerp(0.5, 0.85, sstep(0.55, 0.95, u)); // vorne runder, hinten kastiger
const collarH = (u) => 0.072 - 0.011 * Math.sin(Math.PI * clamp(u / 0.36, 0, 1)) + 0.006 * sstep(0.06, 0, u);
const thetaFromH = (h, T) => (h >= T ? Math.PI / 2 : Math.asin(Math.pow(h / T, 1 / P_EXP)));
const TH0 = thetaFromH(collarH(0.34), lastH(0.34));
function thetaTop(u) {
  if (u <= 0.34) return thetaFromH(collarH(u), lastH(u));
  const a = lerp(TH0, Math.PI / 2 - 0.13, sstep(0.34, 0.74, u));
  return lerp(a, Math.PI / 2, sstep(0.73, 0.8, u));
}
const spow = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);

// Punkt auf der Schaftoberfläche: u entlang, theta 0 (außen unten) … π (innen unten)
function P(u, th, out = new Vector3()) {
  const w = halfWidth(u) * 0.965;
  const y0 = yBase(u) + soleH(u) - 0.0045; // unter die Sohlenkante gesteckt
  const T = lastH(u);
  const st = Math.max(0, Math.sin(th));
  const bulge = 1 + 0.05 * Math.sin(th) * (1 - Math.abs(Math.cos(th)));
  return out.set(u * L, y0 + T * Math.pow(st, P_EXP), w * spow(Math.cos(th), qExp(u)) * bulge);
}
const _a = new Vector3(), _b = new Vector3(), _c = new Vector3(), _d = new Vector3();
function N(u, th, out = new Vector3()) {
  const h = 1e-4;
  const uIn = u;
  u = clamp(u, 0.006, 0.994); // an Spitze und Ferse ist die Fläche entartet: Normale knapp davor nehmen
  const u0 = clamp(u - h, 0.0004, 0.9996), u1 = clamp(u + h, 0.0004, 0.9996);
  P(u1, th, _a); P(u0, th, _b); _a.sub(_b);
  const t0 = clamp(th - h, 0.0005, Math.PI - 0.0005), t1 = clamp(th + h, 0.0005, Math.PI - 0.0005);
  P(u, t1, _c); P(u, t0, _d); _c.sub(_d);
  out.crossVectors(_a, _c).normalize();
  // An Ferse/Spitze treffen sich beide Hälften: dort muss die Normale exakt nach hinten/vorne zeigen,
  // sonst klaffen versetzte Lederteile an der Mittelnaht auseinander.
  const edge = Math.min(sstep(0, 0.035, uIn), sstep(1, 0.965, uIn));
  out.z *= edge;
  return out.normalize();
}
// Seitenkoordinaten: s 0 (unten) … 1 (Oberkante), side +1 außen / −1 innen
const thOf = (u, s, side) => (side > 0 ? s * thetaTop(u) : Math.PI - s * thetaTop(u));
const SP = (u, s, side, off = 0) => {
  const th = thOf(u, s, side);
  const p = P(u, th);
  if (off) p.addScaledVector(N(u, th), off);
  return p;
};
const SN = (u, s, side) => N(u, thOf(u, s, side));

/* ---------------- Geometrie-Helfer ---------------- */
const puv = (p) => [(p.x + p.z) * 22, p.y * 22];
function gridGeometry(nu, nv, fn, flip) {
  const pos = [], nor = [], uv = [], idx = [];
  for (let i = 0; i <= nu; i++) {
    for (let j = 0; j <= nv; j++) {
      const r = fn(i / nu, j / nv);
      pos.push(r.p.x, r.p.y, r.p.z);
      nor.push(r.n.x, r.n.y, r.n.z);
      uv.push(r.uv[0], r.uv[1]);
    }
  }
  const row = nv + 1;
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const a = i * row + j, b = (i + 1) * row + j, c = i * row + j + 1, d = (i + 1) * row + j + 1;
      if (flip) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

// Lederteil auf der Schaftfläche: Bereich u0..u1, unten lo(u) bis oben hi(u), mit sichtbarer Materialkante
function panel(def, side, off, mat, group) {
  const { u0, u1, lo, hi, nu = 90, nv = 24 } = def;
  const at = (a, b, o) => {
    const u = lerp(u0, u1, a), s = lerp(lo(u), hi(u), b);
    return { u, s, p: SP(u, s, side, o), n: SN(u, s, side) };
  };
  const g = gridGeometry(nu, nv, (a, b) => {
    const r = at(a, b, off);
    return { p: r.p, n: r.n, uv: puv(r.p) };
  }, side < 0);
  group.add(new Mesh(g, mat));
  // Kante (Materialstärke) entlang aller vier Ränder
  const edges = [
    (t) => [t, 0], (t) => [t, 1], (t) => [0, t], (t) => [1, t],
  ];
  for (const e of edges) {
    const n = 60;
    const eg = gridGeometry(n, 1, (a, b) => {
      const [x, y] = e(a);
      const r = at(x, y, b ? off : 0.0002);
      return { p: r.p, n: r.n, uv: [a * 4, b] };
    }, false);
    const m = new Mesh(eg, mat);
    group.add(m);
  }
  return at;
}

// Lederteil, beschrieben über die Höhe s (s0..s1) und je Höhe einen u-Bereich uA(s)..uB(s)
function panelS(def, side, off, mat, group) {
  const { s0, s1, uA, uB, nu = 80, nv = 20, edgeTop = true } = def;
  const at = (a, b, o) => {
    const s = lerp(s0, s1, b), u = lerp(uA(s), uB(s), a);
    return { p: SP(u, s, side, o), n: SN(u, s, side) };
  };
  group.add(new Mesh(gridGeometry(nu, nv, (a, b) => { const r = at(a, b, off); return { p: r.p, n: r.n, uv: puv(r.p) }; }, side < 0), mat));
  const edges = [(t) => [t, 0], (t) => [0, t], (t) => [1, t]];
  if (edgeTop) edges.push((t) => [t, 1]);
  for (const e of edges) {
    group.add(new Mesh(gridGeometry(50, 1, (a, b) => { const [x, y] = e(a); const r = at(x, y, b ? off : 0.0002); return { p: r.p, n: r.n, uv: [a * 4, b] }; }, false), mat));
  }
}

function tube(points, radius, mat, group, opts = {}) {
  const curve = new CatmullRomCurve3(points, false, "centripetal");
  const g = new TubeGeometry(curve, opts.seg || Math.max(16, points.length * 6), radius, opts.radial || 8, false);
  if (opts.dashLen) {
    const len = curve.getLength();
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * len / opts.dashLen);
  }
  const m = new Mesh(g, mat);
  group.add(m);
  return m;
}

/* ---------------- Texturen ---------------- */
function grainTexture() {
  const S = 256, cell = 9, n = S / cell | 0;
  const pts = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n * n; i++) pts.push([rnd(), rnd()]);
  const h = new Float32Array(S * S);
  const cs = S / n;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const cx = Math.floor(x / cs), cy = Math.floor(y / cs);
    let d1 = 9, d2 = 9;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const gx = (cx + dx + n) % n, gy = (cy + dy + n) % n;
      const p = pts[gy * n + gx];
      const px = (cx + dx + p[0]) * cs, py = (cy + dy + p[1]) * cs;
      const d = Math.hypot(x - px, y - py) / cs;
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
    }
    h[y * S + x] = Math.min(1, (d2 - d1) * 2.2); // Narbenkanten: Rillen zwischen den Zellen
  }
  const c = document.createElement("canvas"); c.width = c.height = S;
  const ctx = c.getContext("2d"), img = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const hx = h[y * S + ((x + 1) % S)] - h[y * S + ((x - 1 + S) % S)];
    const hy = h[((y + 1) % S) * S + x] - h[((y - 1 + S) % S) * S + x];
    let nx = -hx * 1.2, ny = -hy * 1.2, nz = 1; const l = Math.hypot(nx, ny, nz);
    const k = (y * S + x) * 4;
    img.data[k] = (nx / l * 0.5 + 0.5) * 255; img.data[k + 1] = (ny / l * 0.5 + 0.5) * 255; img.data[k + 2] = (nz / l * 0.5 + 0.5) * 255; img.data[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}
function dashTexture() {
  const c = document.createElement("canvas"); c.width = 32; c.height = 4;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 32, 4);
  ctx.fillStyle = "#fff"; ctx.fillRect(4, 0, 20, 4);
  const t = new CanvasTexture(c);
  t.wrapS = RepeatWrapping;
  return t;
}
function treadTexture() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#808080"; ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = "#202020"; ctx.lineWidth = 4;
  for (let x = -256; x < 768; x += 14) { // Fischgrätmuster
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 40, 128); ctx.lineTo(x, 256); ctx.stroke();
  }
  for (const [cx, cy, r] of [[380, 128, 60], [90, 128, 42]]) { // Drehpunkte
    ctx.fillStyle = "#808080"; ctx.beginPath(); ctx.arc(cx, cy, r + 6, 0, 7); ctx.fill();
    for (let rr = r; rr > 6; rr -= 10) { ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 7); ctx.stroke(); }
  }
  return new CanvasTexture(c);
}
function tagTexture(text) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 96;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 256, 96);
  ctx.fillStyle = "#000"; ctx.font = "bold 44px Arial, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 50);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = RepeatWrapping;
  t.repeat.x = -1; // Etikett liegt gespiegelt auf der Zunge
  return t;
}

/* ---------------- Aufbau ---------------- */
const mudTop = (u) => lerp(0.26, 0.64, sstep(0.55, 0.95, u)) + 0.16 * sstep(0.93, 1, u);
const eyeHi = (u) => (u < 0.78 ? 1 : lerp(1, mudTop(0.9), (u - 0.78) / 0.12));
const eyeLo = (u) => lerp(0.7, mudTop(u) - 0.02, sstep(0.66, 0.84, u));
const heelFront = (s) => 0.235 - 0.075 * s + 0.03 * Math.sin(Math.PI * s);

export function buildSneaker() {
  const root = new Group();
  const grain = grainTexture();
  grain.repeat.set(1, 1);
  const leather = (hex) => new MeshPhysicalMaterial({
    color: hex, roughness: 0.5, metalness: 0, clearcoat: 0.18, clearcoatRoughness: 0.45,
    normalMap: grain, normalScale: new Vector2(0.28, 0.28), side: DoubleSide,
  });
  const mats = {
    base: leather("#f4f2ee"),
    overlay: leather("#161618"),
    collar: leather("#161618"),
    tongue: leather("#f4f2ee"),
    lining: new MeshStandardMaterial({ color: "#e9e5dd", roughness: 0.95, side: BackSide }),
    liningFront: new MeshStandardMaterial({ color: "#e9e5dd", roughness: 0.95, side: FrontSide }),
    lace: new MeshStandardMaterial({ color: "#f4f2ee", roughness: 0.85 }),
    sole: new MeshStandardMaterial({ color: "#f3f1ec", roughness: 0.62 }),
    outsole: new MeshStandardMaterial({ color: "#161618", roughness: 0.8, bumpMap: treadTexture(), bumpScale: 1.5 }),
    stitch: new MeshStandardMaterial({ color: "#ece8e0", roughness: 0.8, alphaMap: dashTexture(), alphaTest: 0.5 }),
    tag: new MeshStandardMaterial({ map: tagTexture("NORDLAUF"), roughness: 0.7 }),
  };
  const shoe = new Group();
  root.add(shoe);

  /* Schaft (Grundleder) + Futter innen */
  for (const side of [1, -1]) {
    const g = gridGeometry(140, 40, (a, b) => {
      const u = a;
      const p = SP(u, b, side);
      return { p, n: SN(u, b, side), uv: puv(p) };
    }, side < 0);
    shoe.add(new Mesh(g, mats.base));
    // Futter: gleiche Fläche, nur Rückseite sichtbar (innen)
    const g2 = gridGeometry(140, 40, (a, b) => {
      const u = a;
      return { p: SP(u, b, side, -0.0012), n: SN(u, b, side).negate(), uv: [0, 0] };
    }, side < 0);
    shoe.add(new Mesh(g2, mats.lining));
  }

  /* Aufgesetzte Lederteile */
  const OFF = 0.0013;
  const stitchRows = [];
  for (const side of [1, -1]) {
    // Vorderkappe + Schutzleiste rundum
    panel({ u0: 0.1, u1: 1, lo: () => 0, hi: mudTop, nu: 120, nv: 16 }, side, OFF, mats.overlay, shoe);
    stitchRows.push(Array.from({ length: 60 }, (_, i) => { const u = lerp(0.13, 0.995, i / 59); return SP(u, mudTop(u) - 0.05, side, OFF + 0.0005); }));
    // Schnürleiste: Band entlang der Schnürung, vorne als Riemen hinunter in die Schutzleiste
    const EYE_LO = 0.66, FRONT_TOP = 0.79, FRONT_BOT = 0.63, STRAP = 0.075;
    const sBot = mudTop(0.6) - 0.03;
    const uEnd = (s) => lerp(FRONT_BOT, FRONT_TOP, (s - sBot) / (1 - sBot));
    panelS({ s0: EYE_LO, s1: 1, uA: () => 0.335, uB: uEnd }, side, OFF * 2, mats.overlay, shoe);
    panelS({ s0: sBot, s1: EYE_LO + 0.002, uA: (s) => uEnd(s) - STRAP, uB: uEnd, edgeTop: false }, side, OFF * 2, mats.overlay, shoe);
    stitchRows.push(Array.from({ length: 50 }, (_, i) => { const u = lerp(0.35, uEnd(EYE_LO) - STRAP - 0.01, i / 49); return SP(u, EYE_LO + 0.05, side, OFF * 2 + 0.0005); }));
    stitchRows.push(Array.from({ length: 30 }, (_, i) => { const s = lerp(sBot + 0.03, 0.97, i / 29); return SP(uEnd(s) - 0.012, s, side, OFF * 2 + 0.0005); }));
    // Fersenkappe
    const heelAt = (a, b) => ({ u: lerp(0, heelFront(b), a), s: b });
    {
      const g = gridGeometry(40, 30, (a, b) => {
        const { u, s } = heelAt(a, b);
        const p = SP(u, s, side, OFF * 2);
        return { p, n: SN(u, s, side), uv: puv(p) };
      }, side < 0);
      shoe.add(new Mesh(g, mats.overlay));
      const eg = gridGeometry(50, 1, (a, b) => {
        const { u, s } = heelAt(1, a);
        return { p: SP(u, s, side, b ? OFF * 2 : 0.0002), n: SN(u, s, side), uv: [a, b] };
      }, false);
      shoe.add(new Mesh(eg, mats.overlay));
      stitchRows.push(Array.from({ length: 30 }, (_, i) => { const s = lerp(0.04, 0.97, i / 29); return SP(heelFront(s) - 0.014, s, side, OFF * 2 + 0.0005); }));
    }
  }
  for (const pts of stitchRows) tube(pts, 0.00055, mats.stitch, shoe, { dashLen: 0.0042, radial: 4 });

  /* Zunge */
  const tongueW = (u) => {
    const side = Math.abs(P(u, thetaTop(u)).z) + 0.004;
    return Math.min(side, halfWidth(u) * 0.8);
  };
  const tongueTop = 0.305;
  const tongueY = (u, b) => {
    const T = lastH(u), y0 = yBase(u) + soleH(u);
    let y = y0 + Math.min(T, T * Math.pow(Math.sin(thetaTop(u)), P_EXP)) - 0.004 - 0.009 * b * b;
    y += 0.016 * sstep(0.38, tongueTop, u);
    return y;
  };
  const tongueGeo = (offY) => gridGeometry(70, 20, (a, bb) => {
    const u = lerp(tongueTop, 0.82, a), b = bb * 2 - 1;
    const round = u < tongueTop + 0.02 ? Math.pow(Math.max(0.0001, 1 - ((tongueTop + 0.02 - u) / 0.02) ** 4), 0.25) : 1;
    const p = new Vector3(u * L - (u < 0.36 ? (0.36 - u) * 0.05 : 0), tongueY(u, b) + offY, b * tongueW(u) * round);
    const n = new Vector3(-0.15, 1, b * 0.6).normalize();
    return { p, n, uv: [u * L * 30, b * 1.5] };
  }, true);
  shoe.add(new Mesh(tongueGeo(0), mats.tongue));
  const tb = new Mesh(tongueGeo(-0.003), mats.liningFront);
  tb.geometry.index.array.reverse();
  shoe.add(tb);
  // Zungenetikett
  const tag = new Mesh(new PlaneGeometry(0.024, 0.009), mats.tag);
  const tu = 0.335;
  tag.position.set(tu * L - 0.0006, tongueY(tu, 0) + 0.0012, 0);
  tag.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
  tag.rotateX(-0.55);
  shoe.add(tag);

  /* Gepolsterter Kragen */
  {
    const pts = [];
    for (let i = 0; i <= 40; i++) { const u = lerp(0.37, 0.002, i / 40); pts.push(SP(u, 1, 1, -0.0035).add(new Vector3(0, -0.0035, 0))); }
    for (let i = 1; i <= 40; i++) { const u = lerp(0.002, 0.37, i / 40); pts.push(SP(u, 1, -1, -0.0035).add(new Vector3(0, -0.0035, 0))); }
    const col = tube(pts, 0.0048, mats.collar, shoe, { seg: 200, radial: 14 });
    col.scale.set(1, 1, 1);
  }
  /* Fersenlasche */
  {
    const tab = gridGeometry(10, 8, (a, b) => {
      const s = lerp(0.6, 1.0, a), z = (b - 0.5) * 0.022;
      const base = SP(0, s, 1, OFF * 3);
      const p = new Vector3(base.x - 0.0005 - 0.0015 * a, base.y + a * 0.006, z * (1 - 0.3 * a * a));
      return { p, n: new Vector3(-1, 0.1, 0).normalize(), uv: puv(p) };
    }, true);
    shoe.add(new Mesh(tab, mats.overlay));
  }
  /* Schnürung */
  {
    const K = 6, eyes = { 1: [], [-1]: [] };
    for (let k = 0; k <= K; k++) {
      const u = 0.385 + k * 0.059;
      for (const side of [1, -1]) eyes[side].push(SP(u, 0.9, side, OFF * 2 + 0.0015));
    }
    const lift = (a, b, extra = 0.0045) => {
      const m = a.clone().add(b).multiplyScalar(0.5);
      const u = m.x / L;
      m.y = Math.max(m.y, tongueY(u, 0)) + extra;
      return m;
    };
    const R = 0.0023;
    tube([eyes[1][0], lift(eyes[1][0], eyes[-1][0], 0.003), eyes[-1][0]], R, mats.lace, shoe);
    for (let k = 0; k < K; k++) {
      tube([eyes[1][k], lift(eyes[1][k], eyes[-1][k + 1]), eyes[-1][k + 1]], R, mats.lace, shoe);
      tube([eyes[-1][k], lift(eyes[-1][k], eyes[1][k + 1], 0.0058), eyes[1][k + 1]], R, mats.lace, shoe);
    }
    // Schleife oben
    const top = lift(eyes[1][0], eyes[-1][0], 0.005);
    for (const side of [1, -1]) {
      const z = side * 0.022;
      tube([top, new Vector3(top.x - 0.004, top.y + 0.004, z * 0.6), new Vector3(top.x + 0.012, top.y + 0.002, z * 1.25), new Vector3(top.x + 0.016, top.y - 0.006, z * 0.9), top.clone().add(new Vector3(0.002, 0, 0))], R, mats.lace, shoe, { seg: 40 });
    }
    // Ösen
    for (const side of [1, -1]) for (const e of eyes[side]) {
      const ring = tube(Array.from({ length: 13 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const n = SN(e.x / L, 0.9, side);
        const t1 = new Vector3(1, 0, 0), t2 = new Vector3().crossVectors(n, t1).normalize();
        return e.clone().addScaledVector(n, -0.001).addScaledVector(t1, Math.cos(a) * 0.0032).addScaledVector(t2, Math.sin(a) * 0.0032);
      }), 0.0007, mats.overlay, shoe, { seg: 24, radial: 5 });
      ring.renderOrder = 1;
    }
  }

  /* Sohle (Cupsole) */
  {
    const outline = [];
    const M = 110;
    for (let i = 0; i <= M; i++) { const u = (1 - Math.cos(Math.PI * i / M)) / 2; outline.push([u, 1]); }
    for (let i = M - 1; i >= 1; i--) { const u = (1 - Math.cos(Math.PI * i / M)) / 2; outline.push([u, -1]); }
    const base = outline.map(([u, sd]) => new Vector2(u * L, sd * halfWidth(u)));
    const cnt = base.length;
    const nrm = base.map((p, i) => {
      const a = base[(i - 1 + cnt) % cnt], b = base[(i + 1) % cnt];
      return new Vector2(b.y - a.y, -(b.x - a.x)).normalize();
    });
    // nach außen zeigen lassen
    if (nrm[M >> 1].y < 0) nrm.forEach((n) => n.negate());
    const rows = (f) => [[-0.003, 0], [0.0012, 0.0006], [0.0024, 0.0028], [0.0026, f * 0.42], [0.0016, f * 0.47], [0.0016, f * 0.53], [0.0026, f * 0.58], [0.0028, f - 0.0022], [0.0018, f - 0.0004], [-0.0002, f], [-0.0045, f - 0.0004]];
    const R = rows(0).length;
    const pos = [], idx = [], uv = [];
    for (let r = 0; r < R; r++) for (let i = 0; i < cnt; i++) {
      const u = outline[i][0];
      const [d, y] = rows(soleH(u))[r];
      const p = base[i].clone().addScaledVector(nrm[i], d + 0.0018);
      pos.push(p.x, yBase(u) + y, p.y); uv.push(i / cnt, r / R);
    }
    for (let r = 0; r < R - 1; r++) for (let i = 0; i < cnt; i++) {
      const a = r * cnt + i, b = r * cnt + (i + 1) % cnt, c = (r + 1) * cnt + i, d = (r + 1) * cnt + (i + 1) % cnt;
      idx.push(a, b, c, b, d, c);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    // Ausrichtung prüfen: Normale an einem Seitenpunkt soll nach außen zeigen
    const nz = g.attributes.normal.getZ(3 * cnt + (M >> 1));
    if (nz < 0) { g.index.array.reverse(); g.computeVertexNormals(); }
    shoe.add(new Mesh(g, mats.sole));

    // Laufsohle unten + Brandsohle oben
    const flat = (d, yfn, mat, flipUp) => {
      const pts = base.map((p, i) => p.clone().addScaledVector(nrm[i], d));
      const tris = ShapeUtils.triangulateShape(pts, []);
      const P3 = [], UV = [];
      pts.forEach((p, i) => { const u = outline[i][0]; P3.push(p.x, yfn(u), p.y); UV.push(p.x / L, p.y / 0.11 + 0.5); });
      const I = [];
      tris.forEach(([a, b, c]) => (flipUp ? I.push(a, c, b) : I.push(a, b, c)));
      const fg = new BufferGeometry();
      fg.setAttribute("position", new Float32BufferAttribute(P3, 3));
      fg.setAttribute("uv", new Float32BufferAttribute(UV, 2));
      fg.setIndex(I);
      fg.computeVertexNormals();
      if ((fg.attributes.normal.getY(0) > 0) !== flipUp) { fg.index.array.reverse(); fg.computeVertexNormals(); }
      shoe.add(new Mesh(fg, mat));
    };
    flat(-0.002, (u) => yBase(u), mats.outsole, false);
    flat(-0.006, (u) => yBase(u) + soleH(u) - 0.0012, mats.liningFront, true);
    // Sohlennaht rundum
    const stitch = [];
    for (let i = 0; i < cnt; i += 2) {
      const u = outline[i][0];
      const p = base[i].clone().addScaledVector(nrm[i], 0.0018 + 0.0029);
      stitch.push(new Vector3(p.x, yBase(u) + soleH(u) * 0.8, p.y));
    }
    stitch.push(stitch[0].clone());
    tube(stitch, 0.0006, mats.stitch, shoe, { seg: 600, radial: 4, dashLen: 0.0045 });
  }

  // Zentrieren
  shoe.position.set(-L / 2, 0, 0);
  return { root, mats };
}

export const SNEAKER_LENGTH = L;
