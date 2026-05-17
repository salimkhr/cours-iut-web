export const UPLOAD_CONFIG = {
    maxBytes: 10 * 1024 * 1024, // 10 Mo

    clamav: {
        host:    process.env.CLAMAV_HOST ?? "clamav",
        port:    Number(process.env.CLAMAV_PORT ?? "3310"),
        timeout: 30_000,
    },

    // Types autorisés en upload (extensible)
    allowedMimes: new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        // "application/pdf",  // à activer si besoin
    ]),

    // Toujours refusés, même si ajoutés à allowedMimes par erreur
    blockedMimes: new Set([
        "image/svg+xml",
        "text/html",
        "application/x-msdownload", // EXE/DLL Windows
        "application/x-elf",        // binaire Linux
        "application/zip",          // ZIP / DOCX / JAR
        "application/x-rar",        // RAR
    ]),
};
