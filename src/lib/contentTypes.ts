/**
 * Types de contenu d'une section, sans dépendance UI : ce module est importé
 * aussi bien par les Route Handlers que par les composants client.
 */

export const CONTENT_ORDER = ['cours', 'TP', 'slide', 'projet', 'examen'] as const;
export type ContentKey = typeof CONTENT_ORDER[number];

/**
 * Ramène un type de contenu écrit à la main (segment d'URL, payload MCP) sur sa
 * forme canonique — `tp`, `Tp` et `TP` désignent le même contenu. Sans cette
 * normalisation, chaque casse crée son propre document `course_content`,
 * invisible partout ailleurs.
 */
export function normalizeContentKey(raw: string): ContentKey | null {
    const needle = raw.trim().toLowerCase();
    return CONTENT_ORDER.find((key) => key.toLowerCase() === needle) ?? null;
}
