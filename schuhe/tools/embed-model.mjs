// Bettet das GLB-Modell und die Ledermaske als Base64 in eine normale JS-Datei ein.
// So lädt die Seite auch per Doppelklick (file://), wo fetch() auf lokale Dateien blockiert ist.
import { readFileSync, writeFileSync } from "node:fs";
const [src, mask, out] = process.argv.slice(2);
const glb = readFileSync(src).toString("base64");
const m = readFileSync(mask).toString("base64");
writeFileSync(out, `/* 3D-Modell basiert auf "Materials Variants Shoe" (c) 2021 Shopify, CC BY 4.0 - zu Leder umgearbeitet */\nwindow.SHOE_GLB_B64="${glb}";\nwindow.SHOE_MASK="data:image/jpeg;base64,${m}";\n`);
