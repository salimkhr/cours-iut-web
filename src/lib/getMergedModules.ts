import modules from '../../config/modules';
import {Module} from '@/types/module';
import {SectionStateMap} from '@/types/SectionState';
import {unstable_noStore as noStore} from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

// SUPPRIMER cette ligne - c'est ça le problème !
// import rawSectionState from '../../config/section-state.json';

// Fonction pour lire dynamiquement le fichier section-state.json
async function getSectionState(): Promise<SectionStateMap> {
    try {
        // Construire le chemin vers le fichier
        const sectionStatePath = path.join(process.cwd(), 'config', 'section-state.json');

        console.log('🔧 [MODULES] Reading section state from:', sectionStatePath);

        // Lire le fichier à chaque appel (pas de cache)
        const fileContent = await fs.readFile(sectionStatePath, 'utf-8');
        const sectionState = JSON.parse(fileContent) as SectionStateMap;

        console.log('🔧 [MODULES] Section state loaded:', Object.keys(sectionState));

        return sectionState;
    } catch (error) {
        console.error('❌ [MODULES] Error reading section state:', error);
        // Retourner un objet vide en cas d'erreur
        return {};
    }
}

// Fonction principale - maintenant async
export default async function getMergedModules(): Promise<Module[]> {
    // Empêcher le cache Next.js
    noStore();

    console.log('🔧 [MODULES] Starting getMergedModules');

    // Lire le section state dynamiquement
    const sectionState = await getSectionState();

    const mergedModules = modules.map((mod) => ({
        ...mod,
        sections: mod.sections.map((section) => {
            const stateForModule = sectionState[mod.id] ?? {};
            const rawState = stateForModule[section.id] ?? {};

            const dynamicState = {
                isAvailable: rawState.isAvailable ?? false,
                correctionIsAvailable: rawState.correctionIsAvailable ?? false
            };

            console.log(`🔧 [MODULES] Module ${mod.id}, Section ${section.id}:`, dynamicState);

            return {
                ...section,
                ...dynamicState
            };
        }),
    }));

    console.log('🔧 [MODULES] Merged modules completed');

    return mergedModules;
}