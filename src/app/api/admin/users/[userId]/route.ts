import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getServerSession } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import { userEditSchema } from "@/lib/schemas/user-edit.schema";

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { userId } = await params;

    try {
        // reason: better-auth admin plugin types not exposed for removeUser method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (auth.api as any).removeUser({
            body: { userId },
            headers: await headers(),
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[admin] removeUser error:", error);
        return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { userId } = await params;

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
    }

    const parsed = userEditSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { firstName, lastName, email, username, group, role } = parsed.data;
    const name = `${firstName} ${lastName}`;

    try {
        // Mise à jour nom + email via better-auth admin
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (auth.api as any).updateUser({
            body: { userId, data: { name, email } },
            headers: await headers(),
        });

        // Mise à jour du rôle
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (auth.api as any).setRole({
            body: { userId, role },
            headers: await headers(),
        });

        // username et group mis à jour directement en MongoDB
        // (username plugin et champ custom non exposés via updateUser)
        const db = await connectToDB();
        await db.collection("user").updateOne(
            { id: userId },
            { $set: { username: username || null, group: group || null } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[admin] updateUser error:", error);
        return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
    }
}
