import {describe, expect, it} from "bun:test";
import sharp from "sharp";
import {normalizeSignature} from "@/lib/vacation/signatureImage";
import {SIGNATURE_HEIGHT, SIGNATURE_WIDTH} from "@/lib/vacation/signatureConfig";

describe("normalizeSignature", () => {
    it("convertit un JPEG carré en PNG au format de la zone, sans déformation, fond transparent", async () => {
        const jpeg = await sharp({create: {width: 300, height: 300, channels: 3, background: "#000"}}).jpeg().toBuffer();
        const out = await normalizeSignature(jpeg);
        const meta = await sharp(out).metadata();
        expect(meta.format).toBe("png");
        expect(meta.width).toBe(SIGNATURE_WIDTH);
        expect(meta.height).toBe(SIGNATURE_HEIGHT);
        expect(meta.hasAlpha).toBe(true);

        const {data, info} = await sharp(out).raw().toBuffer({resolveWithObject: true});
        const alphaAt = (x: number, y: number) => data[(y * info.width + x) * info.channels + 3];
        const midY = Math.floor(SIGNATURE_HEIGHT / 2);
        const midX = Math.floor(SIGNATURE_WIDTH / 2);
        expect(alphaAt(2, midY)).toBe(0); // marge latérale transparente
        expect(alphaAt(midX, midY)).toBe(255); // image au centre
    });

    it("rejette un contenu qui n'est pas une image", async () => {
        await expect(normalizeSignature(Buffer.from("pas une image"))).rejects.toThrow();
    });
});
