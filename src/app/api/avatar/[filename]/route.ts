import {NextRequest, NextResponse} from "next/server";
import {readFile} from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
};

export async function GET(
    _req: NextRequest,
    {params}: {params: Promise<{filename: string}>}
) {
    const {filename} = await params;

    // Bloquer toute tentative de path traversal
    if (filename.includes("/") || filename.includes("..") || filename.includes("\0")) {
        return new NextResponse(null, {status: 400});
    }

    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const contentType = MIME[ext];
    if (!contentType) {
        return new NextResponse(null, {status: 415});
    }

    try {
        const filePath = path.join(process.cwd(), "uploads", "avatars", filename);
        const buffer = await readFile(filePath);
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, max-age=3600",
            },
        });
    } catch {
        return new NextResponse(null, {status: 404});
    }
}
