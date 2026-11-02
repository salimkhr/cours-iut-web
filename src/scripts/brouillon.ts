// src/scripts/brouillon.ts
// Brouillons de supports du pipeline content-writer-v3 (étape « rédaction »).
//
// Les rédacteurs n'écrivent sur aucun serveur : ils rendent l'arbre de blocs de leur
// support dans docs/plans/<module>/brouillons/<section>/<support>.json. Ce script, qui
// ne touche pas à la base, fait sur ce fichier ce que le serveur MCP ferait :
//
//   bun src/scripts/brouillon.ts valider <fichier.json>
//   bun src/scripts/brouillon.ts exporter <fichier.json> --titre "<Module> / <Section>"
//   bun src/scripts/brouillon.ts couverture <fichier.json>
//   bun src/scripts/brouillon.ts deposer <dossier du bac à sable> <fichier.json>...
//   bun src/scripts/brouillon.ts comparer <fichier.json> <relu en prod>
//
// - valider : validateBlockTree (même code que save_content) + blocs permis dans ce
//   type de contenu + comptes. Code 1 si le brouillon serait refusé par le serveur.
// - exporter : écrit <fichier>.md à côté du JSON, au format d'export_content_compact
//   (même blocksToMarkdown, marqueurs <!--id--> identiques à ceux de la prod).
// - couverture : liste des blocs (id, type, parent, profondeur), des sections et des
//   download-file, pour fixer la référence de couverture des relecteurs.
// - deposer : écrit l'export dans <bac>\supports\ (cours.md, tp.md) et le contenu des
//   download-file dans <bac>\fournis\, comme le fait l'agent preparateur pour la prod.
// - comparer : après l'écriture en prod, compare le brouillon à ce que la prod renvoie
//   (sortie de get_content enregistrée dans un fichier : JSON { blocks } ou tableau,
//   ou export compact) ; code 1 au moindre écart.
//
// Le type de contenu se déduit du nom du fichier : cours.json, slides.json, tp.json,
// examen.json.
//
// Quiz de module : les candidates vivent dans docs/plans/<module>/brouillons/quiz/ :
//
//   bun src/scripts/brouillon.ts valider-quiz <fichier.json>
//   bun src/scripts/brouillon.ts extraire-quiz <sortie.json> --ids a,b,c <fichier.json>...
//   bun src/scripts/brouillon.ts exporter-quiz <fichier.json>... --sortie <q.md> [--cle <cle.md>] [--sans-enonce]
//
// - valider-quiz : même quizQuestionSchema que le serveur, plus les étiquettes
//   (sections, geste, notion, type, Bloom, difficulté). Le fichier transversal.json
//   exige au moins deux sections par candidate.
// - extraire-quiz : rassemble les candidates retenues dans un seul fichier.
// - exporter-quiz : énoncés et propositions, sans les bonnes réponses, propositions
//   mélangées et lettrées ; --sans-enonce ne garde que les propositions ; --cle écrit la
//   table des lettres justes, à ne jamais déposer dans le bac à sable.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { isTypeAllowedInContent } from "@/lib/blockSchemas";
import { blocksToMarkdown } from "@/lib/blockTextUtils";
import { quizQuestionSchema } from "@/lib/schemas/quiz.schema";
import { validateBlockTree, type ValidationError } from "@/lib/validateBlockTree";
import type { Block } from "@/types/CourseContent";

export type TypeBrouillon = "cours" | "slide" | "TP" | "examen";

const TYPES_PAR_FICHIER: Record<string, TypeBrouillon> = {
    "cours.json": "cours",
    "slides.json": "slide",
    "tp.json": "TP",
    "examen.json": "examen",
};

/** Fichier de support déposé dans le bac à sable pour chaque type (les slides n'y vont jamais). */
const SUPPORT_BAC: Partial<Record<TypeBrouillon, string>> = {
    cours: "cours.md",
    TP: "tp.md",
    examen: "examen.md",
};

export function typeDuFichier(fichier: string): TypeBrouillon {
    const type = TYPES_PAR_FICHIER[path.basename(fichier).toLowerCase()];
    if (!type) {
        throw new Error(
            `Nom de brouillon inattendu : ${path.basename(fichier)} (attendu : ${Object.keys(TYPES_PAR_FICHIER).join(", ")}).`,
        );
    }
    return type;
}

