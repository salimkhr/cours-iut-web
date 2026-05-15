// Détection MIME réelle via magic bytes — ne fait jamais confiance au Content-Type du client.

function match(buf: Buffer, bytes: number[], offset = 0): boolean {
    if (buf.length < offset + bytes.length) return false;
    return bytes.every((b, i) => buf[offset + i] === b);
}

/**
 * Retourne le MIME type réel du buffer, ou null si non reconnu.
 * Les binaires dangereux (EXE, ELF, ZIP…) sont également identifiés
 * pour produire des logs explicites avant rejet.
 */
export function detectMime(buf: Buffer): string | null {
    if (buf.length < 4) return null;

    // ── Images binaires ─────────────────────────────────────────────────────
    if (match(buf, [0xFF, 0xD8, 0xFF]))
        return "image/jpeg";

    if (match(buf, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))
        return "image/png";

    if (match(buf, [0x47, 0x49, 0x46, 0x38]))
        return "image/gif"; // GIF87a ou GIF89a

    // WebP : RIFF???? WEBP
    if (match(buf, [0x52, 0x49, 0x46, 0x46]) && match(buf, [0x57, 0x45, 0x42, 0x50], 8))
        return "image/webp";

    // ── Documents ────────────────────────────────────────────────────────────
    if (match(buf, [0x25, 0x50, 0x44, 0x46]))
        return "application/pdf"; // %PDF

    // ── Exécutables / archives (toujours bloqués) ────────────────────────────
    if (match(buf, [0x4D, 0x5A]))
        return "application/x-msdownload"; // MZ — PE/EXE/DLL Windows

    if (match(buf, [0x7F, 0x45, 0x4C, 0x46]))
        return "application/x-elf"; // ELF Linux/macOS

    if (match(buf, [0x50, 0x4B, 0x03, 0x04]))
        return "application/zip"; // ZIP / DOCX / XLSX / JAR

    if (match(buf, [0x52, 0x61, 0x72, 0x21]))
        return "application/x-rar"; // RAR

    // ── Formats texte (SVG, HTML) — détection après les binaires ────────────
    // Strip UTF-8 BOM éventuel
    const bomOffset = (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) ? 3 : 0;
    const head = buf
        .subarray(bomOffset, Math.min(bomOffset + 2048, buf.length))
        .toString("utf8")
        .trimStart()
        .toLowerCase();

    // SVG : peut commencer par <?xml…<svg ou directement par <svg
    if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg")))
        return "image/svg+xml";

    if (head.startsWith("<!doctype html") || head.startsWith("<html"))
        return "text/html";

    return null;
}
