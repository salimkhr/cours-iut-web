import type {CorrectionFile} from "@/lib/gitlab";

/** Nom du projet GitLab privé qui porte le code de référence d'un module. */
export function referenceProjectSlug(moduleSlug: string): string {
    return `projet-reference-${moduleSlug}`;
}

/** Le dépôt de référence ne contient que des chemins relatifs sous la racine :
 *  `commitFiles` reflète la liste telle quelle, une entrée malformée casse le commit. */
export function assertReferenceFiles(files: CorrectionFile[]): void {
    if (files.length === 0) {
        throw new Error("Le dépôt de référence doit contenir au moins un fichier.");
    }
    for (const file of files) {
        if (file.path.startsWith("/") || file.path.split("/").includes("..")) {
            throw new Error(`Chemin invalide "${file.path}" : un chemin relatif sous la racine est attendu.`);
        }
    }
}
