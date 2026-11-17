// Farbvarianten: steuern den 3D-Schuh, den schwimmenden Hintergrund und die Farben der ganzen Seite.
// shoe:  upper = Leder (Obermaterial), sole = Plateau-Sohle
// page:  bg = Grundfarbe, blobs = schwimmende Farbflecken, text/muted/hot/onHot = Schrift & Akzente
export const THEMES = [
  {
    id: "panda", name: "Panda",
    shoe: { upper: "#1c1c1e", sole: "#f4f2ee" },
    page: { bg: "#d8d5cf", blobs: ["#f6f4f0", "#a9a59d", "#ebe8e3"], text: "#151515", muted: "#55524c", hot: "#151515", onHot: "#f4f2ee" },
  },
  {
    id: "cognac", name: "Cognac",
    shoe: { upper: "#8a4521", sole: "#efe6d6" },
    page: { bg: "#2b150a", blobs: ["#7a3814", "#c06a2c", "#4a210c"], text: "#fbf1e6", muted: "#d9bea6", hot: "#f0a35e", onHot: "#2b150a" },
  },
  {
    id: "salbei", name: "Salbei",
    shoe: { upper: "#6f8a6b", sole: "#f1ede3" },
    page: { bg: "#1b2a1f", blobs: ["#3f5e44", "#86a081", "#28402e"], text: "#eef3ea", muted: "#b6c6b0", hot: "#c5dcb3", onHot: "#1b2a1f" },
  },
  {
    id: "bordeaux", name: "Bordeaux",
    shoe: { upper: "#5a1422", sole: "#f3efe8" },
    page: { bg: "#22070d", blobs: ["#6b1c2a", "#a8344b", "#3b0d17"], text: "#fbeff1", muted: "#dbb0b8", hot: "#ff9aab", onHot: "#22070d" },
  },
  {
    id: "marine", name: "Marine",
    shoe: { upper: "#1e2c4f", sole: "#f2f2f0" },
    page: { bg: "#0a1124", blobs: ["#1e2c4f", "#3a5a9e", "#111a36"], text: "#eef1f8", muted: "#a9b4cc", hot: "#9db8ff", onHot: "#0a1124" },
  },
  {
    id: "schwarz", name: "Schwarz",
    shoe: { upper: "#1c1c1e", sole: "#1c1c1e" },
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
