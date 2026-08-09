import {test, expect} from "bun:test";
import {blockDefs} from "@/lib/blockDefs";
import {blockPropsSchemas} from "@/lib/blockSchemas";

test("configure les champs code longs sur 15 lignes dans le builder", () => {
    for (const type of ["code", "code-with-preview", "download-file", "slide-code"]) {
        const def = blockDefs.find((blockDef) => blockDef.type === type);
        const codeField = def?.fields.find((field) => field.key === "code");

        expect(codeField?.rows).toBe(15);
    }
});

test("le bloc code-with-preview propose les mêmes langages que le bloc code", () => {
    const codeDef = blockDefs.find((def) => def.type === "code");
    const previewDef = blockDefs.find((def) => def.type === "code-with-preview");

    const codeLangs = codeDef?.fields.find((f) => f.key === "language")?.options;
    const previewLangs = previewDef?.fields.find((f) => f.key === "language")?.options;

    expect(previewLangs).toEqual(codeLangs);
});

test("le second panneau de code est configuré comme le premier", () => {
    const def = blockDefs.find((blockDef) => blockDef.type === "code-with-preview");
    const secondary = def?.fields.find((field) => field.key === "secondaryCode");

    expect(secondary?.rows).toBe(15);
    expect(def?.fields.find((f) => f.key === "secondaryLanguage")?.type).toBe("select");
});

test("la description du bloc documente les marqueurs pour le MCP", () => {
    const def = blockDefs.find((blockDef) => blockDef.type === "code-with-preview");

    expect(def?.description).toContain("@edit:");
});

test("les champs de code du bloc exposent un placeholder au MCP", () => {
    const def = blockDefs.find((blockDef) => blockDef.type === "code-with-preview");

    // `list_block_types` n'expose que description, label et placeholder : c'est
    // tout ce qu'un agent connaît du bloc. Un champ sans placeholder le laisse
    // deviner le format attendu.
    for (const key of ["code", "secondaryCode", "preview"]) {
        expect(def?.fields.find((field) => field.key === key)?.placeholder).toBeTruthy();
    }

    expect(def?.fields.find((field) => field.key === "preview")?.placeholder).toContain("@edit:");
});

test("le schéma interne code-with-preview de blockDefs reste synchronisé avec blockPropsSchemas", () => {
    const def = blockDefs.find((blockDef) => blockDef.type === "code-with-preview");
    const defSchema = def?.schema;
    const propsSchema = blockPropsSchemas["code-with-preview"];

    expect(defSchema).toBeDefined();
    expect(propsSchema).toBeDefined();

    const samples: unknown[] = [
        // Tous les champs valides, y compris le second panneau.
        {
            language: "html",
            code: "<button>Cliquez</button>",
            preview: "<!doctype html>...",
            secondaryLanguage: "css",
            secondaryCode: ".btn { color: red; }",
        },
        // Champs optionnels absents : doit rester valide sur les deux schémas.
        {language: "html", code: "<button>Cliquez</button>"},
        // "code" manquant : doit échouer sur les deux schémas.
        {language: "html", preview: "<!doctype html>...", secondaryLanguage: "css", secondaryCode: "x"},
        // "language" manquant : doit échouer sur les deux schémas.
        {code: "<button>Cliquez</button>"},
        // secondaryLanguage / secondaryCode d'un mauvais type : doit échouer sur les deux schémas.
        {language: "html", code: "<button>Cliquez</button>", secondaryLanguage: 42, secondaryCode: true},
        // Second code sans langage : doit échouer sur les deux schémas.
        {language: "html", code: "<button>Cliquez</button>", secondaryCode: ".btn { color: red; }"},
        // Second code avec un langage vide : idem.
        {language: "html", code: "<button>Cliquez</button>", secondaryLanguage: "", secondaryCode: ".btn { color: red; }"},
    ];

    for (const sample of samples) {
        const defResult = defSchema!.safeParse(sample);
        const propsResult = propsSchema.safeParse(sample);

        expect(defResult.success).toBe(propsResult.success);

        if (defResult.success && propsResult.success) {
            expect(Object.keys(defResult.data as object).sort()).toEqual(
                Object.keys(propsResult.data as object).sort()
            );
        }
    }
});

test("un second code sans langage est refusé, un second panneau absent reste valide", () => {
    const def = blockDefs.find((blockDef) => blockDef.type === "code-with-preview");
    const schemas = [def!.schema, blockPropsSchemas["code-with-preview"]];

    const sansLangage = {language: "html", code: "<p>a</p>", secondaryCode: "<p>b</p>"};
    const langageVide = {...sansLangage, secondaryLanguage: "   "};
    const complet = {...sansLangage, secondaryLanguage: "css"};
    const panneauUnique = {language: "html", code: "<p>a</p>"};

    for (const schema of schemas) {
        // Langage manquant ou vide : `normalizeLanguage("")` vaut `"text"`, donc
        // non exécutable — l'édition du bloc entier tombait et le second code
        // n'atteignait jamais l'aperçu, sans le moindre avertissement.
        expect(schema.safeParse(sansLangage).success).toBe(false);
        expect(schema.safeParse(langageVide).success).toBe(false);
        expect(schema.safeParse(complet).success).toBe(true);
        // Le second panneau reste facultatif : un bloc à un seul code passe.
        expect(schema.safeParse(panneauUnique).success).toBe(true);
    }

    // L'erreur désigne le champ fautif, pour que le builder la place au bon endroit.
    const issue = blockPropsSchemas["code-with-preview"].safeParse(sansLangage).error?.issues[0];
    expect(issue?.path).toEqual(["secondaryLanguage"]);
    expect(issue?.message).toContain("second panneau");
});
