import { describe, expect, test } from "bun:test";
import {
    cheminFourniSur,
    comparer,
    compter,
    exporter,
    exporterQuiz,
    extraireQuiz,
    fichiersFournis,
    idsDesMarqueurs,
    relectureQuiz,
    typeDuFichier,
    valider,
    validerQuiz,
    type Candidate,
} from "@/scripts/brouillon";
import type { Block } from "@/types/CourseContent";

const candidate = (id: string, sections = ["7-sessions"]): Candidate => ({
    id,
    blocks: [{ id: `${id}-t`, type: "text", props: { content: "Que renvoie `session_start()` ici ?" } }] as Block[],
    options: [
        { id: `${id}-a`, text: "Une erreur", correct: false },
        { id: `${id}-b`, text: "true", correct: true },
    ],
    durationSeconds: 45,
    etiquettes: { sections, geste: "E3", notion: "session", type: "prediction", bloom: "analyser", difficulte: "moyenne" },
});

describe("quiz", () => {
    test("accepte une candidate et compte les niveaux de Bloom", () => {
        const r = validerQuiz([candidate("q1"), candidate("q2")]);
        expect(r.erreurs).toEqual([]);
        expect(r.bloom).toEqual({ analyser: 2 });
    });

    test("refuse ce que le serveur refuserait", () => {
        const c = candidate("q1");
        c.options = c.options.map((o) => ({ ...o, correct: true }));
        expect(validerQuiz([c]).valide).toBe(false);
    });

    test("refuse le niveau « se souvenir » et les étiquettes absentes", () => {
        const c = candidate("q1");
        (c.etiquettes as { bloom: string }).bloom = "se souvenir";
        expect(validerQuiz([c]).valide).toBe(false);
        const { etiquettes: _, ...nue } = candidate("q2");
        expect(validerQuiz([nue]).valide).toBe(false);
    });

    test("refuse un doublon d'identifiant", () => {
        expect(validerQuiz([candidate("q1"), candidate("q1")]).valide).toBe(false);
    });

    test("une transversale relie au moins deux sections", () => {
        expect(validerQuiz([candidate("q1")], true).valide).toBe(false);
        expect(validerQuiz([candidate("q1", ["6", "7"])], true).valide).toBe(true);
    });

    test("l'export ne contient ni le corrigé ni les id de propositions", () => {
        const { questions, cle } = exporterQuiz([candidate("q1")]);
        expect(questions).toContain("session_start()");
        expect(questions).not.toContain("q1-b");
        expect(questions).not.toContain("correct");
        expect(cle).toMatch(/q1 \| [AB] \|/);
    });

    test("sans énoncé, seules les propositions restent", () => {
        const { questions } = exporterQuiz([candidate("q1")], true);
        expect(questions).not.toContain("session_start()");
        expect(questions).toContain("Une erreur");
    });

    test("la relecture montre l'énoncé, la bonne réponse et les étiquettes", () => {
        const md = relectureQuiz([candidate("q1")]);
        expect(md).toContain("session_start()");
        expect(md).toContain("- [x] **true**");
        expect(md).toContain("- [ ] Une erreur");
        expect(md).toContain("analyser");
        expect(md).toContain("45 s");
    });

    test("extraire garde l'ordre demandé et refuse un id inconnu", () => {
        const liste = [candidate("q1"), candidate("q2")];
        expect(extraireQuiz(liste, ["q2", "q1"]).map((c) => c.id)).toEqual(["q2", "q1"]);
        expect(() => extraireQuiz(liste, ["q3"])).toThrow();
    });
});

const cours: Block[] = [
    {
        id: "n1",
        type: "section",
        props: { title: "Sessions PHP" },
        children: [
            { id: "n1-txt", type: "text", props: { content: "HTTP est sans état." } },
            { id: "n1-code", type: "code", props: { language: "php", filename: "favoris.php", code: "<?php\nsession_start();" } },
            {
                id: "n1-warn",
                type: "callout",
                props: { variant: "warning", title: "session_start() après une sortie" },
                children: [{ id: "n1-warn-txt", type: "text", props: { content: "Warning: ..." } }],
            },
        ],
    },
] as Block[];

const slides: Block[] = [
    {
        id: "s1",
        type: "slide",
        props: { title: "La mémoire du serveur" },
        children: [
            { id: "s1-txt", type: "slide-text", props: { content: "HTTP oublie tout." } },
            { id: "s1-note", type: "slide-note", props: { content: "Demander : qui se souvient du cours 1 ?" } },
        ],
    },
    { id: "s2", type: "slide", props: { title: "Sans note" }, children: [] },
] as Block[];

describe("typeDuFichier", () => {
    test("déduit le type du nom du brouillon", () => {
        expect(typeDuFichier("docs/plans/php/brouillons/7-x/cours.json")).toBe("cours");
        expect(typeDuFichier("slides.json")).toBe("slide");
        expect(typeDuFichier("TP.json")).toBe("TP");
        expect(typeDuFichier("examen.json")).toBe("examen");
    });

    test("refuse un autre nom", () => {
        expect(() => typeDuFichier("brouillon.json")).toThrow();
    });
});

