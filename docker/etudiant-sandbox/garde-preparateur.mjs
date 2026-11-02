#!/usr/bin/env node
// Hook PreToolUse de l'agent preparateur (pipeline content-writer-v3, § 5 bis).
//
// Refus par défaut. Passent seulement :
// - les outils sans accès à la machine (listes de tâches, ToolSearch, SubagentHandback) ;
// - les quatre outils MCP de lecture prod, sous les deux préfixes (Desktop et CLI) ;
// - Write vers :
//     <racine bac>\<run-id>\supports\cours.md | tp.md
//     <racine bac>\<run-id>\supports\<section>\cours.md | tp.md (quiz sur plusieurs sections)
//     <racine bac>\<run-id>\fournis\...
//     %LOCALAPPDATA%\Temp\claude\...\scratchpad\couverture-<run-id>.md
//   avec <racine bac> = %LOCALAPPDATA%\Temp\cours-iut-bac ;
// - Read des mêmes endroits, et des fichiers tool-results de Claude Code (sortie MCP
//   trop longue enregistrée sur disque) sous <config>\projects\ ;
// - Bash, deux formes seulement, sans aucun caractère spécial du shell :
//     curl [-f -s -S --create-dirs ...] -o C:/.../<run-id>/fournis/<fichier> https://salimkhraimeche.dev/download/<chemin>
//     unzip [-q -o -n ...] C:/.../<run-id>/fournis/<archive>.zip -d C:/.../<run-id>/fournis/<dossier>
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

const WIN = process.platform === "win32";
const P = WIN ? path.win32 : path.posix;

const OUTILS_LIBRES = new Set([
    "TodoWrite", "TaskCreate", "TaskUpdate", "TaskList", "TaskGet", "SubagentHandback", "ToolSearch",
]);
const PREFIXES_PROD = ["mcp__d1db0efe-14b0-4182-97b9-d6f36625dc09__", "mcp__claude_ai_cours-iut-web__"];
const MCP_LECTURE = ["export_content_compact", "get_content", "list_sections", "get_section"];
const MCP_PERMIS = new Set(PREFIXES_PROD.flatMap((p) => MCP_LECTURE.map((o) => p + o)));

const RUN_ID = /^[a-z0-9][a-z0-9-]{0,120}$/;
const COUVERTURE = /^couverture-[a-z0-9][a-z0-9-]{0,120}\.md$/;
const URL_PERMISE = /^https:\/\/salimkhraimeche\.dev\/download\/[A-Za-z0-9._/-]+$/;
const URL_FIN_DE_SECTION = /correct|solution|corrige|fin-de-|etat-final|final/i;
// Seuls caractères admis dans une commande Bash : pas de ; & | < > $ ` ( ) { } [ ] * ? ! ~ # = ' " \ ni retour à la ligne.
const CARACTERES_BASH = /^[A-Za-z0-9 ._:/@%+,-]+$/;

