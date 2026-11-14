import {describe, expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import ScodocExportButton from "./ScodocExportButton";

describe("ScodocExportButton", () => {
    test("sans session, le bouton est désactivé et l'aide est affichée", () => {
        const html = renderToStaticMarkup(<ScodocExportButton sessionId={null}/>);
        expect(html).toContain("Remplir une feuille ScoDoc");
        expect(html).toMatch(/<button[^>]*\sdisabled=""/);
        expect(html).toContain("Choisissez une session");
    });

    test("avec une session, le bouton est actif et sans aide", () => {
        const html = renderToStaticMarkup(<ScodocExportButton sessionId="abc"/>);
        expect(html).not.toMatch(/<button[^>]*\sdisabled=""/);
        expect(html).not.toContain("Choisissez une session");
    });
});
