import {describe, expect, it} from "bun:test";
import {ADMIN_NAV_GROUPS, ADMIN_TOOL_ACTIONS} from "./adminDashboardConfig";

describe("adminDashboardConfig", () => {
    it("ouvre sur la vue d'ensemble en correspondance exacte", () => {
        const first = ADMIN_NAV_GROUPS[0].items[0];
        expect(first.href).toBe("/admin");
        expect(first.exact).toBe(true);
    });

    it("couvre toutes les pages de l'espace admin dans la nav", () => {
        const hrefs = ADMIN_NAV_GROUPS.flatMap((group) => group.items.map((item) => item.href));
        expect(hrefs).toEqual([
            "/admin",
            "/admin/modules",
            "/admin/utilisateurs",
            "/admin/outils",
            "/admin/calibrage",
            "/admin/pedagogie",
        ]);
    });

    it("expose les outils techniques sans synchronisation", () => {
        const labels = ADMIN_TOOL_ACTIONS.map((action) => `${action.id} ${action.title} ${action.description}`.toLowerCase());

        expect(ADMIN_TOOL_ACTIONS.map((action) => action.id)).toEqual([
            "migration",
            "export-import",
        ]);
        expect(labels.some((label) => label.includes("synchron"))).toBe(false);
    });
});