export interface LigneBloc {
    id: string;
    type: string;
    parent: string | null;
    profondeur: number;
    titre?: string;
}

/** Parcours en profondeur, dans l'ordre du document. */
export function listerBlocs(blocks: Block[]): LigneBloc[] {
    const lignes: LigneBloc[] = [];
    const visiter = (liste: Block[], parent: string | null, profondeur: number) => {
        for (const b of liste) {
            const titre = typeof b.props?.title === "string" ? b.props.title : undefined;
            lignes.push({ id: b.id, type: b.type, parent, profondeur, titre });
            if (Array.isArray(b.children)) visiter(b.children, b.id, profondeur + 1);
        }
    };
    visiter(blocks, null, 0);
    return lignes;
}

export interface Comptes {
    blocs: number;
    sections: number;
    slides: number;
    slidesSansNote: string[];
    downloadFiles: string[];
}

export function compter(blocks: Block[]): Comptes {
    const lignes = listerBlocs(blocks);
    const slides = lignes.filter((l) => l.type === "slide");
    const avecNote = new Set(lignes.filter((l) => l.type === "slide-note").map((l) => l.parent));
    return {
        blocs: lignes.length,
        sections: lignes.filter((l) => l.type === "section").length,
        slides: slides.length,
        slidesSansNote: slides.filter((s) => !avecNote.has(s.id)).map((s) => s.id),
        downloadFiles: lignes.filter((l) => l.type === "download-file").map((l) => l.id),
    };
}

export interface ResultatValidation {
    valide: boolean;
    erreurs: ValidationError[];
    comptes: Comptes | null;
}

/** Ce que save_content accepterait, plus la règle cours/TP vs slides du builder. */
export function valider(input: unknown, type: TypeBrouillon): ResultatValidation {
    const v = validateBlockTree(input);
    if (!v.valid) return { valide: false, erreurs: v.errors, comptes: null };
    const blocks = input as Block[];
    const erreurs: ValidationError[] = listerBlocs(blocks)
        .filter((l) => !isTypeAllowedInContent(l.type, type))
        .map((l) => ({ path: l.id, message: `Le type ${l.type} n'a pas sa place dans un contenu « ${type} »` }));
    return { valide: erreurs.length === 0, erreurs, comptes: compter(blocks) };
}

/** Même forme que l'export du serveur ; « brouillon » à la place de la version. */
export function exporter(blocks: Block[], type: TypeBrouillon, titre: string, date = new Date()): string {
    const jour = date.toISOString().slice(0, 10);
    const header = [
        `<!-- export: ${titre} / ${type} | brouillon | ${jour} -->`,
        `# ${titre} / ${type}`,
    ].join("\n");
    return `${header}\n\n${blocksToMarkdown(blocks, true)}`;
}

/** Ids des marqueurs d'un export : une ligne qui ne contient que <!--id-->. */
export function idsDesMarqueurs(markdown: string): string[] {
    return markdown
        .split("\n")
        .map((l) => /^\s*<!--(\S[^>]*?)-->\s*$/.exec(l))
        .filter((m): m is RegExpExecArray => m !== null)
        .map((m) => m[1]);
}

export interface FichierFourni {
    id: string;
    chemin: string;
    contenu: string;
}

/** Chemin relatif sûr : pas d'absolu, pas de « .. », pas de lecteur. */
export function cheminFourniSur(nom: string): boolean {
    if (nom.trim() === "" || path.isAbsolute(nom) || /^[A-Za-z]:/.test(nom)) return false;
    return !nom.split(/[\\/]/).some((s) => s === ".." || s === "");
}

export function fichiersFournis(blocks: Block[]): { fournis: FichierFourni[]; ecartes: string[] } {
    const fournis: FichierFourni[] = [];
    const ecartes: string[] = [];
    const visiter = (liste: Block[]) => {
        for (const b of liste) {
            if (b.type === "download-file") {
                const nom = String(b.props?.filename ?? "");
                const code = String(b.props?.code ?? "");
                if (!cheminFourniSur(nom)) ecartes.push(`${b.id} : nom de fichier refusé (« ${nom} »)`);
                else if (code === "") ecartes.push(`${b.id} : contenu vide (${nom})`);
                else fournis.push({ id: b.id, chemin: nom, contenu: code });
            }
            if (Array.isArray(b.children)) visiter(b.children);
        }
    };
    visiter(blocks);
    return { fournis, ecartes };
}

