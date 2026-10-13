import {NextResponse} from "next/server";
import {getServerSession} from "@/lib/auth";
import {withAdmin} from "@/lib/withAdmin";
import {detectMime} from "@/lib/upload/mime";
import {scanWithClamAV} from "@/lib/upload/scanner";
import {storeQuarantine} from "@/lib/upload/storage";
import {deleteSignature, getSignature, saveSignature} from "@/lib/vacation/signature";
import {normalizeSignature} from "@/lib/vacation/signatureImage";
import {SIGNATURE_MAX_BYTES, SIGNATURE_MIMES} from "@/lib/vacation/signatureConfig";

async function currentUserId(): Promise<string | null> {
    const session = await getServerSession();
    return session?.user.id ?? null;
}

const unauthenticated = () => NextResponse.json({error: "Non authentifié"}, {status: 401});

/** GET — renvoie la signature (image/png) ou 404 s'il n'y en a pas. */
export const GET = withAdmin(async (): Promise<Response> => {
    const userId = await currentUserId();
    if (!userId) return unauthenticated();

    const png = await getSignature(userId);
    if (!png) return NextResponse.json({error: "Aucune signature enregistrée"}, {status: 404});

    return new Response(new Uint8Array(png), {
        headers: {"Content-Type": "image/png", "Cache-Control": "no-store"},
    });
});

/** PUT multipart (champ `file`) — valide, scanne, normalise en PNG et enregistre. */
export const PUT = withAdmin(async (req: Request): Promise<Response> => {
    const userId = await currentUserId();
    if (!userId) return unauthenticated();

    let formData: FormData;
    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json({error: "Corps de requête invalide"}, {status: 400});
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
        return NextResponse.json({error: "Champ 'file' manquant"}, {status: 400});
    }
    if (file.size === 0) {
        return NextResponse.json({error: "Fichier vide"}, {status: 400});
    }
    if (file.size > SIGNATURE_MAX_BYTES) {
        return NextResponse.json(
            {error: `Fichier trop volumineux (max ${SIGNATURE_MAX_BYTES / 1024 / 1024} Mo)`},
            {status: 413},
        );
    }

    const buf = Buffer.from(await file.arrayBuffer());

    const mime = detectMime(buf);
    if (!mime || !SIGNATURE_MIMES.has(mime)) {
        console.warn(`[vacations] signature refusée (type=${mime ?? "inconnu"}) — user=${userId}`);
        return NextResponse.json({error: "Format non accepté (PNG, JPEG ou WebP)"}, {status: 415});
    }

    const scan = await scanWithClamAV(buf);
    if ("error" in scan) {
        console.error(`[vacations] ClamAV erreur: ${scan.error}`);
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({error: "Scan antivirus indisponible, réessayez plus tard"}, {status: 503});
        }
        console.warn("[vacations] scan ignoré (mode dev)");
    } else if (!scan.clean) {
        await storeQuarantine(buf, scan.virus);
        console.warn(`[vacations] signature infectée: ${scan.virus} — user=${userId}`);
        return NextResponse.json({error: "Fichier infecté détecté"}, {status: 422});
    }

    let png: Buffer;
    try {
        png = await normalizeSignature(buf);
    } catch (error) {
        console.error("[vacations] normalisation de la signature impossible", error);
        return NextResponse.json({error: "Image invalide ou corrompue"}, {status: 422});
    }

    await saveSignature(userId, png);
    return NextResponse.json({ok: true});
});

/** DELETE — supprime la signature de l'utilisateur. */
export const DELETE = withAdmin(async (): Promise<Response> => {
    const userId = await currentUserId();
    if (!userId) return unauthenticated();

    await deleteSignature(userId);
    return NextResponse.json({ok: true});
});
