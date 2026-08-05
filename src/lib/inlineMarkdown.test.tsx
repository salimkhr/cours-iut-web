import { describe, expect, it } from "bun:test";
import React from "react";
import { renderInline } from "@/lib/inlineMarkdown";

/** Aplatit l'arbre en une chaîne balisée, suffisant pour asserter la structure. */
function flatten(nodes: React.ReactNode): string {
    if (nodes === null || nodes === undefined || typeof nodes === "boolean") return "";
    if (typeof nodes === "string" || typeof nodes === "number") return String(nodes);
    if (Array.isArray(nodes)) return nodes.map(flatten).join("");

    const el = nodes as React.ReactElement<{ children?: React.ReactNode }>;
    const type = typeof el.type === "string" ? el.type : (el.type as { name?: string })?.name ?? "?";
    const inner = flatten(el.props?.children);
    if (type === "br") return "\n";
    return `<${type}>${inner}</${type}>`;
}

const render = (s: string) => flatten(renderInline(s));

describe("renderInline — emphase", () => {
    it("rend le gras et l'italique", () => {
        expect(render("un **mot** gras")).toBe("un <strong>mot</strong> gras");
        expect(render("un _mot_ italique")).toBe("un <em>mot</em> italique");
        expect(render("un __mot__ gras")).toBe("un <strong>mot</strong> gras");
        expect(render("un *mot* italique")).toBe("un <em>mot</em> italique");
    });

    it("laisse les marqueurs non fermés tels quels", () => {
        expect(render("2 * 3 = 6")).toBe("2 * 3 = 6");
        expect(render("un **mot")).toBe("un **mot");
    });

    it("ne coupe pas un mot sur un underscore", () => {
        expect(render("la méthode __construct existe")).toBe("la méthode __construct existe");
        expect(render("une variable snake_case_ici")).toBe("une variable snake_case_ici");
        expect(render("$this->last_name et $other->first_name")).toBe(
            "$this->last_name et $other->first_name",
        );
    });

    it("n'ouvre pas une emphase sur un marqueur suivi d'un blanc", () => {
        expect(render("a * b * c")).toBe("a * b * c");
        expect(render("total ** reste")).toBe("total ** reste");
    });
});

describe("renderInline — code inline prioritaire", () => {
    it("rend le code inline", () => {
        expect(render("appelez `echo`")).toBe("appelez <Code>echo</Code>");
    });

    it("ne laisse pas une emphase se fermer dans un span de code", () => {
        // Régression : « (__) … `__construct` » avalait la phrase dans un <strong>
        // et faisait disparaître les underscores dont parle la consigne.
        expect(render("deux underscores (__) et `__construct` est appelé")).toBe(
            "deux underscores (__) et <Code>__construct</Code> est appelé",
        );
    });

    it("préserve les astérisques dans un span de code", () => {
        expect(render("`$a * $b` puis *vrai* italique")).toBe(
            "<Code>$a * $b</Code> puis <em>vrai</em> italique",
        );
    });
});

describe("renderInline — liens", () => {
    it("rend un lien sûr", () => {
        expect(render("voir [la doc](https://php.net)")).toBe("voir <a>la doc</a>");
    });

    it("refuse un schéma non sûr", () => {
        expect(render("[x](javascript:alert(1))")).toBe("[x](javascript:alert(1))");
    });
});

describe("renderInline — sauts de ligne", () => {
    it("convertit les retours ligne en <br/>", () => {
        expect(render("Total collecté\nMoyenne des montants")).toBe(
            "Total collecté\nMoyenne des montants",
        );
    });

    it("garde les lignes vides", () => {
        expect(render("a\n\nb")).toBe("a\n\nb");
    });

    it("combine saut de ligne et emphase", () => {
        expect(render("**Titre**\nsuite")).toBe("<strong>Titre</strong>\nsuite");
    });
});
