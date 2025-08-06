import {promises as fs} from 'fs';
import path from 'path';
import {cookies} from "next/headers";
import Tokens from "csrf";
import {invalidateSectionStateCache} from "@/lib/getMergedModules";

type AllowedKey = 'isAvailable' | 'correctionIsAvailable';

interface Body {
    moduleId: string;
    sectionId: string;
    key: AllowedKey;
    value: boolean;
}

const tokens = new Tokens();
const stateFilePath = path.resolve(process.cwd(), 'config/section-state.json');

// Fonction utilitaire pour s'assurer que le fichier existe
async function ensureStateFileExists(): Promise<void> {
    try {
        await fs.access(stateFilePath);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            // Créer le répertoire config s'il n'existe pas
            const configDir = path.dirname(stateFilePath);
            await fs.mkdir(configDir, {recursive: true});

            // Créer le fichier avec une structure vide
            await fs.writeFile(stateFilePath, JSON.stringify({}, null, 2), 'utf-8');
            console.log('🔧 [API] Created new section-state.json file');
        } else {
            throw error;
        }
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const secret = cookieStore.get('csrfSecret')?.value;
        const token = req.headers.get('csrf-token');

        if (!secret || !token || !tokens.verify(secret, token)) {
            return new Response(JSON.stringify({error: 'Invalid CSRF token'}), {
                status: 403,
                headers: {'Content-Type': 'application/json'},
            });
        }

        const body = (await req.json()) as Body;
        const {moduleId, sectionId, key, value} = body;

        // Sécurité : valider les entrées
        if (!moduleId || !sectionId || !['isAvailable', 'correctionIsAvailable'].includes(key)) {
            return new Response(
                JSON.stringify({error: 'Requête invalide'}),
                {status: 400, headers: {'Content-Type': 'application/json'}}
            );
        }

        // S'assurer que le fichier existe
        await ensureStateFileExists();

        // Lire le fichier actuel
        let state: Record<string, Record<string, Partial<Record<AllowedKey, boolean>>>>;

        try {
            const raw = await fs.readFile(stateFilePath, 'utf-8');
            state = JSON.parse(raw);
        } catch (parseError) {
            console.warn('🔧 [API] Error parsing existing state, creating new structure:', parseError);
            state = {};
        }

        // Mettre à jour l'état
        if (!state[moduleId]) state[moduleId] = {};
        if (!state[moduleId][sectionId]) state[moduleId][sectionId] = {};

        state[moduleId][sectionId][key] = value;

        // Réécriture du fichier
        await fs.writeFile(stateFilePath, JSON.stringify(state, null, 2), 'utf-8');

        // Invalider le cache après mise à jour
        invalidateSectionStateCache();

        console.log(`🔧 [API] Updated ${moduleId}.${sectionId}.${key} = ${value}`);

        return new Response(JSON.stringify({
            success: true,
            updated: {moduleId, sectionId, key, value}
        }), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });

    } catch (err) {
        console.error('❌ [API] Error in POST /update-section-state:', err);
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                message: err instanceof Error ? err.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: {'Content-Type': 'application/json'}
            }
        );
    }
}