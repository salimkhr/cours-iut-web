import {describe, expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import ScodocExportButton, {ScodocReportView, parseReport} from "./ScodocExportButton";

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

    test("pendant l'envoi, le bouton est désactivé", () => {
        const html = renderToStaticMarkup(<ScodocExportButton sessionId="abc" pending/>);
        expect(html).toMatch(/<button[^>]*\sdisabled=""/);
    });
});

describe("ScodocReportView", () => {
    const report = {filled: 12, absent: 3, unmatched: [{firstName: "Ana", lastName: "Martin"}]};

    test("affiche les trois compteurs et la liste des non trouvés", () => {
        const html = renderToStaticMarkup(<ScodocReportView report={report}/>);
        expect(html).toContain("12 notes, 3 ABS, 1 participant(s) non trouvé(s)");
        expect(html).toContain("Participants sans ligne dans la feuille :");
        expect(html).toContain("MARTIN Ana");
        expect(html).toContain("à la main");
        expect(html).not.toContain("Aucun e-mail ne correspond");
    });

    test("avertit quand rien n'est rempli et que des participants restent", () => {
        const html = renderToStaticMarkup(<ScodocReportView report={{...report, filled: 0}}/>);
        expect(html).toContain("Aucun e-mail ne correspond : cette session date peut-être d&#x27;avant l&#x27;enregistrement des e-mails. Ne déposez pas cette feuille dans ScoDoc.");
    });

    test("sans rapport, la zone de statut reste montée et vide", () => {
        const html = renderToStaticMarkup(<ScodocReportView report={null}/>);
        expect(html).toContain('role="status"');
        expect(html).toContain('aria-live="polite"');
        expect(html).not.toContain("notes");
    });
});

describe("parseReport", () => {
    test("accepte un rapport bien formé et rejette le reste", () => {
        const raw = encodeURIComponent(JSON.stringify({filled: 1, absent: 0, unmatched: []}));
        expect(parseReport(raw)).toEqual({filled: 1, absent: 0, unmatched: []});
        expect(parseReport(null)).toBeNull();
        expect(parseReport("%E0%A4%A")).toBeNull();
        expect(parseReport(encodeURIComponent(JSON.stringify({filled: "1"})))).toBeNull();
    });
});
