/** Longueur du code court affiché au lobby (`LiveQuizService.shortCode`). */
export const SHORT_CODE_LENGTH = 6;

/**
 * Code saisi à la main sur un ordinateur → segment d'URL `/quiz/<code>`.
 * Accepte aussi le lien complet collé depuis la projection : son dernier segment est alors repris tel
 * quel (le code long est sensible à la casse). Sinon : majuscules, sans espace ni tiret.
 * Renvoie `null` si rien d'exploitable.
 */
export function normalizeJoinCode(input: string): string | null {
    const trimmed = input.trim();
    const fromUrl = trimmed.match(/\/quiz\/([A-Za-z0-9_-]+)\/?(?:[?#].*)?$/);
    if (fromUrl) return fromUrl[1];
    const code = trimmed.replace(/[\s-]/g, "").toUpperCase();
    return /^[A-Z0-9]{4,64}$/.test(code) ? code : null;
}
