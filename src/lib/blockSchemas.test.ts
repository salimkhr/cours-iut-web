import { describe, expect, test } from "bun:test";
import { canDrop, isTypeAllowedInContent } from "@/lib/blockSchemas";
import { pruneEmptyLeafChildren } from "@/lib/blockTreeUtils";

describe("canDrop — imbrications légitimes", () => {
    test("la racine accueille les blocs de premier niveau", () => {
        expect(canDrop("section", null)).toBe(true);
        expect(canDrop("text", null)).toBe(true);
        expect(canDrop("callout", null)).toBe(true);
    });

    test("une partie accepte le contenu d'un chapitre, y compris des colonnes", () => {
        expect(canDrop("text", "section")).toBe(true);
        expect(canDrop("table", "section")).toBe(true);
        // Deux contenus en base imbriquent des colonnes dans une partie : les
        // interdire rendait ces documents insauvegardables depuis le builder.
        expect(canDrop("columns", "section")).toBe(true);
    });

    test("une sous-partie reste possible (A — puis 1., 2., 3.)", () => {
        expect(canDrop("section", "section")).toBe(true);
    });

    test("encadré, dépliable et colonne accueillent du contenu courant", () => {
        expect(canDrop("text", "callout")).toBe(true);
        expect(canDrop("code", "callout")).toBe(true);
        expect(canDrop("text", "collapsible")).toBe(true);
        expect(canDrop("text", "column")).toBe(true);
        expect(canDrop("slide-text", "column")).toBe(true);
    });

    test("un élément de liste peut détailler une consigne", () => {
        expect(canDrop("list-item", "list")).toBe(true);
        expect(canDrop("text", "list-item")).toBe(true);
        expect(canDrop("code", "list-item")).toBe(true);
        expect(canDrop("list", "list-item")).toBe(true);
    });
});

describe("canDrop — imbrications sans intérêt pédagogique", () => {
    test("une partie ne s'ouvre pas dans une puce, un encadré ou une colonne", () => {
        expect(canDrop("section", "list-item")).toBe(false);
        expect(canDrop("section", "callout")).toBe(false);
        expect(canDrop("section", "collapsible")).toBe(false);
        expect(canDrop("section", "column")).toBe(false);
    });

    test("une puce ne porte ni mise en colonnes ni bloc dépliable", () => {
        expect(canDrop("columns", "list-item")).toBe(false);
        expect(canDrop("collapsible", "list-item")).toBe(false);
    });

    test("les colonnes ne s'imbriquent pas dans une colonne", () => {
        expect(canDrop("columns", "column")).toBe(false);
    });

    test("une liste n'accepte que des éléments de liste", () => {
        expect(canDrop("text", "list")).toBe(false);
        expect(canDrop("section", "list")).toBe(false);
    });
});

describe("isTypeAllowedInContent", () => {
    test("une slide n'accepte que l'univers slide, colonnes et diagramme compris", () => {
        expect(isTypeAllowedInContent("slide-text", "slide")).toBe(true);
        expect(isTypeAllowedInContent("columns", "slide")).toBe(true);
        expect(isTypeAllowedInContent("diagram", "slide")).toBe(true);
        expect(isTypeAllowedInContent("text", "slide")).toBe(false);
        expect(isTypeAllowedInContent("callout", "slide")).toBe(false);
    });

    test("un cours ou un TP n'accepte pas les blocs de slide", () => {
        expect(isTypeAllowedInContent("text", "cours")).toBe(true);
        expect(isTypeAllowedInContent("table", "TP")).toBe(true);
        expect(isTypeAllowedInContent("slide-text", "cours")).toBe(false);
        expect(isTypeAllowedInContent("slide", "TP")).toBe(false);
    });
});

describe("pruneEmptyLeafChildren", () => {
    test("retire les children vides des feuilles, en profondeur", () => {
        const tree = [{
            id: "1", type: "section", props: { title: "A" }, children: [
                { id: "2", type: "text", props: { content: "x" }, children: [] },
                { id: "3", type: "list", props: { ordered: false }, children: [
                    { id: "4", type: "list-item", props: { text: "i" }, children: [] },
                ] },
            ],
        }];
        const out = pruneEmptyLeafChildren(tree);
        expect("children" in out[0]).toBe(true);                      // conteneur : conservé
        expect("children" in out[0].children![0]).toBe(false);        // feuille : nettoyée
        expect("children" in out[0].children![1]).toBe(true);         // liste : conservée
        expect("children" in out[0].children![1].children![0]).toBe(true); // list-item : conteneur
    });

    test("laisse un conteneur vide intact et ne supprime jamais de contenu", () => {
        const tree = [
            { id: "1", type: "callout", props: { variant: "info" }, children: [] },
            { id: "2", type: "text", props: { content: "y" } },
        ];
        const out = pruneEmptyLeafChildren(tree);
        expect(out[0].children).toEqual([]);
        expect(out[1]).toEqual(tree[1]);
    });
});
