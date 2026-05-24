import { beforeEach, afterEach, describe, test, expect, mock } from "bun:test";

let fileContent: Buffer | Error = Buffer.from("fake-image-data");

mock.module("fs/promises", () => ({
    readFile: async (_path: string) => {
        if (fileContent instanceof Error) throw fileContent;
        return fileContent;
    },
}));

const { GET } = await import("@/app/api/avatar/[filename]/route");

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

beforeEach(() => {
    process.env.UPLOADS_DIR = "/fake/uploads";
    fileContent = Buffer.from("fake-image-data");
});
afterEach(() => { delete process.env.UPLOADS_DIR; });

function makeParams(filename: string) {
    return { params: Promise.resolve({ filename }) };
}

describe("GET /api/avatar/[filename]", () => {
    test("returns 200 with correct Content-Type for a valid .jpg UUID", async () => {
        const filename = `${VALID_UUID}.jpg`;
        const req = new Request(`http://localhost/api/avatar/${filename}`);
        const res = await GET(req as never, makeParams(filename));
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("image/jpeg");
    });

    test("returns 200 for .png", async () => {
        const filename = `${VALID_UUID}.png`;
        const req = new Request(`http://localhost/api/avatar/${filename}`);
        const res = await GET(req as never, makeParams(filename));
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("image/png");
    });

    test("returns 400 for filename that is not a UUID", async () => {
        const filename = "../../etc/passwd";
        const req = new Request(`http://localhost/api/avatar/${filename}`);
        const res = await GET(req as never, makeParams(filename));
        expect(res.status).toBe(400);
    });

    test("returns 415 for unknown extension", async () => {
        const filename = `${VALID_UUID}.exe`;
        const req = new Request(`http://localhost/api/avatar/${filename}`);
        const res = await GET(req as never, makeParams(filename));
        expect(res.status).toBe(415);
    });

    test("returns 404 when file does not exist", async () => {
        fileContent = Object.assign(new Error("ENOENT"), { code: "ENOENT" });
        const filename = `${VALID_UUID}.jpg`;
        const req = new Request(`http://localhost/api/avatar/${filename}`);
        const res = await GET(req as never, makeParams(filename));
        expect(res.status).toBe(404);
    });

    test("returns 404 when UPLOADS_DIR is not set", async () => {
        delete process.env.UPLOADS_DIR;
        const filename = `${VALID_UUID}.jpg`;
        const req = new Request(`http://localhost/api/avatar/${filename}`);
        const res = await GET(req as never, makeParams(filename));
        expect(res.status).toBe(404);
    });
});