export function tableauCouverture(blocks: Block[]): string {
    const lignes = listerBlocs(blocks);
    const c = compter(blocks);
    const out = [
        "| id | type | parent | profondeur |",
        "|---|---|---|---|",
        ...lignes.map((l) => `| ${l.id} | ${l.type} | ${l.parent ?? "—"} | ${l.profondeur} |`),
        "",
        `Total : ${c.blocs} blocs.`,
        "",
        "Sections (exercices, bonus et parties) :",
        "| id | profondeur | titre | bonus |",
        "|---|---|---|---|",
        ...lignes
            .filter((l) => l.type === "section")
            .map((l) => `| ${l.id} | ${l.profondeur} | ${l.titre ?? ""} | ${/bonus/i.test(l.titre ?? "") ? "oui" : "non"} |`),
        "",
        `download-file : ${c.downloadFiles.length ? c.downloadFiles.join(", ") : "aucun"}`,
    ];
    if (c.slides > 0) {
        out.push(`Slides : ${c.slides} ; sans slide-note : ${c.slidesSansNote.length ? c.slidesSansNote.join(", ") : "aucune"}`);
    }
    return out.join("\n");
}

/** Tri récursif des clés : deux arbres égaux au sens JSON donnent la même chaîne. */
function canonique(valeur: unknown): unknown {
    if (Array.isArray(valeur)) return valeur.map(canonique);
    if (valeur !== null && typeof valeur === "object") {
        return Object.fromEntries(
            Object.keys(valeur as Record<string, unknown>)
                .sort()
                .map((k) => [k, canonique((valeur as Record<string, unknown>)[k])]),
        );
    }
    return valeur;
}

/** Retire les `children: []` comme le fait le serveur à l'écriture (pruneEmptyLeafChildren). */
function sansEnfantsVides(blocks: Block[]): Block[] {
    return blocks.map((b) => {
        const { children, ...reste } = b;
        if (!Array.isArray(children) || children.length === 0) return reste as Block;
        return { ...reste, children: sansEnfantsVides(children) } as Block;
    });
}

export interface ResultatComparaison {
    identique: boolean;
    forme: "arbre" | "export";
    manquants: string[];
    enTrop: string[];
    differents: string[];
}

/**
 * Fichier tool-results de Claude Code : enveloppe MCP [{ type: "text", text }]. On en
 * rend le texte ; tout autre contenu est rendu tel quel.
 */
export function deballer(contenu: string): string {
    try {
        const json = JSON.parse(contenu.replace(/^﻿/, "")) as unknown;
        if (
            Array.isArray(json) && json.length > 0
            && json.every((p) => p && typeof p === "object" && (p as { type?: unknown }).type === "text"
                && typeof (p as { text?: unknown }).text === "string")
        ) {
            return (json as { text: string }[]).map((p) => p.text).join("");
        }
    } catch {
        // pas du JSON : export compact
    }
    return contenu;
}

/**
 * Compare un brouillon à ce que la prod renvoie. `relu` est soit la sortie JSON de
 * get_content ({ blocks } ou tableau), comparée bloc par bloc, soit un export compact,
 * dont on ne compare que les ids des marqueurs.
 */
