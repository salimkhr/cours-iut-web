import sharp from "sharp";

type SharpFormat = "jpeg" | "png" | "webp" | "gif";

const IMAGE_OUTPUTS: Record<string, { format: SharpFormat; ext: string }> = {
    "image/jpeg": { format: "jpeg", ext: "jpg" },
    "image/png":  { format: "png",  ext: "png" },
    "image/webp": { format: "webp", ext: "webp" },
    "image/gif":  { format: "gif",  ext: "gif" },
};

export function isImage(mime: string): boolean {
    return mime in IMAGE_OUTPUTS;
}

/**
 * Re-encode l'image via sharp :
 * - supprime toutes les métadonnées (EXIF, XMP, ICC…)
 * - applique l'orientation EXIF puis la retire
 * - normalise le format (élimine les payloads cachés)
 * - limite les dimensions pour contrer les décompression bombs
 */
export async function reencodeImage(
    buf: Buffer,
    mime: string,
): Promise<{ buffer: Buffer; ext: string }> {
    const output = IMAGE_OUTPUTS[mime];
    if (!output) throw new Error(`MIME non supporté pour le re-encodage : ${mime}`);

    const buffer = await sharp(buf, {
        failOn: "error",
        limitInputPixels: 268_402_689, // 16 384 × 16 384 px max
        animated: mime === "image/gif", // conserve les frames GIF animées
    })
        .rotate()              // applique l'orientation EXIF → strip EXIF
        .toFormat(output.format)
        .toBuffer();

    return { buffer, ext: output.ext };
}
