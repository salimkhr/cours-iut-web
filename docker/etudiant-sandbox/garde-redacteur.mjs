#!/usr/bin/env node
// Hook PreToolUse des agents redacteur-cours, redacteur-slides, redacteur-tp,
// redacteur-quiz-section et redacteur-quiz-transversal (pipeline content-writer-v3).
//
// Les rédacteurs n'écrivent sur aucun serveur : ils rendent l'arbre de blocs de leur
// support dans un brouillon JSON. Argument du hook : la liste des supports que l'agent
// a le droit d'écrire, séparés par des virgules (cours | slides | tp | examen | quiz).
//
// Permis :
// - Write, Edit : <dépôt>\docs\plans\<module>\brouillons\<section>\<support>.json, pour
//   un <support> de l'argument ; pour quiz :
//   <dépôt>\docs\plans\<module>\brouillons\quiz\<nom>.json ;
// - Read, selon le support (spec § 4 : le rédacteur du cours ne voit pas le détail du
//   fil rouge, donc ni le plan complet ni le TP) :
//   - cours : dans <dépôt>\docs\plans\<module>\brouillons\<section>\, les fichiers
//     cours.* , cours-* et plan-cours.md ;
//   - slides : en plus, slides.*, slides-* et plan-slides.md ;
//   - tp, examen, quiz : tout fichier .json ou .md de ce dossier, et les plans
//     <dépôt>\docs\plans\<module>\<fichier>.md ;
//   pour tous : les tool-results de Claude Code ;
// - Bash : une seule commande, la validation de son propre brouillon, en chemin
//   relatif depuis la racine du dépôt :
//     bun src/scripts/brouillon.ts valider docs/plans/<module>/brouillons/<section>/<support>.json
//     bun src/scripts/brouillon.ts valider-quiz docs/plans/<module>/brouillons/quiz/<nom>.json
// Refusés : PowerShell, NotebookEdit, MultiEdit. Les autres outils (MCP de lecture,
// TodoWrite, ToolSearch) traversent la garde : la liste tools: de l'agent les limite.
//
// Racine du dépôt : deux niveaux au-dessus de ce script. GARDE_REDACTEUR_DEPOT la
// remplace (réservée aux tests). Même normalisation des chemins que
// garde-relecteur.mjs : absolus, sans « .. », sans UNC, sans flux NTFS, ancêtre
// existant résolu par realpath, comparaison sans casse sous Windows.
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
const BROUILLON = /^[a-z0-9][a-z0-9.-]{0,120}\.(?:json|md)$/;
const SUPPORTS = new Set(["cours", "slides", "tp", "examen", "quiz"]);
const REFUSES = new Set(["PowerShell", "NotebookEdit", "MultiEdit"]);

function refuser(raison) {
    process.stderr.write(`Bloqué par la garde du rédacteur : ${raison}\n`);
    process.exit(2);
}

// --- Chemins (repris de garde-relecteur.mjs) ----------------------------------------

const cle = (p) => (WIN ? p.toLowerCase() : p);

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
        if (s === ".") return { erreur: "segment « . » refusé." };
        if (s !== "" && /[. ]$/.test(s)) return { erreur: `segment « ${s} » finissant par un point ou une espace.` };
    }
    return { chemin: resoudre(P.normalize(p)) };
}

function racines() {
    const config = process.env.CLAUDE_CONFIG_DIR
        || (process.env.USERPROFILE || process.env.HOME ? P.join(process.env.USERPROFILE || process.env.HOME, ".claude") : null);
    const depot = process.env.GARDE_REDACTEUR_DEPOT
        || P.join(P.dirname(fileURLToPath(import.meta.url)), "..", "..");
    const r = (x) => (x ? resoudre(P.normalize(x)) : null);
    return {
        plans: r(P.join(depot, "docs", "plans")),
        projets: config ? r(P.join(config, "projects")) : null,
    };
}

function sous(chemin, racine) {
    if (!racine) return null;
    const rel = P.relative(cle(racine), cle(chemin));
    if (rel === "" || rel.startsWith("..") || P.isAbsolute(rel)) return null;
    return chemin.slice(chemin.length - rel.length).split(WIN ? "\\" : "/");
}

/** Segments sous docs\plans d'un brouillon : <module>\brouillons\<section>\<fichier>. */
function estBrouillon(seg) {
    return seg.length === 4 && SLUG.test(seg[0]) && seg[1] === "brouillons" && SLUG.test(seg[2]);
}

// --- Règles ------------------------------------------------------------------------