function refuser(raison) {
    process.stderr.write(`Bloqué par la garde du préparateur : ${raison}\n`);
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
    const local = process.env.LOCALAPPDATA;
    const config = process.env.CLAUDE_CONFIG_DIR
        || (process.env.USERPROFILE || process.env.HOME ? P.join(process.env.USERPROFILE || process.env.HOME, ".claude") : null);
    const r = (x) => (x ? resoudre(P.normalize(x)) : null);
    return {
        bac: local ? r(P.join(local, "Temp", "cours-iut-bac")) : null,
        claude: local ? r(P.join(local, "Temp", "claude")) : null,
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

/** Le chemin est-il un emplacement d'écriture permis ? Renvoie null si oui, sinon la raison. */
function ecriturePermise(chemin, R, { fournisSeulement = false } = {}) {
    const bac = sous(chemin, R.bac);
    if (bac) {
        const [run, dossier = "", ...reste] = bac;
        if (!RUN_ID.test(run)) return `run-id « ${run} » invalide (a-z, 0-9, -).`;
        // fournis\ lui-même : seulement comme dossier de décompression (-d).
        if (cle(dossier) === "fournis" && (reste.length >= 1 || fournisSeulement)) return null;
        const support = reste.length === 1 || (reste.length === 2 && RUN_ID.test(reste[0]));
        if (!fournisSeulement && cle(dossier) === "supports" && support && ["cours.md", "tp.md"].includes(cle(reste.at(-1) ?? ""))) {
            return null;
        }
        return fournisSeulement
            ? "destination hors de <run-id>\\fournis\\."
            : "dans le bac à sable, seuls supports\\[<section>\\]cours.md, supports\\[<section>\\]tp.md et fournis\\... sont permis.";
    }
    if (!fournisSeulement) {
        const sc = sous(chemin, R.claude);
        if (sc && sc.length >= 2 && cle(sc[sc.length - 2]) === "scratchpad" && COUVERTURE.test(sc[sc.length - 1])) {
            return null;
        }
        if (sc) return "dans le dossier temporaire de Claude, seul ...\\scratchpad\\couverture-<run-id>.md est permis.";
    }
    return "chemin hors des emplacements permis (bac à sable, fichier de couverture).";
}

function lecturePermise(chemin, R) {
    if (!ecriturePermise(chemin, R)) return null;
    const pr = sous(chemin, R.projets);
    if (pr && pr.slice(0, -1).some((s) => cle(s) === "tool-results")) return null;
    return "lecture permise seulement des fichiers écrits par l'agent et des tool-results de Claude Code.";
}

// --- Bash --------------------------------------------------------------------------

function verifierCurl(args, R) {
    let sortie = null;
    let url = null;
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === "-o" || a === "--output") {
            if (sortie !== null) return "un seul -o.";
            sortie = args[++i];
            if (sortie === undefined) return "-o sans chemin.";
        } else if (/^-[fsS]+$/.test(a) || ["--fail", "--silent", "--show-error", "--create-dirs"].includes(a)) {
            // options permises
        } else if (a.startsWith("-")) {
            return `option curl « ${a} » refusée (permises : -f -s -S --create-dirs -o).`;
        } else {
            if (url !== null) return "une seule URL.";
            url = a;
        }
    }
    if (url === null) return "URL manquante.";
    if (!URL_PERMISE.test(url)) return "URL refusée : seul https://salimkhraimeche.dev/download/... est permis.";
    const chemin = url.slice("https://salimkhraimeche.dev".length);
    if (chemin.split("/").some((s) => s === ".." || s === ".")) return "segment « .. » ou « . » dans l'URL.";
    if (URL_FIN_DE_SECTION.test(chemin)) return "URL qui désigne une correction ou un état de fin : à signaler, pas à télécharger.";
    if (sortie === null) return "-o <chemin> obligatoire.";
    const n = normaliser(sortie);
    if (n.erreur) return `-o : ${n.erreur}`;
    const e = ecriturePermise(n.chemin, R, { fournisSeulement: true });
    return e ? `-o : ${e}` : null;
}

function verifierUnzip(args, R) {
    let archive = null;
    let dest = null;
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === "-d") {
            if (dest !== null) return "un seul -d.";
            dest = args[++i];
            if (dest === undefined) return "-d sans dossier.";
        } else if (/^-[qon]+$/.test(a)) {
            // options permises (silence, écrasement, pas d'écrasement)
        } else if (a.startsWith("-")) {
            return `option unzip « ${a} » refusée (permises : -q -o -n -d).`;
        } else {
            if (archive !== null) return "une seule archive, sans liste de membres.";
            archive = a;
        }
    }
    if (archive === null) return "archive manquante.";
    if (dest === null) return "-d <dossier> obligatoire.";
    if (!/\.zip$/i.test(archive)) return "l'archive doit finir par .zip.";
    for (const [nom, brut] of [["archive", archive], ["-d", dest]]) {
        const n = normaliser(brut);
        if (n.erreur) return `${nom} : ${n.erreur}`;
        const e = ecriturePermise(n.chemin, R, { fournisSeulement: true });
        if (e) return `${nom} : ${e}`;
    }
    return null;
}

function verifierBash(commande, R) {
    if (typeof commande !== "string" || commande.trim() === "") return "commande vide ou illisible.";
    if (!CARACTERES_BASH.test(commande)) {
        return "caractère interdit (aucun ; & | < > $ ` ( ) { } [ ] * ? ! ~ # = guillemet, antislash ni retour à la ligne). Chemins en C:/... avec des barres obliques.";
    }
    const [prog, ...args] = commande.trim().split(/ +/);
    if (prog === "curl") return verifierCurl(args, R);
    if (prog === "unzip") return verifierUnzip(args, R);
    return `programme « ${prog} » refusé (seuls curl et unzip sont permis).`;
}

// --- Entrée ------------------------------------------------------------------------

function verifier(entree) {
    const outil = entree?.tool_name;
    if (OUTILS_LIBRES.has(outil) || MCP_PERMIS.has(outil)) return null;
    const R = racines();
    const entreeOutil = entree?.tool_input ?? {};
    if (outil === "Write" || outil === "Read") {
        const n = normaliser(entreeOutil.file_path);
        if (n.erreur) return `${outil} : ${n.erreur}`;
        const e = outil === "Write" ? ecriturePermise(n.chemin, R) : lecturePermise(n.chemin, R);
        return e ? `${outil} : ${e}` : null;
    }
    if (outil === "Bash") return verifierBash(entreeOutil.command, R);
    return `outil « ${outil} » interdit.`;
}

function main() {
    let entree;
    try {
        entree = JSON.parse(readFileSync(0, "utf8").replace(/^\uFEFF/, ""));
    } catch {
        refuser("entrée du hook illisible.");
    }
    const raison = verifier(entree);
    if (raison) refuser(raison);
    process.exit(0);
}

main();
