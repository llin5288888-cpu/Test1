// Lederfarben: steuern den 3D-Schuh, den schwimmenden Hintergrund und die Farben der ganzen Seite.
// shoe:  upper = Obermaterial, overlay = Aufnäher, sole = Sohle, trim = Schnürsenkel & Futter
// page:  bg = Grundfarbe, blobs = schwimmende Farbflecken, text/muted/hot/onHot = Schrift & Akzente
export const THEMES = [
  {
    id: "cognac", name: "Cognac",
    shoe: { upper: "#8a4521", overlay: "#5a2a12", sole: "#f1e8d8", trim: "#e9dcc6" },
    page: { bg: "#2b150a", blobs: ["#7a3814", "#c06a2c", "#4a210c"], text: "#fbf1e6", muted: "#d9bea6", hot: "#f0a35e", onHot: "#2b150a" },
  },
  {
    id: "weiss", name: "Weiß",
    shoe: { upper: "#f2eee7", overlay: "#ddd5c8", sole: "#fbfaf6", trim: "#ece6db" },
    page: { bg: "#d4cab8", blobs: ["#efe8dc", "#b5a78e", "#e2d9c9"], text: "#1b1712", muted: "#5f584e", hot: "#1b1712", onHot: "#f3eee6" },
  },
  {
    id: "schwarz", name: "Schwarz",
    shoe: { upper: "#1c1c1f", overlay: "#2c2c31", sole: "#f0ede6", trim: "#18181a" },
    page: { bg: "#0b0b0d", blobs: ["#2a2a31", "#45454f", "#16161a"], text: "#f3f0ea", muted: "#a9a59e", hot: "#d9b77a", onHot: "#111111" },
  },
  {
    id: "salbei", name: "Salbei",
    shoe: { upper: "#7d927a", overlay: "#5a6f56", sole: "#f1eee4", trim: "#ebe6d8" },
    page: { bg: "#1b2a1f", blobs: ["#3f5e44", "#86a081", "#28402e"], text: "#eef3ea", muted: "#b6c6b0", hot: "#c5dcb3", onHot: "#1b2a1f" },
  },
  {
    id: "bordeaux", name: "Bordeaux",
    shoe: { upper: "#6b1c2a", overlay: "#45101b", sole: "#f3ebe3", trim: "#2a0b11" },
    page: { bg: "#22070d", blobs: ["#6b1c2a", "#a8344b", "#3b0d17"], text: "#fbeff1", muted: "#dbb0b8", hot: "#ff9aab", onHot: "#22070d" },
  },
  {
    id: "marine", name: "Marine",
    shoe: { upper: "#1e2c4f", overlay: "#121d3a", sole: "#f4f2ee", trim: "#e9e5dc" },
    page: { bg: "#0a1124", blobs: ["#1e2c4f", "#3a5a9e", "#111a36"], text: "#eef1f8", muted: "#a9b4cc", hot: "#9db8ff", onHot: "#0a1124" },
  },
];

export function applyPageColors(theme) {
  const r = document.documentElement.style;
  const p = theme.page;
  r.setProperty("--bg", p.bg);
  r.setProperty("--text", p.text);
  r.setProperty("--muted", p.muted);
  r.setProperty("--hot", p.hot);
  r.setProperty("--on-hot", p.onHot);
  document.documentElement.dataset.theme = theme.id;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = p.bg;
}
