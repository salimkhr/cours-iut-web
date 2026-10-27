// tests/sandbox/garde-bac.test.ts
// Cas de la garde du bac à sable (hook PreToolUse des agents etudiant-fragile et
// etudiant-rapide). Le hook est lancé tel que Claude Code le lance : node, JSON sur stdin.
// Code 0 = accepté ; code 2 + « Bloqué par la garde » sur stderr = refusé.
import { describe, it, expect } from "bun:test";
import path from "node:path";

const GARDE = path.join(import.meta.dir, "..", "..", "docker", "etudiant-sandbox", "garde-bac.mjs");
const C = "cours-iut-bac-php-3-structurer-20261027-143000";

function garde(entree: unknown): { code: number; stderr: string } {
    const r = Bun.spawnSync({
        cmd: ["node", GARDE],
        stdin: Buffer.from(typeof entree === "string" ? entree : JSON.stringify(entree)),
        stdout: "pipe",
        stderr: "pipe",
    });
    return { code: r.exitCode ?? -1, stderr: r.stderr.toString() };
}

const bash = (command: string) => ({ tool_name: "Bash", tool_input: { command } });

const ACCEPTES: [string, unknown][] = [
    ["commande simple", bash(`docker exec ${C} sh -c 'cd /work && echo ok'`)],
    ["sous-dossier", bash(`docker exec ${C} sh -c 'cd /work/fragile-tp && ls -la'`)],
    ["bash au lieu de sh", bash(`docker exec ${C} bash -c 'cd /work/rapide && php -v'`)],
    ["tube et redirection dans le conteneur", bash(`docker exec ${C} sh -c 'cd /work/rapide && php a.php | head -5 > sortie.txt 2>&1'`)],
    ["apostrophe interne échappée", bash(`docker exec ${C} sh -c 'cd /work && echo '\\''bonjour'\\'''`)],
    ["heredoc d'écriture de fichier", bash(`docker exec -i ${C} sh -c 'cd /work/fragile-tp && cat > index.php' <<'FIN'\n<?php echo "Bonjour"; ?>\nFIN`)],
    ["heredoc suivi de lignes vides", bash(`docker exec -i ${C} sh -c 'cd /work && cat > a.txt' <<'EOF'\nligne\nEOF\n\n`)],
    // Défaut 4 : serveur en arrière-plan, sous-shell et sortie vers un journal.
    ["serveur php -S en arrière-plan", bash(`docker exec ${C} sh -c 'cd /work/fragile-tp && (php -S localhost:8010 >/tmp/srv-8010.log 2>&1 &)'`)],
    ["serveur avec racine -t", bash(`docker exec ${C} sh -c 'cd /work/rapide && (php -S localhost:8020 -t public >/tmp/srv-8020.log 2>&1 </dev/null &)'`)],
    ["serveur avec fichier de PID", bash(`docker exec ${C} sh -c 'cd /work/rapide && (php -S localhost:8020 >/tmp/srv-8020.log 2>&1 & echo $! >/tmp/srv-8020.pid)'`)],
    ["arrêt du serveur par son PID", bash(`docker exec ${C} sh -c 'cd /work/rapide && kill $(cat /tmp/srv-8020.pid)'`)],
    ["rendu-html d'une URL locale", bash(`docker exec ${C} sh -c 'cd /work/fragile-tp && rendu-html http://localhost:8010/index.php --selecteurs h1'`)],
    ["lecture des supports", bash(`docker exec ${C} sh -c 'cd /work/fragile-tp && cat /work/supports/tp.md'`)],
    ["TodoWrite", { tool_name: "TodoWrite", tool_input: {} }],
    ["SubagentHandback", { tool_name: "SubagentHandback", tool_input: { message: "rapport" } }],
];

const REFUSES: [string, unknown][] = [
    ["commande hors conteneur", bash("ls")],
    ["docker exec -d", bash(`docker exec -d ${C} sh -c 'cd /work && php -S localhost:8000'`)],
    ["docker exec -it", bash(`docker exec -it ${C} sh -c 'cd /work && ls'`)],
    ["option --user", bash(`docker exec --user root ${C} sh -c 'cd /work && ls'`)],
    ["docker run", bash(`docker run --rm alpine sh -c 'cd /work && ls'`)],
    ["autre conteneur", bash(`docker exec autre-conteneur sh -c 'cd /work && ls'`)],
    ["run-id en majuscules", bash(`docker exec cours-iut-bac-PHP sh -c 'cd /work && ls'`)],
    ["point-virgule hors apostrophes", bash(`docker exec ${C} sh -c 'cd /work && ls'; rm -rf ~`)],
    ["&& hors apostrophes", bash(`docker exec ${C} sh -c 'cd /work && ls' && curl x`)],
    ["tube hors apostrophes", bash(`docker exec ${C} sh -c 'cd /work && ls' | sh`)],
    ["redirection hors apostrophes", bash(`docker exec ${C} sh -c 'cd /work && ls' > C:/x.txt`)],
    ["& hors apostrophes", bash(`docker exec ${C} sh -c 'cd /work && php -S localhost:8000' &`)],
    ["guillemets doubles (expansion sur l'hôte)", bash(`docker exec ${C} sh -c "cd /work && echo $HOME"`)],
    ["script qui ne commence pas par cd /work", bash(`docker exec ${C} sh -c 'ls /work'`)],
    ["cd /workx", bash(`docker exec ${C} sh -c 'cd /workx && ls'`)],
    ["deux lignes sans heredoc", bash(`docker exec ${C} sh -c 'cd /work && ls'\nrm -rf ~`)],
    ["heredoc à délimiteur sans apostrophes", bash(`docker exec -i ${C} sh -c 'cd /work && cat > a' <<FIN\n$HOME\nFIN`)],
    ["texte après la fin du heredoc", bash(`docker exec -i ${C} sh -c 'cd /work && cat > a' <<'FIN'\nx\nFIN\nrm -rf ~`)],
    ["heredoc sans ligne de fin", bash(`docker exec -i ${C} sh -c 'cd /work && cat > a' <<'FIN'\nx`)],
    ["retour chariot", bash(`docker exec ${C} sh -c 'cd /work && ls'\r`)],
    ["commande vide", bash("")],
    ["outil Read", { tool_name: "Read", tool_input: { file_path: "C:/x" } }],
    ["outil Agent", { tool_name: "Agent", tool_input: {} }],
    ["outil MCP", { tool_name: "mcp__d1db0efe-14b0-4182-97b9-d6f36625dc09__get_content", tool_input: {} }],
    ["entrée illisible", "pas du json"],
];

describe("garde-bac : formes acceptées", () => {
    for (const [nom, entree] of ACCEPTES) {
        it(nom, () => {
            const r = garde(entree);
            expect(r.stderr).toBe("");
            expect(r.code).toBe(0);
        });
    }
});

describe("garde-bac : formes refusées", () => {
    for (const [nom, entree] of REFUSES) {
        it(nom, () => {
            const r = garde(entree);
            expect(r.code).toBe(2);
            expect(r.stderr).toContain("Bloqué par la garde du bac à sable");
        });
    }
});