describe("valider", () => {
    test("accepte un cours valide et compte ses blocs", () => {
        const r = valider(cours, "cours");
        expect(r.valide).toBe(true);
        expect(r.comptes?.blocs).toBe(5);
        expect(r.comptes?.sections).toBe(1);
    });

    test("refuse un id dupliqué, comme save_content", () => {
        const doublon = [cours[0], { id: "n1", type: "text", props: { content: "x" } }];
        const r = valider(doublon, "cours");
        expect(r.valide).toBe(false);
        expect(r.erreurs[0].message).toContain("id dupliqué");
    });

    test("refuse un type inconnu", () => {
        const r = valider([{ id: "a", type: "exercice", props: {} }], "TP");
        expect(r.valide).toBe(false);
    });

    test("refuse un bloc de slide dans un cours", () => {
        const r = valider(slides, "cours");
        expect(r.valide).toBe(false);
        expect(r.erreurs.some((e) => e.path === "s1")).toBe(true);
    });

    test("liste les slides sans slide-note", () => {
        const r = valider(slides, "slide");
        expect(r.valide).toBe(true);
        expect(r.comptes?.slidesSansNote).toEqual(["s2"]);
    });
});

describe("exporter", () => {
    test("pose un marqueur par bloc, avec les ids du brouillon", () => {
        const md = exporter(cours, "cours", "PHP / Sessions", new Date("2026-10-28T10:00:00Z"));
        expect(md.startsWith("<!-- export: PHP / Sessions / cours | brouillon | 2026-10-28 -->")).toBe(true);
        expect(idsDesMarqueurs(md).sort()).toEqual(["n1", "n1-code", "n1-txt", "n1-warn", "n1-warn-txt"]);
    });

    test("l'en-tête n'est pas compté comme marqueur", () => {
        expect(idsDesMarqueurs("<!-- export: x -->\n<!--a-->\n  <!--b-->")).toEqual(["a", "b"]);
    });
});

describe("fichiers fournis", () => {
    test("garde les download-file, écarte les noms dangereux et les contenus vides", () => {
        const tp = [
            { id: "f1", type: "download-file", props: { language: "sql", filename: "sql/users.sql", code: "CREATE TABLE users ();" } },
            { id: "f2", type: "download-file", props: { language: "php", filename: "../config.php", code: "<?php" } },
            { id: "f3", type: "download-file", props: { language: "php", filename: "vide.php", code: "" } },
        ] as Block[];
        const { fournis, ecartes } = fichiersFournis(tp);
        expect(fournis.map((f) => f.chemin)).toEqual(["sql/users.sql"]);
        expect(ecartes).toHaveLength(2);
    });

    test("chemins sûrs seulement", () => {
        expect(cheminFourniSur("core/functions.php")).toBe(true);
        expect(cheminFourniSur("C:/x.php")).toBe(false);
        expect(cheminFourniSur("/etc/passwd")).toBe(false);
        expect(cheminFourniSur("a//b")).toBe(false);
    });
});

describe("comparer", () => {
    test("identique quand get_content renvoie le même arbre (clés dans un autre ordre)", () => {
        const relu = JSON.stringify({
            contentId: "x",
            blocks: [{ ...cours[0], children: cours[0].children!.map((c) => ({ props: c.props, type: c.type, id: c.id, ...(c.children ? { children: c.children } : {}) })) }],
        });
        expect(comparer(cours, relu).identique).toBe(true);
    });

    test("ignore les children vides retirés par le serveur", () => {
        const avecVide = [{ id: "t", type: "text", props: { content: "a" }, children: [] }] as Block[];
        const relu = JSON.stringify([{ id: "t", type: "text", props: { content: "a" } }]);
        expect(comparer(avecVide, relu).identique).toBe(true);
    });

    test("repère un bloc modifié, absent ou en trop", () => {
        const modifie = JSON.parse(JSON.stringify(cours)) as Block[];
        modifie[0].children![0].props = { content: "autre" };
        modifie[0].children!.pop();
        modifie[0].children!.push({ id: "intrus", type: "text", props: { content: "x" } } as Block);
        const r = comparer(cours, JSON.stringify({ blocks: modifie }));
        expect(r.identique).toBe(false);
        expect(r.differents).toContain("n1-txt");
        expect(r.manquants).toEqual(["n1-warn", "n1-warn-txt"]);
        expect(r.enTrop).toEqual(["intrus"]);
    });

    test("déballe l'enveloppe MCP d'un fichier tool-results", () => {
        const enveloppe = JSON.stringify([{ type: "text", text: JSON.stringify({ contentId: "x", blocks: cours, version: 3 }) }]);
        const r = comparer(cours, enveloppe);
        expect(r.forme).toBe("arbre");
        expect(r.identique).toBe(true);
    });

    test("compare les ids d'un export compact", () => {
        const md = exporter(cours, "cours", "PHP / Sessions");
        const r = comparer(cours, md);
        expect(r.forme).toBe("export");
        expect(r.identique).toBe(true);
    });
});

describe("compter", () => {
    test("repère les download-file", () => {
        const c = compter([{ id: "f1", type: "download-file", props: { language: "sql", filename: "a.sql", code: "x" } }] as Block[]);
        expect(c.downloadFiles).toEqual(["f1"]);
    });
});
