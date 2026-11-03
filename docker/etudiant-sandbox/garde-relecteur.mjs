#!/usr/bin/env node
// Hook PreToolUse des agents relecteur-coherence et relecteur-contrat (pipeline
// content-writer-v3).
//
// Configuré avec matcher: "Read" : il ne garde que l'outil Read. Un appel d'un autre
// outil le traverse sans objection (code 0) : il n'est pas la garde des autres outils,
// que la liste tools: de l'agent limite déjà.
//
// Read refusé par défaut. Passent seulement :
// - le plan d'une section : <racine du dépôt>\docs\plans\<module>\<fichier>.md, avec
//   exactement deux segments sous docs\plans (pas de sous-dossier, pas de fichier posé
//   directement dans docs\plans) et des noms en a-z, 0-9, - (ex. php\7-sessions.md,
//   php\etat.md) ;
// - l'export d'un brouillon (étape « rédaction ») :
//   docs\plans\<module>\brouillons\<section>\<fichier>.md, jamais le JSON ;
// - les fichiers tool-results de Claude Code (sortie MCP trop longue enregistrée sur
//   disque) sous <config>\projects\, avec <config> = CLAUDE_CONFIG_DIR, sinon
//   %USERPROFILE%\.claude (ou $HOME/.claude).
//
// Racine du dépôt : deux niveaux au-dessus de ce script (docker\etudiant-sandbox\).
// La variable GARDE_RELECTEUR_DEPOT la remplace : elle est réservée aux tests, qui
// simulent un dépôt dans un dossier temporaire.
//
// Chemins : absolus, sans « .. », sans UNC ni \\?\, sans « : » après le lecteur (flux
// NTFS), sans segment finissant par un point ou une espace. L'ancêtre existant le plus
// profond est résolu par realpath (forme courte UTILIS~1 développée, jonction ou lien
// symbolique suivi), puis comparé sans casse aux racines elles aussi résolues.
//
// Sortie : code 0 sans sortie = pas d'objection ; code 2 + message stderr = refus.
// Configuré avec onFailure: block : un plantage du hook refuse aussi l'appel.

import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WIN = process.platform === "win32";
const P = WIN ? path.win32 : path.posix;

const SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/;
const PLAN = /^[a-z0-9][a-z0-9-]{0,120}\.md$/;

function refuser(raison) {
    process.stderr.write(`Bloqué par la garde du relecteur : ${raison}\n`);
    process.exit(2);
}

// --- Chemins -----------------------------------------------------------------------

const cle = (p) => (WIN ? p.toLowerCase() : p);

/** Résout l'ancêtre existant le plus profond (realpath), garde le reste tel quel. */
function resoudre(absolu) {
    const reste = [];
    let courant = absolu;
    for (;;) {
        try {
            const reel = realpathSync.native(courant);
            return reste.length ? P.join(reel, ...reste.reverse()) : reel;
        } catch {
            const parent = P.dirname(courant);
            if (parent === courant) return absolu;
            reste.push(P.basename(courant));
            courant = parent;
        }
    }
}

/** Chemin brut → chemin absolu résolu, ou message d'erreur. */
function normaliser(brut) {
    if (typeof brut !== "string" || brut.length === 0) return { erreur: "chemin vide ou illisible." };
    if (/[\0\r\n]/.test(brut)) return { erreur: "caractère de contrôle dans le chemin." };
    const p = WIN ? brut.replace(/\//g, "\\") : brut;
    if (WIN) {
        if (p.startsWith("\\\\")) return { erreur: "chemin UNC ou \\\\?\\ refusé." };
        if (!/^[A-Za-z]:\\/.test(p)) return { erreur: "chemin non absolu (attendu C:\\...)." };
        if (p.indexOf(":", 2) !== -1) return { erreur: "« : » après le lecteur (flux NTFS) refusé." };
    } else if (!p.startsWith("/")) {
        return { erreur: "chemin non absolu." };
    }
    const segments = p.split(WIN ? "\\" : "/").slice(1);
    for (const s of segments) {
        if (s === "..") return { erreur: "segment « .. » refusé." };
        if (s === "." ) return { erreur: "segment « . » refusé." };
        if (s !== "" && /[. ]$/.test(s)) return { erreur: `segment « ${s} » finissant par un point ou une espace.` };
    }
    return { chemin: resoudre(P.normalize(p)) };
}

function racines() {
    const config = process.env.CLAUDE_CONFIG_DIR
        || (process.env.USERPROFILE || process.env.HOME ? P.join(process.env.USERPROFILE || process.env.HOME, ".claude") : null);
    const depot = process.env.GARDE_RELECTEUR_DEPOT
        || P.join(P.dirname(fileURLToPath(import.meta.url)), "..", "..");
    const r = (x) => (x ? resoudre(P.normalize(x)) : null);
    return {
        plans: r(P.join(depot, "docs", "plans")),
        projets: config ? r(P.join(config, "projects")) : null,
    };
}

/** Segments de `chemin` sous `racine`, ou null s'il n'est pas dessous. */
function sous(chemin, racine) {
    if (!racine) return null;
    const rel = P.relative(cle(racine), cle(chemin));
    if (rel === "" || rel.startsWith("..") || P.isAbsolute(rel)) return null;
    // Segments dans la casse d'origine (même longueur que la version en minuscules).
    return chemin.slice(chemin.length - rel.length).split(WIN ? "\\" : "/");
}

function lecturePermise(chemin, R) {
    const pl = sous(chemin, R.plans);
    if (pl) {
        if (pl.length === 2 && SLUG.test(pl[0]) && PLAN.test(pl[1])) return null;
        if (pl.length === 4 && SLUG.test(pl[0]) && pl[1] === "brouillons" && SLUG.test(pl[2]) && PLAN.test(pl[3])) return null;
        return "sous docs\\plans, seuls <module>\\<section>.md et <module>\\brouillons\\<section>\\<support>.md sont permis (noms en a-z, 0-9, -).";
    }
    const pr = sous(chemin, R.projets);
    if (pr && pr.slice(0, -1).some((s) => cle(s) === "tool-results")) return null;
    return "lecture permise seulement du plan de la section (docs\\plans\\<module>\\<section>.md) et des tool-results de Claude Code.";
}

// --- Entrée ------------------------------------------------------------------------

function verifier(entree) {
    const outil = entree?.tool_name;
    // matcher: "Read" : les autres outils ne relèvent pas de cette garde.
    if (outil !== "Read") return null;
    const n = normaliser(entree?.tool_input?.file_path);
    if (n.erreur) return `Read : ${n.erreur}`;
    const e = lecturePermise(n.chemin, racines());
    return e ? `Read : ${e}` : null;
}

function main() {
    let entree;
    try {
        entree = JSON.parse(readFileSync(0, "utf8").replace(/^\uFEFF/, ""));
    } catch {
        refuser("entrée du hook illisible.");
    }
    if (entree === null || typeof entree !== "object") refuser("entrée du hook illisible.");
    const raison = verifier(entree);
    if (raison) refuser(raison);
    process.exit(0);
}

main();
