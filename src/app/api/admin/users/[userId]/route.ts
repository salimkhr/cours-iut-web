import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getServerSession } from "@/lib/auth";

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { userId } = await params;

    // reason: better-auth admin plugin types not exposed for removeUser method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (auth.api as any).removeUser({
        body: { userId },
        headers: await headers(),
    });

    return NextResponse.json({ success: true });
}
