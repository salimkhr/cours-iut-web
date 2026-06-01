import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getServerSession } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { userId } = await params;

    let banned: boolean;
    try {
        const body = await req.json() as { banned: boolean };
        banned = body.banned;
    } catch {
        return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
    }

    try {
        if (banned) {
            // reason: better-auth admin plugin types not exposed for banUser method
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (auth.api as any).banUser({
                body: { userId },
                headers: await headers(),
            });
        } else {
            // reason: better-auth admin plugin types not exposed for unbanUser method
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (auth.api as any).unbanUser({
                body: { userId },
                headers: await headers(),
            });
        }
        return NextResponse.json({ success: true, banned });
    } catch (error) {
        console.error("[admin] ban/unban error:", error);
        return NextResponse.json({ error: "Erreur lors du ban/unban" }, { status: 500 });
    }
}
