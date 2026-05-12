import {NextRequest, NextResponse} from "next/server";
import {writeFile, mkdir} from "fs/promises";
import path from "path";
import {randomUUID} from "crypto";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
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

    if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json({error: "Type non autorisé (JPEG, PNG, WebP, GIF)"}, {status: 415});
    }

    if (file.size > MAX_BYTES) {
        return NextResponse.json({error: "Fichier trop volumineux (max 5 Mo)"}, {status: 413});
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "uploads", "avatars");

    await mkdir(uploadDir, {recursive: true});
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({url: `/api/avatar/${filename}`});
}
