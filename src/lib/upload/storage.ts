import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

function getUploadsBase(): string {
    const val = process.env.UPLOADS_DIR;
    if (!val) throw new Error("Variable d'environnement manquante : UPLOADS_DIR");
    return val;
}

function getQuarantineBase(): string {
    const val = process.env.QUARANTINE_DIR;
    if (!val) throw new Error("Variable d'environnement manquante : QUARANTINE_DIR");
    return val;
}

/**
 * Écrit le buffer dans uploads/<subdir>/<uuid>.<ext> avec permissions 640.
 * Retourne le nom de fichier (sans le chemin).
 */
export async function storeFinal(buf: Buffer, ext: string, subdir = "avatars"): Promise<string> {
    const filename = `${randomUUID()}.${ext}`;
    const dir = path.join(/* turbopackIgnore: true */ getUploadsBase(), subdir);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(/* turbopackIgnore: true */ dir, filename), buf, { mode: 0o640 });
    return filename;
}

/**
 * Déplace un fichier infecté en quarantaine avec permissions 600.
 * Le nom inclut un timestamp pour faciliter l'audit.
 */
export async function storeQuarantine(buf: Buffer, reason: string): Promise<void> {
    const dir = getQuarantineBase();
    await mkdir(dir, { recursive: true });
    const filename = `${Date.now()}_${randomUUID()}`;
    await writeFile(path.join(/* turbopackIgnore: true */ dir, filename), buf, { mode: 0o600 });
    console.warn(`[QUARANTINE] ${filename} — ${reason}`);
}
