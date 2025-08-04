export default async function updateSectionState(
    moduleId: string,
    sectionId: string,
    key: 'isAvailable' | 'correctionIsAvailable',
    value: boolean
) {
    try {
        // 1. Mise à jour des données
        const updateRes = await fetch('/api/admin', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({moduleId, sectionId, key, value}),
        });

        if (!updateRes.ok) {
            const errorData = await updateRes.json().catch(() => ({}));
            throw new Error(
                errorData.message ||
                `Erreur lors de la mise à jour du fichier section-state.json (${updateRes.status})`
            );
        }

        // 2. Définition des chemins à revalider
        const pathsToRevalidate = [
            `/${moduleId}`,
            `/${moduleId}/${sectionId}`,
        ];

        // 3. Revalidation parallèle des chemins (plus rapide)
        const revalidationPromises = pathsToRevalidate.map(async (path) => {
            try {
                console.log(`Revalidating: ${path}`);
                const res = await fetch(`/api/revalidate?path=${encodeURIComponent(path)}`);

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(
                        errorData.message ||
                        `Erreur revalidation du chemin : ${path} (${res.status})`
                    );
                }

                const result = await res.json();
                console.log(`✅ Revalidated: ${path}`, result);
                return {path, success: true, result};
            } catch (error) {
                console.error(`❌ Failed to revalidate: ${path}`, error);
                return {path, success: false};
            }
        });

        // Attendre toutes les revalidations
        const revalidationResults = await Promise.all(revalidationPromises);

        // Vérifier s'il y a eu des échecs
        const failures = revalidationResults.filter(result => !result.success);

        if (failures.length > 0) {
            console.warn('Some revalidations failed:', failures);
        }

        return {
            success: true,
            revalidated: revalidationResults.filter(r => r.success).map(r => r.path),
            failed: failures.map(f => f.path)
        };

    } catch (error) {
        console.error('Error in updateSectionState:', error);
        throw error; // Re-lancer l'erreur pour que l'appelant puisse la gérer
    }
}