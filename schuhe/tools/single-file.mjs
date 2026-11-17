// Baut eine einzelne, eigenständige HTML-Datei (Schriften, CSS, JS, 3D-Modell und Produktfotos eingebettet).
import { readFileSync, writeFileSync } from "node:fs";
const safe = (js) => js.replace(/<\/script/gi, "<\\/script");
let html = readFileSync("index.html", "utf8");
const css = readFileSync("assets/fonts.css", "utf8") + readFileSync("style.css", "utf8");
const photos = readFileSync("assets/product-photos.js", "utf8");
const model = readFileSync("assets/shoe-model.js", "utf8");
const app = readFileSync("script.js", "utf8");
html = html.replace('<link rel="stylesheet" href="assets/fonts.css">\n', "");
html = html.replace('<link rel="stylesheet" href="style.css">', () => `<style>\n${css}</style>`);
html = html.replace('<script src="assets/shoe-model.js" defer></script>\n<script src="assets/product-photos.js" defer></script>\n<script src="script.js" defer></script>\n', "");
html = html.replace("</body>", () => `<script>${safe(model)}</script>\n<script>${safe(photos)}</script>\n<script>${safe(app)}</script>\n</body>`);
if (/src="script.js"|href="style.css"|href="assets\/fonts.css"/.test(html)) throw new Error("Ersetzung fehlgeschlagen");
writeFileSync(process.argv[2] || "nordlauf.html", html);
