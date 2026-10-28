// tests/sandbox/garde-redacteur.test.ts
// Cas de la garde des agents redacteur-cours, redacteur-slides et redacteur-tp (hook
// PreToolUse, matcher « * », argument = supports permis). Le hook est lancé tel que
// Claude Code le lance : node, JSON sur stdin. Code 0 = accepté ; code 2 +
// « Bloqué par la garde du rédacteur » sur stderr = refusé. Le dépôt et la config
// Claude sont simulés dans un dossier temporaire (GARDE_REDACTEUR_DEPOT).
import { describe, it, expect, afterAll } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const GARDE = path.join(import.meta.dir, "..", "..", "docker", "etudiant-sandbox", "garde-redacteur.mjs");
const WIN = process.platform === "win32";

const BASE = mkdtempSync(path.join(os.tmpdir(), "garde-red-"));
const DEPOT = path.join(BASE, "depot");
const PLANS = path.join(DEPOT, "docs", "plans");
const PHP = path.join(PLANS, "php");
const SECTION = "7-sessions-et-authentification";
const BROUILLONS = path.join(PHP, "brouillons", SECTION);
const HOME = path.join(BASE, "home");
const CONFIG = path.join(HOME, ".claude");
const TOOL_RESULTS = path.join(CONFIG, "projects", "C--projet", "476b8c25-session", "tool-results");

mkdirSync(BROUILLONS, { recursive: true });
mkdirSync(path.join(DEPOT, "src", "lib"), { recursive: true });
mkdirSync(TOOL_RESULTS, { recursive: true });
writeFileSync(path.join(PHP, `${SECTION}.md`), "# plan");

const env = { ...process.env };
delete env.GARDE_REDACTEUR_DEPOT;

afterAll(() => rmSync(BASE, { recursive: true, force: true }));

function garde(entree: unknown, supports = "cours"): { code: number; stderr: string } {
    const r = Bun.spawnSync({
        cmd: ["node", GARDE, supports],
        stdin: Buffer.from(typeof entree === "string" ? entree : JSON.stringify(entree)),
        stdout: "pipe",
        stderr: "pipe",
        env: { ...env, GARDE_REDACTEUR_DEPOT: DEPOT, USERPROFILE: HOME, HOME, CLAUDE_CONFIG_DIR: CONFIG },
    });
    return { code: r.exitCode ?? -1, stderr: r.stderr.toString() };
}

const outil = (tool_name: string, tool_input: Record<string, unknown>) => ({ tool_name, tool_input });
const write = (file_path: unknown) => outil("Write", { file_path, content: "[]" });
const edit = (file_path: unknown) => outil("Edit", { file_path, old_string: "a", new_string: "b" });
const read = (file_path: unknown) => outil("Read", { file_path });
const bash = (command: unknown) => outil("Bash", { command });
const valider = (support: string, section = SECTION) =>
    bash(`bun src/scripts/brouillon.ts valider docs/plans/php/brouillons/${section}/${support}.json`);

type Cas = [string, unknown, string?, boolean?];

const ACCEPTES: Cas[] = [
    ["Write de son brouillon", write(path.join(BROUILLONS, "cours.json"))],
    ["Edit de son brouillon", edit(path.join(BROUILLONS, "cours.json"))],
    ["Write en barres obliques", write(path.join(BROUILLONS, "cours.json").replace(/\\/g, "/"))],
    ["Write du brouillon d'une section pas encore créée", write(path.join(PHP, "brouillons", "8-x", "cours.json"))],
    ["tp et examen pour le rédacteur TP", write(path.join(BROUILLONS, "examen.json")), "tp,examen"],
    ["Read du plan", read(path.join(PHP, `${SECTION}.md`))],
    ["Read de l'état du module", read(path.join(PHP, "etat.md"))],
    ["Read du cours validé (JSON)", read(path.join(BROUILLONS, "cours.json")), "slides"],
    ["Read de l'export du cours", read(path.join(BROUILLONS, "cours.md")), "slides"],
    ["Read d'un tool-results", read(path.join(TOOL_RESULTS, "toolu_01.txt"))],
    ["Bash : valider son brouillon", valider("cours")],
    ["Bash : valider avec espaces autour", bash(`  bun src/scripts/brouillon.ts valider docs/plans/php/brouillons/${SECTION}/cours.json  `)],
    ["outil MCP de lecture", outil("mcp__d1db0efe-14b0-4182-97b9-d6f36625dc09__list_block_types", {})],
    ["TodoWrite", outil("TodoWrite", { todos: [] })],
];

