import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
    jpg:  "image/jpeg",
    png:  "image/png",
    webp: "image/webp",
    gif:  "image/gif",
    pdf:  "application/pdf",
};

// Nom de fichier valide : UUID v4 + extension connue
// ex: 550e8400-e29b-41d4-a716-446655440000.jpg
const SAFE_FILENAME = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}\.[a-z]{2,4}$/i;

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ filename: string }> },
) {
    const { filename } = await params;

    if (!SAFE_FILENAME.test(filename)) {
        return new NextResponse(null, { status: 400 });
    }

    const ext = filename.split(".").pop()!.toLowerCase();
    const contentType = MIME[ext];
    if (!contentType) {
        return new NextResponse(null, { status: 415 });
    }

    try {
        const uploadsDir = process.env.UPLOADS_DIR;
        if (!uploadsDir) throw new Error("Variable d'environnement manquante : UPLOADS_DIR");
        const filePath = path.join(/* turbopackIgnore: true */ uploadsDir, "avatars", filename);
        const buffer = await readFile(filePath);

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": "inline",
                "Cache-Control": "private, max-age=3600",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch {
        return new NextResponse(null, { status: 404 });
    }
}
