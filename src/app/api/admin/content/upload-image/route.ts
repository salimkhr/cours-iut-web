import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import { UPLOAD_CONFIG } from "@/lib/upload/config";
import { detectMime } from "@/lib/upload/mime";
import { scanWithClamAV } from "@/lib/upload/scanner";
import { isImage, reencodeImage } from "@/lib/upload/processor";
import { storeFinal, storeQuarantine } from "@/lib/upload/storage";

export const POST = withAdmin(async (req: Request) => {
    // ── 1. Parse form data ────────────────────────────────────────────────────
    let formData: FormData;
    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "Champ 'file' manquant" }, { status: 400 });
    }

    // ── 2. Taille ─────────────────────────────────────────────────────────────
    if (file.size === 0) {
        return NextResponse.json({ error: "Fichier vide" }, { status: 400 });
    }
    if (file.size > UPLOAD_CONFIG.maxBytes) {
        return NextResponse.json(
            { error: `Fichier trop volumineux (max ${UPLOAD_CONFIG.maxBytes / 1024 / 1024} Mo)` },
            { status: 413 },
        );
    }

    // ── 3. Buffer ─────────────────────────────────────────────────────────────
    const buf = Buffer.from(await file.arrayBuffer());

    // ── 4. Détection MIME ─────────────────────────────────────────────────────
    const mime = detectMime(buf);
    if (!mime) {
        return NextResponse.json({ error: "Type de fichier non reconnu" }, { status: 415 });
    }
    if (UPLOAD_CONFIG.blockedMimes.has(mime)) {
        return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 415 });
    }
    if (!UPLOAD_CONFIG.allowedMimes.has(mime)) {
        return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 415 });
    }

    // ── 5. Scan ClamAV ────────────────────────────────────────────────────────
    const scan = await scanWithClamAV(buf);
    if ("error" in scan) {
        console.error(`[UPLOAD-IMAGE] ClamAV erreur: ${scan.error}`);
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json(
                { error: "Scan antivirus indisponible, réessayez plus tard" },
                { status: 503 },
            );
        }
        console.warn("[UPLOAD-IMAGE] Scan ignoré (mode dev)");
    } else if (!scan.clean) {
        await storeQuarantine(buf, scan.virus);
        console.warn(`[UPLOAD-IMAGE] Fichier infecté: ${scan.virus}`);
        return NextResponse.json({ error: "Fichier infecté détecté" }, { status: 422 });
    }

    // ── 6. Re-encodage ────────────────────────────────────────────────────────
    let finalBuf: Buffer<ArrayBufferLike> = buf;
    let ext: string;

    if (isImage(mime)) {
        try {
            const result = await reencodeImage(buf, mime);
            finalBuf = result.buffer;
            ext = result.ext;
        } catch (err) {
            console.error(`[UPLOAD-IMAGE] Erreur re-encodage:`, err);
            return NextResponse.json({ error: "Image invalide ou corrompue" }, { status: 422 });
        }
    } else {
        ext = mime.split("/")[1]?.replace(/[^a-z0-9]/g, "") ?? "bin";
    }

    // ── 7. Stockage ───────────────────────────────────────────────────────────
    const filename = await storeFinal(finalBuf, ext, "course-images");
    console.log(`[UPLOAD-IMAGE] OK — ${filename} (${mime}, ${finalBuf.length} o)`);

    return NextResponse.json({ url: `/api/course-image/${filename}` });
});
