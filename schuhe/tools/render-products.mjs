// Erzeugt die Produktfotos der Kollektion im virtuellen Fotostudio (src/studio.js).
// Aufruf: npm run photos   (benötigt Playwright mit Chromium)
// Ergebnis: assets/products/<id>.jpg und assets/product-photos.js (Daten-URLs, damit die Seite per Doppelklick läuft)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { THEMES } from "../src/themes.js";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const products = JSON.parse(readFileSync("src/products.json", "utf8"));
const W = 1200, H = 900;

execSync("npx esbuild src/studio-entry.js --bundle --format=iife --outfile=tools/studio-bundle.js --log-level=warning", { stdio: "inherit" });
mkdirSync("assets/products", { recursive: true });

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on("pageerror", (e) => console.error(e.message));
await page.goto("file://" + process.cwd() + "/tools/studio.html");
await page.waitForFunction(() => window.createStudio);

const shots = products.map((p) => ({
  id: p.id,
  colors: THEMES.find((t) => t.id === p.theme).shoe,
  backdrop: p.backdrop, yaw: p.yaw, camPos: p.cam, target: [0.005, 0.042, 0],
}));
const modelB64 = readFileSync("assets/shoe.glb").toString("base64");
const urls = await page.evaluate(async ({ shots, W, H, modelB64 }) => {
  const studio = await window.createStudio(document.getElementById("c"), W, H, modelB64);
  return shots.map((s) => studio.shoot(s));
}, { shots, W, H, modelB64 });
await browser.close();

const map = {};
urls.forEach((url, i) => {
  writeFileSync(`assets/products/${shots[i].id}.jpg`, Buffer.from(url.split(",")[1], "base64"));
  map[shots[i].id] = url;
});
writeFileSync("assets/product-photos.js", `/* Produktfotos – erzeugt mit tools/render-products.mjs */\nwindow.PRODUCT_PHOTOS=${JSON.stringify(map)};\n`);
console.log("Fotos:", Object.keys(map).join(", "));
