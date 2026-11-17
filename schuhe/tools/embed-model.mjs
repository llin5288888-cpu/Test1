// Bettet das GLB-Modell als Base64 in eine normale JS-Datei ein.
// So lädt die Seite auch per Doppelklick (file://), wo fetch() auf lokale Dateien blockiert ist.
import { readFileSync, writeFileSync } from "node:fs";
const [src, out] = process.argv.slice(2);
const b64 = readFileSync(src).toString("base64");
writeFileSync(out, `/* 3D-Modell "Materials Variants Shoe" (c) 2021 Shopify, CC BY 4.0 - Texturen auf 1024 px verkleinert */\nwindow.SHOE_GLB_B64="${b64}";\n`);