export function comparer(brouillon: Block[], relu: string): ResultatComparaison {
    const attendus = listerBlocs(brouillon).map((l) => l.id);
    relu = deballer(relu);
    let arbre: Block[] | null = null;
    try {
        const json = JSON.parse(relu.replace(/^﻿/, "")) as unknown;
        if (Array.isArray(json)) arbre = json as Block[];
        else if (json && typeof json === "object" && Array.isArray((json as { blocks?: unknown }).blocks)) {
            arbre = (json as { blocks: Block[] }).blocks;
        }
    } catch {
        arbre = null;
    }
    const lus = arbre ? listerBlocs(arbre).map((l) => l.id) : idsDesMarqueurs(relu);
    const setLus = new Set(lus);
    const setAttendus = new Set(attendus);
    const manquants = attendus.filter((id) => !setLus.has(id));
    const enTrop = lus.filter((id) => !setAttendus.has(id));
    const differents: string[] = [];
    if (arbre) {
        const parId = (bs: Block[]) => {
            const m = new Map<string, string>();
            const visiter = (liste: Block[]) => {
                for (const b of liste) {
                    const { children, ...reste } = b;
                    const enfants = Array.isArray(children) ? children.map((c) => c.id) : [];
                    m.set(b.id, JSON.stringify(canonique({ ...reste, enfants })));
                    if (Array.isArray(children)) visiter(children);
                }
            };
            visiter(bs);
            return m;
        };
        const a = parId(sansEnfantsVides(brouillon));
        const l = parId(arbre);
        for (const [id, v] of a) if (l.has(id) && l.get(id) !== v) differents.push(id);
    }
    const ordreIdentique = manquants.length === 0 && enTrop.length === 0 && attendus.join("\n") === lus.join("\n");
    return {
        identique: ordreIdentique && differents.length === 0,
        forme: arbre ? "arbre" : "export",
        manquants,
        enTrop,
        differents,
    };
}

const etiquettesSchema = z.object({
    sections: z.array(z.string().min(1)).min(1),
    geste: z.string().min(1),
    notion: z.string().min(1),
    type: z.enum(["prediction", "diagnostic", "choix", "justification"]),
    bloom: z.enum(["comprendre", "appliquer", "analyser", "evaluer"]),
    difficulte: z.enum(["facile", "moyenne", "difficile"]),
});

export type Etiquettes = z.infer<typeof etiquettesSchema>;

export interface Candidate {
    id: string;
    blocks: Block[];
    options: { id: string; text: string; correct: boolean }[];
    weight?: number;
    durationSeconds?: number;
    etiquettes: Etiquettes;
}

export interface ResultatQuiz {
    valide: boolean;
    erreurs: ValidationError[];
    questions: number;
    bloom: Record<string, number>;
}

/** Ce que add_quiz_question accepterait, plus les étiquettes de la spec § 7. */
export function validerQuiz(input: unknown, transversal = false): ResultatQuiz {
    if (!Array.isArray(input)) {
        return { valide: false, erreurs: [{ path: "", message: "Tableau de candidates attendu" }], questions: 0, bloom: {} };
    }
    const erreurs: ValidationError[] = [];
    const bloom: Record<string, number> = {};
    const vus = new Set<string>();
    input.forEach((brut: Record<string, unknown>, i) => {
        const id = typeof brut?.id === "string" ? brut.id : `#${i}`;
        const signaler = (p: string, message: string) => erreurs.push({ path: `${id}${p}`, message });
        if (vus.has(id)) signaler("", "Identifiant de candidate en double");
        vus.add(id);
        const { etiquettes, ...question } = brut ?? {};
        const q = quizQuestionSchema.safeParse(question);
        if (!q.success) q.error.issues.forEach((e) => signaler(`.${e.path.join(".")}`, e.message));
        const e = etiquettesSchema.safeParse(etiquettes);
        if (!e.success) {
            e.error.issues.forEach((x) => signaler(`.etiquettes.${x.path.join(".")}`, x.message));
            return;
        }
        bloom[e.data.bloom] = (bloom[e.data.bloom] ?? 0) + 1;
        if (transversal && e.data.sections.length < 2) signaler(".etiquettes.sections", "Une candidate transversale relie au moins deux sections");
    });
    return { valide: erreurs.length === 0, erreurs, questions: input.length, bloom };
}

/** Rassemble les candidates demandées, dans l'ordre des ids. */
export function extraireQuiz(candidates: Candidate[], ids: string[]): Candidate[] {
    const parId = new Map(candidates.map((c) => [c.id, c]));
    return ids.map((id) => {
        const c = parId.get(id);
        if (!c) throw new Error(`Candidate inconnue : ${id}`);
        return c;
    });
}

/** Ordre fixe mais sans lien avec l'ordre de rédaction : la bonne réponse ne se déduit pas de sa place. */
function melanger<T extends { id: string }>(options: T[], graine: string): T[] {
    const cle = (o: T) => createHash("sha256").update(`${graine}:${o.id}`).digest("hex");
    return [...options].sort((a, b) => cle(a).localeCompare(cle(b)));
}

