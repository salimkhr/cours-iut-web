import { beforeEach, afterEach, describe, test, expect, mock } from "bun:test";
import type { NextRequest } from "next/server";
import { UPLOAD_CONFIG } from "@/lib/upload/config";

// ── Shared mutable state ──────────────────────────────────────────────────────
let session: { user: { id: string; role: string } } | null = null;
let detectedMime: string | null = "image/jpeg";
let scanResult: { clean: true } | { clean: false; virus: string } | { error: string } = { clean: true };
let reencodeResult: { buffer: Buffer; ext: string } | Error = { buffer: Buffer.from("re-encoded"), ext: "jpg" };
let isImageResult = true;
let storedFilename = "uuid-test.jpg";
let storeFinalError: Error | null = null;
let storeQuarantineCalled = false;

// ── Mocks (tous avant le premier import de la route) ─────────────────────────
mock.module("@/lib/auth", () => ({
    getServerSession: async () => session,
    auth: {},
}));

mock.module("@/lib/upload/mime", () => ({
    detectMime: (_buf: Buffer) => detectedMime,
}));

mock.module("@/lib/upload/scanner", () => ({
    scanWithClamAV: async (_buf: Buffer) => scanResult,
}));

mock.module("@/lib/upload/processor", () => ({
    isImage: (_mime: string) => isImageResult,
    reencodeImage: async (_buf: Buffer, _mime: string) => {
        if (reencodeResult instanceof Error) throw reencodeResult;
        return reencodeResult;
    },
}));

mock.module("@/lib/upload/storage", () => ({
    storeFinal: async (_buf: Buffer, _ext: string, _subdir: string) => {
        if (storeFinalError) throw storeFinalError;
        return storedFilename;
    },
    storeQuarantine: async (_buf: Buffer, _reason: string) => {
        storeQuarantineCalled = true;
    },
}));

const { POST } = await import("@/app/api/upload-avatar/route");

// ── Reset avant chaque test ───────────────────────────────────────────────────
const VALID_SESSION = { user: { id: "u1", role: "user" } };

