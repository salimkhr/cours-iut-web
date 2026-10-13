/** Taille maximale du fichier téléversé. */
export const SIGNATURE_MAX_BYTES = 1024 * 1024;

/** Formats acceptés en entrée (détectés par magic bytes, jamais via le Content-Type). */
export const SIGNATURE_MIMES = new Set(["image/png", "image/jpeg", "image/webp"]);

/**
 * Dimensions de sortie : ratio de la zone d'ancrage du modèle (B46→E48,
 * `xdr:ext` 1 300 968 × 428 967 EMU ≈ 3,03:1), à 4× la taille d'affichage pour
 * rester net à l'impression.
 */
export const SIGNATURE_WIDTH = 555;
export const SIGNATURE_HEIGHT = 183;
