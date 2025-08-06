import modules from '../../config/modules';
import {Module} from '@/types/module';
import {SectionStateMap} from '@/types/SectionState';
import {unstable_noStore as noStore} from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

// Cache en mémoire
interface CacheEntry {
    data: SectionStateMap;
    timestamp: number;
    fileModified?: number;
}

let cache: CacheEntry | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

async function getSectionState(): Promise<SectionStateMap> {
    const sectionStatePath = path.join(process.cwd(), 'config', 'section-state.json');

    try {
        // Vérifier si le fichier existe
        let fileStats;
        try {
            fileStats = await fs.stat(sectionStatePath);
        } catch (statError) {
            if ((statError as NodeJS.ErrnoException).code === 'ENOENT') {
                console.log('🔧 [MODULES] Section state file does not exist, creating default structure');

                // Créer le répertoire config s'il n'existe pas
                const configDir = path.dirname(sectionStatePath);
                await fs.mkdir(configDir, {recursive: true});

                // Créer le fichier avec une structure par défaut
                const defaultState: SectionStateMap = {};
                await fs.writeFile(sectionStatePath, JSON.stringify(defaultState, null, 2), 'utf-8');

                return defaultState;
            }
            throw statError;
        }

        const fileModified = fileStats.mtime.getTime();
        const now = Date.now();

        // Vérifier le cache
        if (cache &&
            (now - cache.timestamp) < CACHE_DURATION &&
            cache.fileModified === fileModified) {
            console.log('🔧 [MODULES] Using cached section state');
            return cache.data;
        }

        console.log('🔧 [MODULES] Reading section state from:', sectionStatePath);

        // Lire le fichier
        const fileContent = await fs.readFile(sectionStatePath, 'utf-8');
        let sectionState: SectionStateMap;

        try {
            sectionState = JSON.parse(fileContent) as SectionStateMap;
        } catch (parseError) {
            console.error('❌ [MODULES] Error parsing section state JSON, using default:', parseError);
            sectionState = {};
        }

        // Mettre à jour le cache
        cache = {
            data: sectionState,
            timestamp: now,
            fileModified
        };

        console.log('🔧 [MODULES] Section state loaded and cached:', Object.keys(sectionState));

        return sectionState;
    } catch (error) {
        console.error('❌ [MODULES] Error reading section state:', error);

        // Retourner le cache s'il existe, sinon une structure vide
        if (cache && (Date.now() - cache.timestamp) < (CACHE_DURATION * 2)) {
            console.log('🔧 [MODULES] Using stale cache due to error');
            return cache.data;
        }

        return {};
    }
}

// Fonction pour invalider le cache (utile après une mise à jour)
export function invalidateSectionStateCache(): void {
    cache = null;
    console.log('🔧 [MODULES] Section state cache invalidated');
}

// Fonction principale - maintenant async
export default async function getMergedModules(): Promise<Module[]> {
    // Empêcher le cache Next.js pour les données dynamiques
    noStore();

    console.log('🔧 [MODULES] Starting getMergedModules');

    // Lire le section state dynamiquement (avec cache)
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