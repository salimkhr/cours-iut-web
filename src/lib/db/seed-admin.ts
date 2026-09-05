import { type Db } from "mongodb";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";

const adminSchema = z.object({
    email: z.email().transform(value => value.toLowerCase()),
    password: z.string().min(7).max(128),
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_.]+$/).transform(value => value.toLowerCase()),
});

export function getAdminConfig(env: Record<string, string | undefined>) {
    if (!env.ADMIN_EMAIL && !env.ADMIN_PASSWORD && !env.ADMIN_USERNAME) return null;
    const result = adminSchema.safeParse({
        email: env.ADMIN_EMAIL?.trim(), password: env.ADMIN_PASSWORD,
        username: env.ADMIN_USERNAME?.trim() || "admin",
    });
    if (!result.success) {
        throw new Error("Configurer ADMIN_EMAIL (email valide), ADMIN_PASSWORD (7 à 128 caractères) et ADMIN_USERNAME (3 à 32 lettres, chiffres, points ou underscores ; défaut : admin).");
    }
    return result.data;
}

export async function seedAdmin(db: Db, config: NonNullable<ReturnType<typeof getAdminConfig>>) {
    const users = db.collection("user");
    const existing = await users.findOne({ email: config.email });
    if (existing && existing.role !== "admin") {
        throw new Error("ADMIN_EMAIL appartient déjà à un compte non administrateur. Choisir une autre adresse.");
    }
    if (existing) {
        console.log("Administrateur déjà présent ; identifiants conservés.");
        return;
    }
    if (await users.findOne({ username: config.username })) {
        throw new Error("ADMIN_USERNAME est déjà utilisé. Choisir un autre identifiant.");
    }
    const password = await hashPassword(config.password);
    const now = new Date();
    const { insertedId } = await users.insertOne({
        name: "Administrateur", email: config.email, emailVerified: true,
        username: config.username, displayUsername: config.username,
        role: "admin", banned: false, createdAt: now, updatedAt: now,
    });
    try {
        await db.collection("account").insertOne({
            userId: insertedId, accountId: insertedId.toHexString(),
            providerId: "credential", password, createdAt: now, updatedAt: now,
        });
    } catch (error) {
        await users.deleteOne({ _id: insertedId });
        throw error;
    }
    console.log(`Administrateur créé : ${config.username} (${config.email}).`);
}