export function exporterQuiz(candidates: Candidate[], sansEnonce = false): { questions: string; cle: string } {
    const questions: string[] = [];
    const cle = ["| Question | Lettres justes | Id des propositions |", "|---|---|---|"];
    for (const c of candidates) {
        const options = melanger(c.options, c.id);
        const lettre = (i: number) => String.fromCharCode(65 + i);
        questions.push(
            `## Question ${c.id}`,
            ...(sansEnonce ? [] : ["", blocksToMarkdown(c.blocks, false)]),
            "",
            "Propositions (une ou plusieurs justes) :",
            ...options.map((o, i) => `- ${lettre(i)}. ${o.text}`),
            "",
        );
        const justes = options.flatMap((o, i) => (o.correct ? [lettre(i)] : []));
        cle.push(`| ${c.id} | ${justes.join(", ")} | ${options.map((o, i) => `${lettre(i)} = ${o.id}`).join(", ")} |`);
    }
    return { questions: questions.join("\n"), cle: `${cle.join("\n")}\n` };
}

function lireBrouillon(fichier: string): unknown {
    return JSON.parse(readFileSync(fichier, "utf8").replace(/^﻿/, ""));
}

function option(args: string[], nom: string): string | undefined {
    const i = args.indexOf(nom);
    return i === -1 ? undefined : args[i + 1];
}

