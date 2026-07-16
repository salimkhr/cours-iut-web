import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import type AdminUser from "@/types/AdminUser";

/**
 * Liste les comptes via l'API better-auth (plugin admin).
 * Jamais d'accès Mongo direct sur les collections better-auth (schéma instable).
 */
export default async function getAdminUsers(): Promise<AdminUser[]> {
    try {
        // reason: better-auth admin plugin types not fully exposed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (auth.api as any).listUsers({
            headers: await headers(),
            query: {limit: "200", sortBy: "createdAt", sortDirection: "desc"},
        });
        return (result?.users ?? []).map(
            (u: {
                id: string;
                name: string;
                email: string;
                image?: string | null;
                role?: string;
                group?: string | null;
                username?: string | null;
                banned?: boolean | null;
                createdAt: Date | string;
            }) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                image: u.image ?? null,
                role: u.role ?? "user",
                group: u.group ?? null,
                username: u.username ?? null,
                banned: u.banned ?? false,
                createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
            })
        );
    } catch (error) {
        console.error("[admin] listUsers error:", error);
        return [];
    }
}
