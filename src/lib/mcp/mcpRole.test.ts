import {describe, expect, test} from "bun:test";
import {mcpRoleFor} from "@/lib/mcp/mcpRole";

const NOW = Date.parse("2026-10-24T12:00:00Z");

describe("mcpRoleFor", () => {
    test("refuse un compte inconnu", () => {
        expect(mcpRoleFor(null, NOW)).toBeNull();
    });

    test("rôle admin, y compris parmi plusieurs rôles", () => {
        expect(mcpRoleFor({id: "a", role: "admin"}, NOW)).toBe("admin");
        expect(mcpRoleFor({id: "a", role: "user, admin"}, NOW)).toBe("admin");
    });

    test("tout autre rôle, ou aucun, vaut user", () => {
        expect(mcpRoleFor({id: "u", role: "user"}, NOW)).toBe("user");
        expect(mcpRoleFor({id: "u", role: null}, NOW)).toBe("user");
        expect(mcpRoleFor({id: "u", role: "administrator"}, NOW)).toBe("user");
    });

    test("refuse un compte banni sans échéance ou avant son échéance", () => {
        expect(mcpRoleFor({id: "b", role: "admin", banned: true}, NOW)).toBeNull();
        expect(mcpRoleFor({id: "b", role: "user", banned: true, banExpires: new Date(NOW + 60_000)}, NOW)).toBeNull();
    });

    test("accepte un compte dont le ban a expiré", () => {
        expect(mcpRoleFor({id: "b", role: "user", banned: true, banExpires: new Date(NOW - 60_000).toISOString()}, NOW)).toBe("user");
    });
});
