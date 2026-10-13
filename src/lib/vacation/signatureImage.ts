import {SIGNATURE_HEIGHT, SIGNATURE_WIDTH} from "@/lib/vacation/signatureConfig";

/**
 * Normalise une image en PNG aux dimensions de la zone de signature :
 * orientation EXIF appliquée puis métadonnées retirées, image contenue dans le
 * cadre (jamais déformée) sur fond transparent.
 */
export async function normalizeSignature(buf: Buffer): Promise<Buffer> {
    // Import paresseux : voir le commentaire de `reencodeImage` (build sous Bun).
    const {default: sharp} = await import("sharp");
    return sharp(buf, {failOn: "error", limitInputPixels: 268_402_689})
        .rotate()
        .resize(SIGNATURE_WIDTH, SIGNATURE_HEIGHT, {
            fit: "contain",
            background: {r: 0, g: 0, b: 0, alpha: 0},
        })
        .png()
        .toBuffer();
}
