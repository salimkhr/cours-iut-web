/** Champs du compte better-auth utiles au MCP (plugin admin : `role`, `banned`, `banExpires`). */
export interface McpAuthUser {
    id: string;
    role?: string | null;
    banned?: boolean | null;
    banExpires?: Date | string | null;
}

export type McpRole = "admin" | "user";

/**
 * Rôle MCP d'un compte better-auth, ou null s'il doit être refusé : compte
 * inconnu, ou banni sans échéance ou avant son échéance (même règle que le
 * plugin admin, qui lève un ban expiré à la connexion suivante).
 */
export function mcpRoleFor(user: McpAuthUser | null, now: number = Date.now()): McpRole | null {
    if (!user) return null;
    if (user.banned) {
        const expires = user.banExpires ? new Date(user.banExpires).getTime() : null;
        if (expires === null || expires >= now) return null;
    }
    // Le plugin admin accepte plusieurs rôles séparés par des virgules.
    const roles = (user.role ?? "").split(",").map((r) => r.trim());
    return roles.includes("admin") ? "admin" : "user";
}
