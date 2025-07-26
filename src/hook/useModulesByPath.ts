import {Module} from "@/types/module";

/**
 * Récupère un module spécifique selon son path.
 *
 * @param path - Le path unique du module
 * @returns {Promise<Module>} Le module correspondant
 * @throws {Error} Si la requête échoue
 */
export async function getModuleByPath(path: string): Promise<Module> {
    try {
        console.log(path)
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/modules/${path}`, {
            next: {revalidate: 60}, // Revalidation SSR (facultatif)
        });

        if (!res.ok) {
            throw new Error(`Erreur lors du chargement du module : ${res.statusText}`);
        }

        return await res.json();
    } catch (error) {
        console.error(`Erreur dans getModuleByPath(${path}):`, error);
        throw error;
    }
}
