import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getServerSession } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    try {
        // reason: better-auth admin plugin types not fully exposed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (auth.api as any).listUsers({
            headers: await headers(),
            query: { limit: "200", sortBy: "createdAt", sortDirection: "desc" },
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error("[admin] listUsers error:", error);
        return NextResponse.json({ error: "Erreur lors de la récupération des utilisateurs" }, { status: 500 });
    }
}
