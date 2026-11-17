// Baut eine einzelne, eigenständige HTML-Datei (CSS, JS und 3D-Modell eingebettet).
import { readFileSync, writeFileSync } from "node:fs";
const safe = (js) => js.replace(/<\/script/gi, "<\\/script");
let html = readFileSync("index.html", "utf8");
const css = readFileSync("style.css", "utf8");
const model = readFileSync("assets/shoe-model.js", "utf8");
const app = readFileSync("script.js", "utf8");
html = html.replace('<link rel="stylesheet" href="style.css">', () => `<style>\n${css}</style>`);
html = html.replace('<script src="assets/shoe-model.js" defer></script>\n<script src="script.js" defer></script>\n', "");
html = html.replace("</body>", () => `<script>${safe(model)}</script>\n<script>${safe(app)}</script>\n</body>`);
if (html.includes('src="script.js"') || html.includes('href="style.css"')) throw new Error("Ersetzung fehlgeschlagen");
writeFileSync(process.argv[2] || "nordlauf.html", html);
