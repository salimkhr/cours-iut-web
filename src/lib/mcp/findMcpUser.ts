import { auth } from "@/lib/auth";
import type { McpAuthUser } from "@/lib/mcp/mcpRole";

/**
 * Compte better-auth associé à l'e-mail de l'identité Scalekit (le broker est
 * branché sur better-auth, l'e-mail est donc celui du compte connecté).
 * Passe par l'adaptateur de better-auth, jamais par la collection `user` en direct.
 */
export async function findMcpUser(email: string): Promise<McpAuthUser | null> {
    const ctx = await auth.$context;
    const found = await ctx.internalAdapter.findUserByEmail(email.trim().toLowerCase());
    return (found?.user as McpAuthUser | undefined) ?? null;
}
