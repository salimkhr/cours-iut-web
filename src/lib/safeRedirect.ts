/**
 * Retour après connexion : n'accepte qu'un chemin interne (« /… »), jamais une
 * URL absolue ni un chemin protocole-relatif (« //hôte »), pour éviter un
 * open redirect via `?redirect_to=`.
 */
export function safeRedirectPath(value: string | string[] | null | undefined, fallback = "/"): string {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
    if (/[\u0000-\u001f]/.test(raw)) return fallback;
    return raw;
}
