// Bettet die Schriften (Inter, Archivo Black – SIL Open Font License) als Base64 in assets/fonts.css ein.
// So lädt die Seite keine Schriften von fremden Servern (Datenschutz) und funktioniert auch offline.
import { readFileSync, writeFileSync } from "node:fs";
const f = (pkg, file) => readFileSync(`node_modules/@fontsource/${pkg}/files/${file}`).toString("base64");
const face = (family, weight, b64) =>
  `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${b64}) format("woff2");}`;
const css = [
  "/* Schriften: Inter und Archivo Black, SIL Open Font License 1.1 (über @fontsource) */",
  face("Archivo Black", 400, f("archivo-black", "archivo-black-latin-400-normal.woff2")),
  ...[400, 500, 600, 700].map((w) => face("Inter", w, f("inter", `inter-latin-${w}-normal.woff2`))),
].join("\n");
writeFileSync("assets/fonts.css", css + "\n");
console.log("assets/fonts.css", Math.round(css.length / 1024), "KB");