function ecriturePermise(chemin, R, supports) {
    const seg = sous(chemin, R.plans);
    if (seg && estBrouillon(seg)) {
        if (supports.has("quiz") && seg[2] === "quiz" && /^[a-z0-9][a-z0-9-]{0,120}\.json$/.test(seg[3])) return null;
        const m = /^([a-z]+)\.json$/.exec(seg[3]);
        if (m && m[1] !== "quiz" && supports.has(m[1])) return null;
    }
    return `écriture permise seulement dans docs\\plans\\<module>\\brouillons\\<section>\\{${[...supports].join(",")}}.json.`;
}

/** Préfixes des fichiers de brouillon lisibles par support ; null = tout le dossier et les plans. */
const LECTURES = {
    cours: ["cours.", "cours-", "plan-cours."],
    slides: ["cours.", "cours-", "plan-cours.", "slides.", "slides-", "plan-slides."],
    tp: null,
    examen: null,
    quiz: null,
};

function lecturePermise(chemin, R, supports) {
    const complet = [...supports].some((s) => LECTURES[s] === null);
    const prefixes = [...supports].flatMap((s) => LECTURES[s] ?? []);
    const seg = sous(chemin, R.plans);
    if (seg) {
        if (complet && seg.length === 2 && SLUG.test(seg[0]) && PLAN.test(seg[1])) return null;
        if (estBrouillon(seg) && BROUILLON.test(seg[3])) {
            if (complet || prefixes.some((p) => seg[3].startsWith(p))) return null;
            return `le rédacteur ${[...supports].join(",")} ne lit dans les brouillons que ${prefixes.join(" ")}* (pas le plan complet ni les autres supports).`;
        }
        return complet
            ? "sous docs\\plans, seuls <module>\\<fichier>.md et <module>\\brouillons\\<section>\\<fichier>.{json,md} sont permis."
            : "sous docs\\plans, seuls vos fichiers de brouillons\\<section>\\ sont permis (pas le plan complet).";
    }
    const pr = sous(chemin, R.projets);
    if (pr && pr.slice(0, -1).some((s) => cle(s) === "tool-results")) return null;
    return "lecture permise seulement des plans, des brouillons de la section et des tool-results de Claude Code.";
}

const COMMANDE = /^bun src\/scripts\/brouillon\.ts valider docs\/plans\/([a-z0-9][a-z0-9-]{0,120})\/brouillons\/([a-z0-9][a-z0-9-]{0,120})\/([a-z]+)\.json$/;
const COMMANDE_QUIZ = /^bun src\/scripts\/brouillon\.ts valider-quiz docs\/plans\/[a-z0-9][a-z0-9-]{0,120}\/brouillons\/quiz\/[a-z0-9][a-z0-9-]{0,120}\.json$/;

function bashPermis(commande, supports) {
    if (typeof commande !== "string") return "commande illisible.";
    if (supports.has("quiz") && COMMANDE_QUIZ.test(commande.trim())) return null;
    const m = COMMANDE.exec(commande.trim());
    if (!m) return "seule « bun src/scripts/brouillon.ts valider docs/plans/<module>/brouillons/<section>/<support>.json » est permise.";
    if (!supports.has(m[3])) return `support « ${m[3]} » hors de votre périmètre.`;
    return null;
}

function supportsDeLArgument() {
    const brut = process.argv[2] ?? "";
    const liste = brut.split(",").map((s) => s.trim()).filter(Boolean);
    if (liste.length === 0 || liste.some((s) => !SUPPORTS.has(s))) {
        refuser(`argument du hook invalide (« ${brut} ») : attendu cours, slides, tp, examen ou quiz.`);
    }
    return new Set(liste);
}

function verifier(entree, supports) {
    const outil = entree?.tool_name;
    if (REFUSES.has(outil)) return `outil « ${outil} » interdit.`;
    const R = racines();
    if (outil === "Write" || outil === "Edit") {
        const n = normaliser(entree?.tool_input?.file_path);
        if (n.erreur) return `${outil} : ${n.erreur}`;
        const e = ecriturePermise(n.chemin, R, supports);
        return e ? `${outil} : ${e}` : null;
    }
    if (outil === "Read") {
        const n = normaliser(entree?.tool_input?.file_path);
        if (n.erreur) return `Read : ${n.erreur}`;
        const e = lecturePermise(n.chemin, R, supports);
        return e ? `Read : ${e}` : null;
    }
    if (outil === "Bash") {
        const e = bashPermis(entree?.tool_input?.command, supports);
        return e ? `Bash : ${e}` : null;
    }
    return null;
}

function main() {
    const supports = supportsDeLArgument();
    let entree;
    try {
        entree = JSON.parse(readFileSync(0, "utf8").replace(/^\uFEFF/, ""));
    } catch {
        refuser("entrée du hook illisible.");
    }
    if (entree === null || typeof entree !== "object") refuser("entrée du hook illisible.");
    const raison = verifier(entree, supports);
    if (raison) refuser(raison);
    process.exit(0);
}

main();
