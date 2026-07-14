/**
 * Compile les sources Markdown de skills/ en module TypeScript
 * src/lib/skills/pedagogy.ts, servi par les outils MCP
 * get_pedagogical_skill_manifest / get_pedagogical_skill_document.
 *
 * Usage : bun run generate-skill
 * Ne JAMAIS éditer src/lib/skills/pedagogy.ts à la main.
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SKILLS_DIR = path.join(ROOT, "skills");
const OUT_FILE = path.join(ROOT, "src", "lib", "skills", "pedagogy.ts");
const VERSION = "2.0.0";

interface DocEntry {
    id: string;
    path: string;   // relatif à skills/
    content: string;
}

const docs: DocEntry[] = [
    { id: "module-design", path: "module-design/main.md", content: "" },
    { id: "content-writer", path: "content-writer/main.md", content: "" },
];

for (const doc of docs) {
    const abs = path.join(SKILLS_DIR, doc.path);
    if (!fs.existsSync(abs)) {
        console.error(`Source manquante : ${abs}`);
        process.exit(1);
    }
    doc.content = fs.readFileSync(abs, "utf-8").replace(/\r\n/g, "\n");
}

const hash = (s: string) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 12);
const contentHash = hash(docs.map((d) => d.content).join("\n"));

const manifest = {
    id: "pedagogy",
    version: VERSION,
    content_hash: contentHash,
    documents: docs.map((d) => ({
        id: d.id,
        uri: `skill://pedagogy/${d.id}`,
        path: d.path,
        mimeType: "text/markdown",
    })),
};

const documentsRecord = Object.fromEntries(
    docs.map((d) => [d.id, {
        id: d.id,
        path: d.path,
        content: d.content,
        contentHash: hash(d.content),
        mimeType: "text/markdown",
    }])
);

const out = `// GÉNÉRÉ par scripts/generate-skill.ts — NE PAS ÉDITER À LA MAIN.
// Sources canoniques : skills/module-design/main.md, skills/content-writer/main.md
// Régénérer : bun run generate-skill

export interface SkillDocument {
    id: string;
    path: string;
    content: string;
    contentHash: string;
    mimeType: string;
}

export interface SkillManifest {
    id: string;
    version: string;
    content_hash: string;
    documents: Array<{ id: string; uri: string; path: string; mimeType: string }>;
}

export const SKILL_MANIFEST: SkillManifest = ${JSON.stringify(manifest, null, 4)};

export const SKILL_DOCUMENTS: Record<string, SkillDocument> = ${JSON.stringify(documentsRecord, null, 4)};
`;

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, out, "utf-8");
console.log(`Généré : ${path.relative(ROOT, OUT_FILE)} (hash ${contentHash})`);
