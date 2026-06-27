// Placeholders for Task 3+ implementation
import { connectToDB as _connectToDB } from "@/lib/mongodb";
import { v4 as _uuidv4 } from "uuid";
import * as _babelParser from "@babel/parser";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
import * as _cheerio from "cheerio";
import * as _fs from "fs";
import * as _path from "path";
import type { Block as _Block } from "@/types/CourseContent";

// @babel/traverse et @babel/generator ont un bug ESM connu en Bun
// reason: used in Task 5 for parseFile
const _trav = (_traverse as unknown as { default: typeof _traverse }).default ?? _traverse;
const _gen = (_generate as unknown as { default: typeof _generate }).default ?? _generate;

// ── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const _DRY_RUN   = args.includes("--dry-run");
const _MODULE_FILTER = args.find(a => a.startsWith("--module="))?.split("=")[1];
const _FILE_FILTER   = args.find(a => a.startsWith("--file="))?.split("=")[1];

export function deriveSlug(filePath: string): {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
} {
    // normalise les séparateurs Windows
    const normalized = filePath.replace(/\\/g, "/");
    // src/cours/{moduleSlug}/{sectionSlug}/{Type}.tsx
    const match = normalized.match(/src\/cours\/([^/]+)\/([^/]+)\/(\w+)\.tsx$/);
    if (!match) throw new Error(`Chemin inattendu : ${filePath}`);
    const [, moduleSlug, sectionSlug, typeName] = match;
    const typeMap: Record<string, string> = {
        Cours: "cours", TP: "TP", Examen: "examen", Slide: "slide",
    };
    const contentType = typeMap[typeName];
    if (!contentType) throw new Error(`Type inconnu : ${typeName}`);
    return { moduleSlug, sectionSlug, contentType };
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });

async function main() {
    console.log("Migration placeholder - Tasks 1-2 complete");
}
