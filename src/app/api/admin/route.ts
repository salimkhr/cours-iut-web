import {promises as fs} from 'fs';
import path from 'path';

type AllowedKey = 'isAvailable' | 'correctionIsAvailable';

interface Body {
    moduleId: string;
    sectionId: string;
    key: AllowedKey;
    value: boolean;
}

const stateFilePath = path.resolve(process.cwd(), 'config/section-state.json');

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as Body;
        const {moduleId, sectionId, key, value} = body;

        // Sécurité : valider les entrées
        if (!moduleId || !sectionId || !['isAvailable', 'correctionIsAvailable'].includes(key)) {
            return new Response(
                JSON.stringify({error: 'Requête invalide'}),
                {status: 400}
            );
        }

        // Lire le fichier actuel
        const raw = await fs.readFile(stateFilePath, 'utf-8');
        const state = JSON.parse(raw) as Record<
            string,
            Record<string, Partial<Record<AllowedKey, boolean>>>
        >;
        // Mettre à jour l'état
        if (!state[moduleId]) state[moduleId] = {};
        if (!state[moduleId][sectionId]) state[moduleId][sectionId] = {};

        state[moduleId][sectionId][key] = value;

        // Réécriture du fichier
        await fs.writeFile(stateFilePath, JSON.stringify(state, null, 2), 'utf-8');

        return new Response(JSON.stringify({success: true}), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    } catch (err) {
        console.error('Erreur API POST /update-section-state:', err);
        return new Response(
            JSON.stringify({error: err}),
            {status: 500}
        );
    }
}