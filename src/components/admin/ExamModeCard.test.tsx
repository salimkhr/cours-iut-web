import {describe, expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import ExamModeCard from "@/components/admin/ExamModeCard";

describe("ExamModeCard", () => {
    test("inactif : propose la durée et l'activation", () => {
        const html = renderToStaticMarkup(<ExamModeCard initial={{active: false, until: null, enabledBy: null}}/>);
        expect(html).toContain("Inactif");
        expect(html).toContain("Activer le mode examen");
        expect(html).toContain("exam-mode-duration");
    });

    test("actif : affiche l'heure de fin (Paris) et la désactivation", () => {
        const html = renderToStaticMarkup(
            <ExamModeCard initial={{active: true, until: "2026-11-20T09:30:00.000Z", enabledBy: "admin-1"}}/>,
        );
        expect(html).toContain("Actif jusqu&#x27;à 10:30");
        expect(html).toContain("Désactiver maintenant");
        expect(html).not.toContain("exam-mode-duration");
    });
});
