// Bettet das GLB-Modell als Base64 in eine normale JS-Datei ein,
// damit die Seite auch per Doppelklick (file://) lädt, wo fetch() auf lokale Dateien blockiert ist.
import { readFileSync, writeFileSync } from "node:fs";
const [src, out] = process.argv.slice(2);
const b64 = readFileSync(src).toString("base64");
writeFileSync(out, `/* 3D-Modell "boing01白" von yihsuanchen13 (Sketchfab), CC BY 4.0, über paprika3D optimiert */\nwindow.SHOE_GLB_B64="${b64}";\n`);
