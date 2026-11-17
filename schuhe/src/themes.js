// Farbvarianten: steuern den 3D-Schuh, den schwimmenden Hintergrund und die Farben der ganzen Seite.
// shoe:  base = Grundleder, overlay = Aufnäher (Kappe, Schnürleiste, Ferse), collar = Kragen,
//        lace = Senkel, sole = Sohle, outsole = Laufsohle, lining = Futter
// page:  bg = Grundfarbe, blobs = schwimmende Farbflecken, text/muted/hot/onHot = Schrift & Akzente
export const THEMES = [
  {
    id: "panda", name: "Panda",
    shoe: { base: "#f4f2ee", overlay: "#18181a", collar: "#18181a", lace: "#f4f2ee", sole: "#f4f2ee", outsole: "#18181a", lining: "#f4f2ee" },
    page: { bg: "#d8d5cf", blobs: ["#f6f4f0", "#a9a59d", "#ebe8e3"], text: "#151515", muted: "#55524c", hot: "#151515", onHot: "#f4f2ee" },
  },
  {
    id: "cognac", name: "Cognac",
    shoe: { base: "#d8b38a", overlay: "#7a3b1c", collar: "#7a3b1c", lace: "#f1e8d8", sole: "#f1e8d8", outsole: "#9a5a2c", lining: "#d8b38a" },
    page: { bg: "#2b150a", blobs: ["#7a3814", "#c06a2c", "#4a210c"], text: "#fbf1e6", muted: "#d9bea6", hot: "#f0a35e", onHot: "#2b150a" },
  },
  {
    id: "salbei", name: "Salbei",
    shoe: { base: "#f1ede3", overlay: "#6f8a6b", collar: "#6f8a6b", lace: "#f1ede3", sole: "#f1ede3", outsole: "#6f8a6b", lining: "#f1ede3" },
    page: { bg: "#1b2a1f", blobs: ["#3f5e44", "#86a081", "#28402e"], text: "#eef3ea", muted: "#b6c6b0", hot: "#c5dcb3", onHot: "#1b2a1f" },
  },
  {
    id: "bordeaux", name: "Bordeaux",
    shoe: { base: "#f3efe8", overlay: "#5a1422", collar: "#5a1422", lace: "#f3efe8", sole: "#f3efe8", outsole: "#5a1422", lining: "#f3efe8" },
    page: { bg: "#22070d", blobs: ["#6b1c2a", "#a8344b", "#3b0d17"], text: "#fbeff1", muted: "#dbb0b8", hot: "#ff9aab", onHot: "#22070d" },
  },
  {
    id: "marine", name: "Marine",
    shoe: { base: "#c9ccd3", overlay: "#1e2c4f", collar: "#1e2c4f", lace: "#f2f2f0", sole: "#f2f2f0", outsole: "#1e2c4f", lining: "#c9ccd3" },
    page: { bg: "#0a1124", blobs: ["#1e2c4f", "#3a5a9e", "#111a36"], text: "#eef1f8", muted: "#a9b4cc", hot: "#9db8ff", onHot: "#0a1124" },
  },
  {
    id: "schwarz", name: "Schwarz",
    shoe: { base: "#222226", overlay: "#121214", collar: "#121214", lace: "#222226", sole: "#1d1d20", outsole: "#101012", lining: "#2a2a2e", stitch: "#46464c" },
    page: { bg: "#0b0b0d", blobs: ["#2a2a31", "#45454f", "#16161a"], text: "#f3f0ea", muted: "#a9a59e", hot: "#d9b77a", onHot: "#111111" },
  },
];

export const themeById = (id) => THEMES.find((t) => t.id === id) || THEMES[0];

export function applyPageColors(theme) {
  const root = document.documentElement;
  const p = theme.page;
  root.style.setProperty("--bg", p.bg);
  root.style.setProperty("--text", p.text);
  root.style.setProperty("--muted", p.muted);
  root.style.setProperty("--hot", p.hot);
  root.style.setProperty("--on-hot", p.onHot);
  // Zusätzlich direkt setzen: wirkt auch in Browsern ohne animierbare CSS-Variablen
  root.style.backgroundColor = p.bg;
  root.dataset.theme = theme.id;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = p.bg;
}
