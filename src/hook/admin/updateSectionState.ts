export default async function updateSectionState(
    moduleId: string,
    sectionId: string,
    key: 'isAvailable' | 'correctionIsAvailable',
    value: boolean
) {
    const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({moduleId, sectionId, key, value})
    });

    if (!res.ok) {
        throw new Error('Erreur mise à jour');
    }
}