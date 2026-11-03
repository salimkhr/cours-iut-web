// tests/sandbox/garde-relecteur.test.ts
// Cas de la garde des agents relecteur-coherence et relecteur-contrat (hook PreToolUse,
// matcher Read). Le hook est lancé tel que Claude Code le lance : node, JSON sur stdin.
// Code 0 = accepté ; code 2 + « Bloqué par la garde du relecteur » sur stderr = refusé.
// Le dépôt et la config Claude sont simulés dans un dossier temporaire
// (GARDE_RELECTEUR_DEPOT, USERPROFILE, HOME et CLAUDE_CONFIG_DIR passés au hook) ; les
// cas propres à Windows sont sautés ailleurs.
import { describe, it, expect, afterAll } from "bun:test";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const GARDE = path.join(import.meta.dir, "..", "..", "docker", "etudiant-sandbox", "garde-relecteur.mjs");
const WIN = process.platform === "win32";

// Base sous os.tmpdir() : sous Windows c'est souvent la forme courte (UTILIS~1),
// sa version longue sert à vérifier que les deux formes sont reconnues.
const BASE = mkdtempSync(path.join(os.tmpdir(), "garde-rel-"));
const BASE_LONGUE = realpathSync.native(BASE);
const DEPOT = path.join(BASE, "depot");
const PLANS = path.join(DEPOT, "docs", "plans");
const PHP = path.join(PLANS, "php");
const HORS = path.join(BASE, "hors-depot");
const HOME = path.join(BASE, "home");
const CONFIG = path.join(HOME, ".claude");
const TOOL_RESULTS = path.join(CONFIG, "projects", "C--projet", "476b8c25-session", "tool-results");
const SECTION = "7-sessions-et-authentification.md";

mkdirSync(path.join(PHP, "rapports"), { recursive: true });
mkdirSync(path.join(DEPOT, "src", "lib"), { recursive: true });
mkdirSync(HORS, { recursive: true });
mkdirSync(TOOL_RESULTS, { recursive: true });
writeFileSync(path.join(PHP, SECTION), "# plan");
writeFileSync(path.join(PHP, "etat.md"), "# état");
writeFileSync(path.join(HORS, "secret.md"), "secret");

let lienFait = false;
try {
    symlinkSync(HORS, path.join(PHP, "lien"), WIN ? "junction" : "dir");
    lienFait = true;
} catch {
    // jonction impossible (droits) : le cas est sauté
}
// Lien posé à la place d'un plan, qui pointe vers un fichier hors dépôt.
let lienFichierFait = false;
try {
    symlinkSync(path.join(HORS, "secret.md"), path.join(PHP, "piege.md"), "file");
    lienFichierFait = true;
} catch {
    // lien symbolique de fichier impossible sans droits (Windows) : le cas est sauté
}

// Environnement du test sans surcharge héritée.
const env = { ...process.env };
delete env.GARDE_RELECTEUR_DEPOT;

afterAll(() => rmSync(BASE, { recursive: true, force: true }));

function garde(entree: unknown, depot: string | null = DEPOT): { code: number; stderr: string } {
    const r = Bun.spawnSync({
        cmd: ["node", GARDE],
        stdin: Buffer.from(typeof entree === "string" ? entree : JSON.stringify(entree)),
        stdout: "pipe",
        stderr: "pipe",
        env: { ...env, ...(depot ? { GARDE_RELECTEUR_DEPOT: depot } : {}), USERPROFILE: HOME, HOME, CLAUDE_CONFIG_DIR: CONFIG },
    });
    return { code: r.exitCode ?? -1, stderr: r.stderr.toString() };
}

const read = (file_path: unknown) => ({ tool_name: "Read", tool_input: { file_path } });
const longue = (p: string) => p.replace(BASE, BASE_LONGUE);
const S = path.sep;

type Cas = [string, unknown, boolean?];

const ACCEPTES: Cas[] = [
    ["plan de section", read(path.join(PHP, SECTION))],
    ["etat.md du module", read(path.join(PHP, "etat.md"))],
    ["plan pas encore écrit", read(path.join(PLANS, "rust", "6-traits.md"))],
    ["plan en barres obliques", read(path.join(PHP, SECTION).replace(/\\/g, "/"))],
    ["plan avec la forme longue de la base", read(longue(path.join(PHP, SECTION)))],
    ["forme courte de la base (UTILIS~1)", read(path.join(PHP, SECTION)), BASE !== BASE_LONGUE],
    ["plan sans tenir compte de la casse de docs\\plans (Windows)", read(path.join(DEPOT, "DOCS", "Plans", "php", SECTION)), WIN],
    ["tool-results", read(path.join(TOOL_RESULTS, "toolu_01abc.txt"))],
    ["export d'un brouillon", read(path.join(PHP, "brouillons", "7-sessions-et-authentification", "cours.md"))],
    ["outil autre que Read (Bash)", { tool_name: "Bash", tool_input: { command: "rm -rf /" } }],
    ["outil autre que Read (Write)", { tool_name: "Write", tool_input: { file_path: path.join(DEPOT, ".env.local") } }],
];