beforeEach(() => {
    session = VALID_SESSION;
    detectedMime = "image/jpeg";
    scanResult = { clean: true };
    reencodeResult = { buffer: Buffer.from("re-encoded"), ext: "jpg" };
    isImageResult = true;
    storedFilename = "uuid-test.jpg";
    storeFinalError = null;
    storeQuarantineCalled = false;
    delete process.env.NODE_ENV_OVERRIDE;
});
afterEach(() => {
    // Restaure NODE_ENV si un test l'a modifié
    Object.defineProperty(process.env, "NODE_ENV", { value: "test", writable: true, configurable: true });
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeFormReq(file: File | null, extraFields?: Record<string, string>): Request {
    const form = new FormData();
    if (file) form.append("file", file);
    if (extraFields) {
        for (const [k, v] of Object.entries(extraFields)) form.append(k, v);
    }
    return new Request("http://localhost/api/upload-avatar", { method: "POST", body: form });
}

function makeJpegFile(sizeBytes = 100, name = "photo.jpg"): File {
    // Magic bytes JPEG : FF D8 FF + padding
    const buf = Buffer.alloc(sizeBytes);
    buf[0] = 0xFF; buf[1] = 0xD8; buf[2] = 0xFF;
    return new File([buf], name, { type: "image/jpeg" });
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("POST /api/upload-avatar", () => {

    // ── Auth ──────────────────────────────────────────────────────────────────
    test("401 si pas de session", async () => {
        session = null;
        const res = await POST(makeFormReq(makeJpegFile()) as NextRequest);
        expect(res.status).toBe(401);
        expect((await res.json()).error).toMatch(/authentifi/i);
    });

    // ── Parse form data ───────────────────────────────────────────────────────
    test("400 si corps de requête non-multipart", async () => {
        const req = new Request("http://localhost/api/upload-avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: "oops" }),
        });
        const res = await POST(req as NextRequest);
        expect(res.status).toBe(400);
        expect((await res.json()).error).toMatch(/invalide/i);
    });

    test("400 si champ 'file' absent du formulaire", async () => {
        const form = new FormData();
        form.append("autre", "valeur");
        const req = new Request("http://localhost/api/upload-avatar", { method: "POST", body: form });
        const res = await POST(req as NextRequest);
        expect(res.status).toBe(400);
        expect((await res.json()).error).toMatch(/file/i);
    });

    // ── Validations taille ────────────────────────────────────────────────────
    test("400 si fichier vide (0 octet)", async () => {
        const empty = new File([], "empty.jpg", { type: "image/jpeg" });
        const res = await POST(makeFormReq(empty) as NextRequest);
        expect(res.status).toBe(400);
        expect((await res.json()).error).toMatch(/vide/i);
    });

    test("413 si fichier dépasse la taille max", async () => {
        const big = new File([Buffer.alloc(UPLOAD_CONFIG.maxBytes + 1)], "big.jpg", { type: "image/jpeg" });
        const res = await POST(makeFormReq(big) as NextRequest);
        expect(res.status).toBe(413);
    });

    // ── Détection MIME ────────────────────────────────────────────────────────
    test("415 si MIME non reconnu (detectMime retourne null)", async () => {
        detectedMime = null;
        const res = await POST(makeFormReq(makeJpegFile()) as NextRequest);
        expect(res.status).toBe(415);
        expect((await res.json()).error).toMatch(/reconnu/i);
    });

    test("415 si MIME bloqué (ex: application/x-msdownload)", async () => {
        detectedMime = "application/x-msdownload";
        const res = await POST(makeFormReq(makeJpegFile()) as NextRequest);
        expect(res.status).toBe(415);
        expect((await res.json()).error).toMatch(/autoris/i);
    });

    test("415 si MIME non dans la liste autorisée (ex: application/pdf)", async () => {
        detectedMime = "application/pdf";
        const res = await POST(makeFormReq(makeJpegFile()) as NextRequest);
        expect(res.status).toBe(415);
    });

    // ── Scan ClamAV ───────────────────────────────────────────────────────────
    test("422 si fichier infecté", async () => {
        scanResult = { clean: false, virus: "Eicar-Test-Signature" };
        const res = await POST(makeFormReq(makeJpegFile()) as NextRequest);
        expect(res.status).toBe(422);
        expect((await res.json()).error).toMatch(/infect/i);
        expect(storeQuarantineCalled).toBe(true);
    });

    test("503 si ClamAV en erreur en production", async () => {
        Object.defineProperty(process.env, "NODE_ENV", { value: "production", writable: true, configurable: true });
        scanResult = { error: "connexion refusée" };
        const res = await POST(makeFormReq(makeJpegFile()) as NextRequest);
        expect(res.status).toBe(503);
    });

    test("continue (200) si ClamAV en erreur en dev", async () => {
        // NODE_ENV reste "test" (≠ "production") → le scan est ignoré
        scanResult = { error: "connexion refusée" };
        const res = await POST(makeFormReq(makeJpegFile()) as NextRequest);
        expect(res.status).toBe(200);
    });

    // ── Re-encodage ───────────────────────────────────────────────────────────
    test("422 si re-encodage échoue", async () => {
        reencodeResult = new Error("image corrompue");
        const res = await POST(makeFormReq(makeJpegFile()) as NextRequest);
        expect(res.status).toBe(422);
        expect((await res.json()).error).toMatch(/invalid|corrompu/i);
    });

    // ── Chemin nominal ────────────────────────────────────────────────────────
    test("200 avec URL de l'avatar sur succès (image)", async () => {
        const res = await POST(makeFormReq(makeJpegFile()) as NextRequest);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.url).toBe(`/api/avatar/${storedFilename}`);
    });

    test("200 pour un type non-image (isImage = false)", async () => {
        detectedMime = "application/pdf";
        // On rend le PDF autorisé pour ce test en jouant sur la config réelle :
        // Au lieu de contourner la config, on teste le branchement non-image
        // en mockant detectMime sur un type autorisé sans passer par reencodeImage.
        // On ajoute "application/pdf" à allowedMimes temporairement via mock du config.
        // Approche plus simple : mocker le mime vers un type autorisé ET marquer isImage = false.
        detectedMime = "image/jpeg";           // toujours autorisé
        isImageResult = false;                  // simule un type non-image
        storedFilename = "uuid-test.bin";

        const res = await POST(makeFormReq(makeJpegFile()) as NextRequest);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.url).toBe("/api/avatar/uuid-test.bin");
    });
});
