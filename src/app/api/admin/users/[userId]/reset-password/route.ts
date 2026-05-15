import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getServerSession } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { email } = (await req.json()) as { email: string };
    if (!email) {
        return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // reason: better-auth emailAndPassword plugin types not exposed for forgetPassword method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (auth.api as any).forgetPassword({
        body: { email, redirectTo: "/connexion" },
        headers: await headers(),
    });

    return NextResponse.json({ success: true });
}
