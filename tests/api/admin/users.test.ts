import { beforeEach, describe, test, expect, mock } from "bun:test";

// ── Shared mutable state ──────────────────────────────────────────────────────
let session: { user: { id: string; role: string } } | null = null;
let listUsersResult: unknown = { users: [] };
let listUsersError: Error | null = null;
let removeUserError: Error | null = null;

mock.module("@/lib/auth", () => ({
    getServerSession: async () => session,
    auth: {
        api: {
            listUsers: async () => {
                if (listUsersError) throw listUsersError;
                return listUsersResult;
            },
            removeUser: async () => {
                if (removeUserError) throw removeUserError;
                return { success: true };
            },
        },
    },
}));

// next/headers n'est pas utilisé directement dans ces tests
mock.module("next/headers", () => ({
    headers: async () => new Headers(),
}));

const { GET: getUsers } = await import("@/app/api/admin/users/route");
const { DELETE: deleteUser } = await import("@/app/api/admin/users/[userId]/route");

// ── Reset ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
    session = null;
    listUsersResult = { users: [] };
    listUsersError = null;
    removeUserError = null;
});

const ADMIN_SESSION = { user: { id: "u1", role: "admin" } };

function makeDeleteReq(userId: string) {
    return new Request(`http://localhost/api/admin/users/${userId}`, { method: "DELETE" });
}

function makeParams(userId: string) {
    return { params: Promise.resolve({ userId }) };
}

// ── GET /api/admin/users ──────────────────────────────────────────────────────
describe("GET /api/admin/users", () => {
    test("403 si pas admin", async () => {
        session = null;
        const res = await getUsers();
        expect(res.status).toBe(403);
    });

    test("200 et liste des utilisateurs", async () => {
        session = ADMIN_SESSION;
        listUsersResult = { users: [{ id: "u2", name: "Alice" }] };

        const res = await getUsers();
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.users).toHaveLength(1);
    });

    test("500 si auth.api.listUsers lance une erreur", async () => {
        session = ADMIN_SESSION;
        listUsersError = new Error("DB error");

        const res = await getUsers();
        expect(res.status).toBe(500);
    });
});

// ── DELETE /api/admin/users/[userId] ──────────────────────────────────────────
describe("DELETE /api/admin/users/[userId]", () => {
    test("403 si pas admin", async () => {
        session = null;
        const res = await deleteUser(makeDeleteReq("u2"), makeParams("u2"));
        expect(res.status).toBe(403);
    });

    test("200 sur suppression réussie", async () => {
        session = ADMIN_SESSION;
        const res = await deleteUser(makeDeleteReq("u2"), makeParams("u2"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
    });

    test("500 si auth.api.removeUser lance une erreur", async () => {
        session = ADMIN_SESSION;
        removeUserError = new Error("remove failed");

        const res = await deleteUser(makeDeleteReq("u2"), makeParams("u2"));
        expect(res.status).toBe(500);
    });
});