const REFUSES: Cas[] = [
    ["Write du brouillon d'un autre support", write(path.join(BROUILLONS, "tp.json"))],
    ["Write de l'export .md", write(path.join(BROUILLONS, "cours.md"))],
    ["Write du plan", write(path.join(PHP, `${SECTION}.md`))],
    ["Write hors brouillons", write(path.join(DEPOT, "src", "lib", "auth.ts"))],
    ["Write sans dossier de section", write(path.join(PHP, "brouillons", "cours.json"))],
    ["Write dans un sous-dossier", write(path.join(BROUILLONS, "fournis", "cours.json"))],
    ["Write avec ..", write(`${BROUILLONS}${path.sep}..${path.sep}..${path.sep}etat.md`)],
    ["Write en chemin relatif", write(`docs/plans/php/brouillons/${SECTION}/cours.json`)],
    ["Edit du brouillon d'un autre support", edit(path.join(BROUILLONS, "slides.json"))],
    ["Read de .env.local", read(path.join(DEPOT, ".env.local"))],
    ["Read du code", read(path.join(DEPOT, "src", "lib", "auth.ts"))],
    ["Read d'un sous-dossier de module", read(path.join(PHP, "rapports", "x.md"))],
    ["Read de ~/.claude/settings.json", read(path.join(CONFIG, "settings.json"))],
    ["Bash : valider le brouillon d'un autre support", valider("tp")],
    ["Bash : exporter", bash(`bun src/scripts/brouillon.ts exporter docs/plans/php/brouillons/${SECTION}/cours.json --titre x`)],
    ["Bash : enchaînement", bash(`bun src/scripts/brouillon.ts valider docs/plans/php/brouillons/${SECTION}/cours.json && rm -rf /`)],
    ["Bash : point-virgule", bash(`bun src/scripts/brouillon.ts valider docs/plans/php/brouillons/${SECTION}/cours.json; ls`)],
    ["Bash : chemin avec ..", bash("bun src/scripts/brouillon.ts valider docs/plans/php/brouillons/../../../cours.json")],
    ["Bash : autre commande", bash("ls")],
    ["Bash : commande non string", bash(42)],
    ["PowerShell", outil("PowerShell", { command: "Get-ChildItem" })],
    ["NotebookEdit", outil("NotebookEdit", {})],
    ["JSON illisible", "pas du json"],
    ["JSON null", "null"],
    ["argument du hook invalide", write(path.join(BROUILLONS, "cours.json")), "staging"],
    ["argument du hook vide", write(path.join(BROUILLONS, "cours.json")), ""],
];

describe("garde-redacteur : appels acceptés", () => {
    for (const [nom, entree, supports = "cours", actif = true] of ACCEPTES) {
        it.skipIf(!actif)(nom, () => {
            const r = garde(entree, supports);
            expect(r.stderr).toBe("");
            expect(r.code).toBe(0);
        });
    }
});

describe("garde-redacteur : appels refusés", () => {
    for (const [nom, entree, supports = "cours", actif = true] of REFUSES) {
        it.skipIf(!actif)(nom, () => {
            const r = garde(entree, supports);
            expect(r.code).toBe(2);
            expect(r.stderr).toContain("Bloqué par la garde du rédacteur");
        });
    }
});

describe("garde-redacteur : Windows", () => {
    it.skipIf(!WIN)("casse de docs\\plans ignorée", () => {
        const r = garde(write(path.join(DEPOT, "DOCS", "Plans", "php", "brouillons", SECTION, "cours.json")));
        expect(r.code).toBe(0);
    });
    it.skipIf(!WIN)("flux NTFS refusé", () => {
        const r = garde(write(path.join(BROUILLONS, "cours.json") + ":flux"));
        expect(r.code).toBe(2);
    });
});
