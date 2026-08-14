import type {ProjectSpec} from "@/lib/schemas/module.schema";

/** Porte 1 : on ne code le projet de référence qu'une fois la spec validée. */
export function canPushReference(spec: ProjectSpec | undefined): boolean {
    return spec?.status === "validated";
}

/** Porte 2 : on ne rédige pas tant que le code cible n'est pas relu.
 *  Un module sans `referenceRepo` (cas des modules migrés) reste ouvert :
 *  la porte se ferme d'elle-même dès qu'un dépôt est déclaré. */
export function canWriteContent(spec: ProjectSpec | undefined): boolean {
    if (!spec?.referenceRepo) return true;
    return spec.referenceRepo.status === "validated";
}

export function assertCanPushReference(spec: ProjectSpec | undefined, moduleSlug: string): void {
    if (canPushReference(spec)) return;
    throw new Error(
        `La spec projet du module "${moduleSlug}" n'est pas validée. `
        + `Complétez-la et validez-la dans l'admin (étape « Projet ») avant de pousser le code de référence.`
    );
}

export function assertCanWriteContent(spec: ProjectSpec | undefined, moduleSlug: string): void {
    if (canWriteContent(spec)) return;
    throw new Error(
        `Le dépôt de référence du module "${moduleSlug}" n'est pas validé. `
        + `Relisez-le sur GitLab et validez-le dans l'admin (étape « Référence ») avant de rédiger.`
    );
}
