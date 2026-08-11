import { describe, expect, test } from "bun:test";

import {
    assertSectionAcceptsContent,
    type SectionOwnerDoc,
} from "@/lib/mcp/assertSectionAcceptsContent";

const moduleWithSection: SectionOwnerDoc = {
    path: "html-css",
    sections: [
        {
            path: "1-rappel-de-html",
            contents: [
                { type: "cours" },
                { type: "TP" },
            ],
        },
    ],
};

describe("assertSectionAcceptsContent", () => {
    test("refuse un module absent de la collection modules", () => {
        expect(() =>
            assertSectionAcceptsContent(null, {
                moduleSlug: "html-css",
                sectionSlug: "1-rappel-de-html",
                contentType: "cours",
            })
        ).toThrow('Module "html-css" introuvable.');
    });

    test("refuse une section qui n'existe pas dans le module", () => {
        expect(() =>
            assertSectionAcceptsContent({ path: "html-css", sections: [] }, {
                moduleSlug: "html-css",
                sectionSlug: "1-rappel-de-html",
                contentType: "cours",
            })
        ).toThrow(
            'Section "1-rappel-de-html" introuvable dans le module "html-css". Créez-la d\'abord avec create_section.'
        );
    });

    test("refuse un module dont le tableau sections est absent", () => {
        expect(() =>
            assertSectionAcceptsContent({ path: "html-css" }, {
                moduleSlug: "html-css",
                sectionSlug: "1-rappel-de-html",
                contentType: "cours",
            })
        ).toThrow('Section "1-rappel-de-html" introuvable dans le module "html-css".');
    });

    test("refuse un type de contenu non déclaré sur la section", () => {
        expect(() =>
            assertSectionAcceptsContent(moduleWithSection, {
                moduleSlug: "html-css",
                sectionSlug: "1-rappel-de-html",
                contentType: "examen",
            })
        ).toThrow(
            'Type de contenu "examen" non déclaré sur la section "1-rappel-de-html" du module "html-css". Ajoutez-le d\'abord avec edit_section (addContentTypes).'
        );
    });

    test("accepte un couple section/type déclaré", () => {
        expect(() =>
            assertSectionAcceptsContent(moduleWithSection, {
                moduleSlug: "html-css",
                sectionSlug: "1-rappel-de-html",
                contentType: "TP",
            })
        ).not.toThrow();
    });
});
