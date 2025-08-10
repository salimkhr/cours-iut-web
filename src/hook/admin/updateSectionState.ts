import {ObjectId} from "bson";

export default async function updateSectionState(
    moduleId: string | ObjectId,
    sectionId: string | ObjectId,
    key: 'isAvailable' | 'correctionIsAvailable',
    value: boolean
) {
    try {
        const csrfRes = await fetch('/api/csrf-token');
        const {csrfToken} = await csrfRes.json();

        const updateRes = await fetch('/api/admin', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'csrf-token': csrfToken},
            body: JSON.stringify({moduleId, sectionId, key, value}),
        });

        if (!updateRes.ok) {
            const errorData = await updateRes.json().catch(() => ({}));
            throw new Error(
                errorData.message ||
                `Erreur lors de la mise à jour du fichier section-state.json (${updateRes.status})`
            );
        }

        return {
            success: true,
        };

    } catch (error) {
        console.error('Error in updateSectionState:', error);
        throw error; // Re-lancer l'erreur pour que l'appelant puisse la gérer
    }
}