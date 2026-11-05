// Partie mécanique du score anti-IA (méthode docs/humanizer/humanizer-fr.md).
// Usage : bun docs/humanizer/score.mjs <export.md | brouillon.json> [motifs_distincts] [--negations]
// Lit un export_content_compact (ou un brouillon JSON du pipeline), ignore code, tableaux, titres et commentaires,
// puis calcule rythme (B), lexique (V), tirets cadratins et négations.
import { readFileSync } from "node:fs";

const [path, motifsArg] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!path) {
    console.error("Usage : bun docs/humanizer/score.mjs <export.md | brouillon.json> [motifs_distincts] [--negations]");
    process.exit(1);
}

// Un brouillon JSON du pipeline (cours.json, slides.json, tp.json, examen.json) est
// d'abord exporté au format d'export_content_compact, comme le fait `brouillon.ts exporter`.
async function lireTexte(fichier) {
    if (!fichier.toLowerCase().endsWith(".json")) return readFileSync(fichier, "utf8");
    const { exporter, typeDuFichier } = await import("../../src/scripts/brouillon.ts");
    const blocs = JSON.parse(readFileSync(fichier, "utf8").replace(/^﻿/, ""));
    return exporter(blocs, typeDuFichier(fichier), "brouillon");
}

const raw = (await lireTexte(path))
    .replace(/```[\s\S]*?```/g, "\n")
    .replace(/<!--[\s\S]*?-->/g, "\n");

const prose = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("|") && !l.startsWith("#") && !l.startsWith("📎") && !/^_[^_]+_$/.test(l))
    .map((l) => l.replace(/^>\s*/, "").replace(/^(\d+\.|[-*])\s+/, ""))
    .join("\n");

const sentences = prose
    .split(/(?<=[.!?…])\s+|\n/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 2);
const lengths = sentences.map((s) => s.split(/\s+/).length);
const words = lengths.reduce((a, b) => a + b, 0);
const mean = words / Math.max(lengths.length, 1);
const sd = Math.sqrt(lengths.reduce((a, l) => a + (l - mean) ** 2, 0) / Math.max(lengths.length, 1));
const cov = mean ? sd / mean : 0;

const LEXIQUE = [
    "permet de", "permettent de", "permettant", "afin de", "afin que", "il est important",
    "il est essentiel", "il est nécessaire", "veillez", "n'hésitez pas", "il convient",
    "à noter", "notons que", "notamment", "en effet", "par ailleurs", "de plus", "en outre",
    "crucial", "essentiel", "fondamental", "robuste", "optimal", "incontournable",
    "véritable", "s'assurer", "assurez-vous", "garantir", "garantit", "au sein de",
    "dans le cadre de", "en termes de", "mettre en œuvre", "mise en œuvre", "mettre en place",
    "mise en place", "faire en sorte", "il s'agit de", "constitue", "à ce stade",
    "désormais", "dorénavant", "ainsi que", "en ce qui concerne", "au niveau de",
];
const lower = prose.toLowerCase().replace(/’/g, "'");
const lexHits = {};
for (const w of LEXIQUE) {
    const n = lower.split(w).length - 1;
    if (n) lexHits[w] = n;
}
const lexTotal = Object.values(lexHits).reduce((a, b) => a + b, 0);
const per100 = words ? (lexTotal / words) * 100 : 0;

const negations = sentences.filter((s) =>
    /\b(?:ne|n')\s*\S+(?:\s+\S+)?\s+(?:pas|plus|rien|jamais|aucun\w*|ni)\b|\baucun\w*\b|\brien\b/i.test(s.replace(/’/g, "'")),
);
const emDashes = (prose.match(/—/g) || []).length;

// Seuils calibrés sur php/1 TP (voix de référence, 13/100) et php/2 TP (34/100).
const B = 25 * (1 - Math.min(cov / 0.7, 1));
const V = 15 * Math.min(per100, 1);
const motifs = motifsArg === undefined ? null : Number(motifsArg);

console.log(`phrases ${lengths.length} | mots ${words} | longueur moyenne ${mean.toFixed(1)} | CoV ${cov.toFixed(2)}`);
console.log(`B (rythme) ${B.toFixed(1)}/25 | V (lexique) ${V.toFixed(1)}/15 (${lexTotal} occurrences, ${per100.toFixed(2)}/100 mots)`);
console.log(`tirets cadratins ${emDashes} | phrases négatives ${negations.length} (${((negations.length / Math.max(lengths.length, 1)) * 100).toFixed(0)} %)`);
console.log(`lexique : ${JSON.stringify(lexHits)}`);
if (motifs !== null) {
    console.log(`SCORE = min(100, 4×${motifs} + B + V) = ${Math.min(100, 4 * motifs + B + V).toFixed(0)}`);
}
if (process.argv.includes("--negations")) {
    for (const s of negations) console.log(`  NEG: ${s}`);
}
