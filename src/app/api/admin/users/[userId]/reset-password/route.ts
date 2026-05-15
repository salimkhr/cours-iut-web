import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getServerSession } from "@/lib/auth";
import { z } from "zod";

const resetBodySchema = z.object({
    email: z.string().email("Email invalide"),
});

export async function POST(req: Request) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const parsed = resetBodySchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Email invalide" }, { status: 400 });
    }

    const { email } = parsed.data;

    try {
        // reason: better-auth emailAndPassword plugin types not exposed for forgetPassword method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (auth.api as any).forgetPassword({
            body: { email, redirectTo: "/connexion" },
            headers: await headers(),
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[admin] forgetPassword error:", error);
        return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
    }
}
