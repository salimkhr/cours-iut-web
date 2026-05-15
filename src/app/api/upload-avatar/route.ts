import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { UPLOAD_CONFIG } from "@/lib/upload/config";
import { detectMime } from "@/lib/upload/mime";
import { scanWithClamAV } from "@/lib/upload/scanner";
import { isImage, reencodeImage } from "@/lib/upload/processor";
import { storeFinal, storeQuarantine } from "@/lib/upload/storage";

export async function POST(req: NextRequest) {

    // ── 1. Auth ───────────────────────────────────────────────────────────────
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const userId = session.user.id;

    // ── 2. Parse form data ────────────────────────────────────────────────────
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

    // ── 3. Taille (avant lecture complète pour éviter l'explosion mémoire) ────
    if (file.size === 0) {
        return NextResponse.json({ error: "Fichier vide" }, { status: 400 });
    }
    if (file.size > UPLOAD_CONFIG.maxBytes) {
        return NextResponse.json(
            { error: `Fichier trop volumineux (max ${UPLOAD_CONFIG.maxBytes / 1024 / 1024} Mo)` },
            { status: 413 },
        );
    }

    // ── 4. Lecture buffer ─────────────────────────────────────────────────────
    const buf = Buffer.from(await file.arrayBuffer());

    // ── 5. Détection MIME réelle (magic bytes — pas le Content-Type HTTP) ─────
    const mime = detectMime(buf);

    if (!mime) {
        console.warn(`[UPLOAD] Type inconnu — user=${userId}`);
        return NextResponse.json({ error: "Type de fichier non reconnu" }, { status: 415 });
    }
    if (UPLOAD_CONFIG.blockedMimes.has(mime)) {
        console.warn(`[UPLOAD] Type bloqué: ${mime} — user=${userId}`);
        return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 415 });
    }
    if (!UPLOAD_CONFIG.allowedMimes.has(mime)) {
        console.warn(`[UPLOAD] Type non autorisé: ${mime} — user=${userId}`);
        return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 415 });
    }

    // ── 6. Scan ClamAV ────────────────────────────────────────────────────────
    const scan = await scanWithClamAV(buf);

    if ("error" in scan) {
        console.error(`[UPLOAD] ClamAV erreur: ${scan.error}`);
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json(
                { error: "Scan antivirus indisponible, réessayez plus tard" },
                { status: 503 },
            );
        }
        console.warn("[UPLOAD] Scan ignoré (mode dev)");
    } else if (!scan.clean) {
        await storeQuarantine(buf, scan.virus);
        console.warn(`[UPLOAD] Fichier infecté: ${scan.virus} — user=${userId}`);
        return NextResponse.json({ error: "Fichier infecté détecté" }, { status: 422 });
    }

    // ── 7. Re-encodage (images uniquement) ───────────────────────────────────
    // Buffer<ArrayBufferLike> pour être compatible avec le Buffer<ArrayBufferLike> de sharp
    let finalBuf: Buffer<ArrayBufferLike> = buf;
    let ext: string;

    if (isImage(mime)) {
        try {
            const result = await reencodeImage(buf, mime);
            finalBuf = result.buffer;
            ext = result.ext;
        } catch (err) {
            console.error(`[UPLOAD] Erreur re-encodage:`, err);
            return NextResponse.json({ error: "Image invalide ou corrompue" }, { status: 422 });
        }
    } else {
        // Types non-image (PDF, etc.) : extension depuis le MIME, caractères sûrs uniquement
        ext = mime.split("/")[1]?.replace(/[^a-z0-9]/g, "") ?? "bin";
    }

    // ── 8. Stockage final ─────────────────────────────────────────────────────
    const filename = await storeFinal(finalBuf, ext, "avatars");
    console.log(`[UPLOAD] OK — ${filename} (${mime}, ${finalBuf.length} o) — user=${userId}`);

    return NextResponse.json({ url: `/api/avatar/${filename}` });
}