const REFUSES: Cas[] = [
    ["sous-dossier de module", read(path.join(PHP, "rapports", "2026-10-27.md"))],
    ["fichier directement dans docs/plans", read(path.join(PLANS, "README.md"))],
    ["JSON d'un brouillon", read(path.join(PHP, "brouillons", "7-sessions-et-authentification", "cours.json"))],
    ["brouillon sans dossier de section", read(path.join(PHP, "brouillons", "cours.md"))],
    ["sous-dossier d'un brouillon", read(path.join(PHP, "brouillons", "7-x", "fournis", "a.md"))],
    ["dossier autre que brouillons", read(path.join(PHP, "autres", "7-x", "cours.md"))],
    ["docs/plans lui-même", read(PLANS)],
    ["dossier de module", read(PHP)],
    ["plan non .md", read(path.join(PHP, "7-sessions.txt"))],
    ["nom de plan en majuscules", read(path.join(PHP, "Plan-7.md"))],
    ["module invalide", read(path.join(PLANS, "_php", "etat.md"))],
    ["src/lib/auth.ts", read(path.join(DEPOT, "src", "lib", "auth.ts"))],
    [".env.local", read(path.join(DEPOT, ".env.local"))],
    ["fichier hors dépôt", read(path.join(HORS, "secret.md"))],
    ["docs/plans/php/../../../.env.local", read(`${PHP}${S}..${S}..${S}..${S}.env.local`)],
    ["segment « . »", read(`${PHP}${S}.${S}etat.md`)],
    ["chemin relatif", read("docs/plans/php/etat.md")],
    ["UNC", read("\\\\serveur\\partage\\docs\\plans\\php\\etat.md"), WIN],
    ["\\\\?\\", read(`\\\\?\\${path.join(PHP, "etat.md")}`), WIN],
    ["flux NTFS", read(path.join(PHP, "etat.md") + ":flux"), WIN],
    ["segment finissant par une espace", read(path.join(PLANS, "php ", "etat.md"))],
    ["jonction dans docs/plans/php vers l'extérieur", read(path.join(PHP, "lien", "secret.md")), lienFait],
    ["lien de fichier vers l'extérieur", read(path.join(PHP, "piege.md")), lienFichierFait],
    ["transcription dans projects", read(path.join(CONFIG, "projects", "C--projet", "476b8c25-session.jsonl"))],
    ["~/.claude/settings.json", read(path.join(CONFIG, "settings.json"))],
    ["file_path absent", { tool_name: "Read", tool_input: {} }],
    ["file_path non string", read(42)],
    ["tool_input absent", { tool_name: "Read" }],
    ["JSON illisible", "pas du json"],
    ["JSON null", "null"],
];

describe("garde-relecteur : appels acceptés", () => {
    for (const [nom, entree, actif = true] of ACCEPTES) {
        it.skipIf(!actif)(nom, () => {
            const r = garde(entree);
            expect(r.stderr).toBe("");
            expect(r.code).toBe(0);
        });
    }
});

describe("garde-relecteur : appels refusés", () => {
    for (const [nom, entree, actif = true] of REFUSES) {
        it.skipIf(!actif)(nom, () => {
            const r = garde(entree);
            expect(r.code).toBe(2);
            expect(r.stderr).toContain("Bloqué par la garde du relecteur");
        });
    }
});

// Sans GARDE_RELECTEUR_DEPOT : la racine est calculée depuis l'emplacement du script.
const VRAI_DEPOT = path.join(import.meta.dir, "..", "..");
describe("garde-relecteur : racine calculée depuis le script", () => {
    it("plan du vrai dépôt permis", () => {
        const r = garde(read(path.join(VRAI_DEPOT, "docs", "plans", "php", "etat.md")), null);
        expect(r.stderr).toBe("");
        expect(r.code).toBe(0);
    });
    it(".env.local du vrai dépôt refusé", () => {
        const r = garde(read(path.join(VRAI_DEPOT, ".env.local")), null);
        expect(r.code).toBe(2);
        expect(r.stderr).toContain("Bloqué par la garde du relecteur");
    });
    it("plan du dépôt simulé refusé sans la surcharge", () => {
        const r = garde(read(path.join(PHP, SECTION)), null);
        expect(r.code).toBe(2);
    });
});