function main(argv: string[]): number {
    const [commande, ...args] = argv;
    switch (commande) {
        case "valider": {
            const fichier = args[0];
            if (!fichier) throw new Error("Usage : valider <fichier.json>");
            const r = valider(lireBrouillon(fichier), typeDuFichier(fichier));
            if (!r.valide) {
                console.log(`INVALIDE : ${r.erreurs.length} erreur(s)`);
                for (const e of r.erreurs) console.log(`- ${e.path} : ${e.message}`);
                return 1;
            }
            const c = r.comptes!;
            console.log(`VALIDE : ${c.blocs} blocs, ${c.sections} sections, ${c.downloadFiles.length} download-file`);
            if (c.slides > 0) {
                console.log(`Slides : ${c.slides} ; sans slide-note : ${c.slidesSansNote.length ? c.slidesSansNote.join(", ") : "aucune"}`);
            }
            return 0;
        }
        case "exporter": {
            const fichier = args[0];
            const titre = option(args, "--titre");
            if (!fichier || !titre) throw new Error("Usage : exporter <fichier.json> --titre \"<Module> / <Section>\"");
            const type = typeDuFichier(fichier);
            const input = lireBrouillon(fichier);
            const r = valider(input, type);
            if (!r.valide) {
                console.log(`INVALIDE : lancez « valider » (${r.erreurs.length} erreur(s)).`);
                return 1;
            }
            const md = exporter(input as Block[], type, titre);
            const sortie = fichier.replace(/\.json$/i, ".md");
            writeFileSync(sortie, md, "utf8");
            const ids = idsDesMarqueurs(md);
            console.log(`${sortie} : ${md.length} caractères, ${ids.length} marqueurs pour ${r.comptes!.blocs} blocs`);
            return ids.length === r.comptes!.blocs ? 0 : 1;
        }
        case "couverture": {
            const fichier = args[0];
            if (!fichier) throw new Error("Usage : couverture <fichier.json>");
            console.log(tableauCouverture(lireBrouillon(fichier) as Block[]));
            return 0;
        }
        case "deposer": {
            const [bac, ...fichiers] = args;
            if (!bac || fichiers.length === 0) throw new Error("Usage : deposer <dossier du bac à sable> <fichier.json>...");
            const titre = option(fichiers, "--titre") ?? "brouillon";
            let code = 0;
            for (const fichier of fichiers.filter((f) => f.toLowerCase().endsWith(".json"))) {
                const type = typeDuFichier(fichier);
                const support = SUPPORT_BAC[type];
                if (!support) {
                    console.log(`${fichier} : jamais déposé dans le bac à sable (${type}).`);
                    continue;
                }
                const input = lireBrouillon(fichier);
                if (!valider(input, type).valide) {
                    console.log(`${fichier} : INVALIDE, rien déposé.`);
                    code = 1;
                    continue;
                }
                const blocks = input as Block[];
                const cible = path.join(bac, "supports", support);
                mkdirSync(path.dirname(cible), { recursive: true });
                writeFileSync(cible, exporter(blocks, type, titre), "utf8");
                console.log(`${cible} ← ${fichier}`);
                const { fournis, ecartes } = fichiersFournis(blocks);
                for (const f of fournis) {
                    const dest = path.join(bac, "fournis", f.chemin);
                    mkdirSync(path.dirname(dest), { recursive: true });
                    writeFileSync(dest, f.contenu, "utf8");
                    console.log(`${dest} ← download-file ${f.id}`);
                }
                for (const e of ecartes) console.log(`non déposé : ${e}`);
            }
            return code;
        }
        case "comparer": {
            const [fichier, relu] = args;
            if (!fichier || !relu) throw new Error("Usage : comparer <fichier.json> <relu en prod>");
            const r = comparer(lireBrouillon(fichier) as Block[], readFileSync(relu, "utf8"));
            console.log(`${r.identique ? "IDENTIQUE" : "ÉCART"} (comparaison ${r.forme === "arbre" ? "bloc par bloc" : "des ids de l'export"})`);
            if (r.manquants.length) console.log(`absents de la prod : ${r.manquants.join(", ")}`);
            if (r.enTrop.length) console.log(`en trop en prod : ${r.enTrop.join(", ")}`);
            if (r.differents.length) console.log(`contenu différent : ${r.differents.join(", ")}`);
            return r.identique ? 0 : 1;
        }
        case "valider-quiz": {
            const fichier = args[0];
            if (!fichier) throw new Error("Usage : valider-quiz <fichier.json>");
            const r = validerQuiz(lireBrouillon(fichier), path.basename(fichier).toLowerCase() === "transversal.json");
            if (!r.valide) {
                console.log(`INVALIDE : ${r.erreurs.length} erreur(s)`);
                for (const e of r.erreurs) console.log(`- ${e.path} : ${e.message}`);
                return 1;
            }
            const bloom = Object.entries(r.bloom).map(([k, n]) => `${k} ${n}`).join(", ");
            console.log(`VALIDE : ${r.questions} candidates (${bloom})`);
            return 0;
        }
        case "extraire-quiz": {
            const ids = option(args, "--ids");
            const i = args.indexOf("--ids");
            const fichiers = args.filter((_, n) => n !== i && n !== i + 1);
            const [sortie, ...sources] = fichiers;
            if (!ids || !sortie || sources.length === 0) {
                throw new Error("Usage : extraire-quiz <sortie.json> --ids a,b,c <fichier.json>...");
            }
            const candidates = sources.flatMap((f) => lireBrouillon(f) as Candidate[]);
            const retenues = extraireQuiz(candidates, ids.split(",").map((s) => s.trim()).filter(Boolean));
            writeFileSync(sortie, JSON.stringify(retenues, null, 1), "utf8");
            console.log(`${sortie} : ${retenues.length} candidates`);
            return 0;
        }
        case "exporter-quiz": {
            const sortie = option(args, "--sortie");
            const fichierCle = option(args, "--cle");
            const fichiers = args.filter((a) => a.toLowerCase().endsWith(".json"));
            if (!sortie || fichiers.length === 0) {
                throw new Error("Usage : exporter-quiz <fichier.json>... --sortie <q.md> [--cle <cle.md>] [--sans-enonce]");
            }
            const candidates = fichiers.flatMap((f) => lireBrouillon(f) as Candidate[]);
            const { questions, cle } = exporterQuiz(candidates, args.includes("--sans-enonce"));
            mkdirSync(path.dirname(sortie), { recursive: true });
            writeFileSync(sortie, questions, "utf8");
            if (fichierCle) writeFileSync(fichierCle, cle, "utf8");
            console.log(`${sortie} : ${candidates.length} questions`);
            return 0;
        }
        default:
            console.log("Commandes : valider, exporter, couverture, deposer, comparer, valider-quiz, extraire-quiz, exporter-quiz (voir l'en-tête du script).");
            return 1;
    }
}

if (import.meta.main) {
    try {
        process.exit(main(process.argv.slice(2)));
    } catch (e) {
        console.error(e instanceof Error ? e.message : String(e));
        process.exit(1);
    }
}
