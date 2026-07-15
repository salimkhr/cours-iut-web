import {describe, expect, it} from "bun:test";
import {ADMIN_DEFAULT_TAB, ADMIN_TABS, ADMIN_TOOL_ACTIONS} from "./adminDashboardConfig";

describe("adminDashboardConfig", () => {
    it("ouvre Modules & sections par defaut", () => {
        expect(ADMIN_DEFAULT_TAB).toBe("modules");
        expect(ADMIN_TABS[0]).toEqual({
            value: "modules",
            label: "Modules & sections",
            description: "Pilotez les modules, les sections, les verrous et les contenus.",
        });
    });

    it("expose les outils admin sans synchronisation", () => {
        const labels = ADMIN_TOOL_ACTIONS.map((action) => `${action.id} ${action.title} ${action.description}`.toLowerCase());

        expect(ADMIN_TOOL_ACTIONS.map((action) => action.id)).toEqual([
            "migration",
            "export-import",
            "calibrage",
            "pedagogie",
        ]);
        expect(labels.some((label) => label.includes("synchron"))).toBe(false);
    });
});
