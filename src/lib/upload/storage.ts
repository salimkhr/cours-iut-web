import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { UPLOAD_CONFIG } from "./config";

/**
 * Écrit le buffer dans uploads/<subdir>/<uuid>.<ext> avec permissions 640.
 * Retourne le nom de fichier (sans le chemin).
 */
export async function storeFinal(buf: Buffer, ext: string, subdir = "avatars"): Promise<string> {
    const filename = `${randomUUID()}.${ext}`;
    const dir = path.join(UPLOAD_CONFIG.uploadsDir, subdir);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buf, { mode: 0o640 });
    return filename;
}

/**
 * Déplace un fichier infecté en quarantaine avec permissions 600.
 * Le nom inclut un timestamp pour faciliter l'audit.
 */
export async function storeQuarantine(buf: Buffer, reason: string): Promise<void> {
    const dir = UPLOAD_CONFIG.quarantineDir;
    await mkdir(dir, { recursive: true });
    const filename = `${Date.now()}_${randomUUID()}`;
    await writeFile(path.join(dir, filename), buf, { mode: 0o600 });
    console.warn(`[QUARANTINE] ${filename} — ${reason}`);
}
