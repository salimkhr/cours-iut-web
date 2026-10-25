import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getServerSession } from "@/lib/auth";
import { userCreateSchema } from "@/lib/schemas/user-create.schema";

const CREATE_USER_ERRORS: Record<string, string> = {
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Un compte existe déjà avec cet email.",
    USERNAME_IS_ALREADY_TAKEN: "Ce nom d'utilisateur est déjà pris.",
    INVALID_USERNAME: "Nom d'utilisateur invalide.",
    INVALID_EMAIL: "Email invalide.",
};

export async function POST(req: Request) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
    }

    const parsed = userCreateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { firstName, lastName, email, username, group, role, password } = parsed.data;
    const name = lastName ? `${firstName} ${lastName}` : firstName;

    try {
        // reason: better-auth admin plugin types not exposed for createUser method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (auth.api as any).createUser({
            body: {
                email,
                password,
                name,
                role,
                // Compte créé par un admin : email considéré comme vérifié,
                // sinon requireEmailVerification bloquerait la connexion.
                // `username` passe par les hooks du plugin username (validation + unicité).
                data: {
                    emailVerified: true,
                    ...(username ? { username } : {}),
                    ...(group ? { group } : {}),
                },
            },
            headers: await headers(),
        });
        const user = result.user;
        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image ?? null,
                role: user.role ?? role,
                group: user.group ?? null,
                username: user.username ?? null,
                banned: false,
                createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
            },
        }, { status: 201 });
    } catch (error) {
        console.error("[admin] createUser error:", error);
        const code = (error as { body?: { code?: string } })?.body?.code;
        const message = code ? CREATE_USER_ERRORS[code] : undefined;
        return NextResponse.json(
            { error: message ?? "Erreur lors de la création du compte" },
            { status: message ? 400 : 500 },
        );
    }
}

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
