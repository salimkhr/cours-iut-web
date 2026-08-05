/**
 * Mémoire locale de la dernière section ouverte, par module.
 *
 * Il n'existe pas de suivi de progression serveur : « Continuer le cours »
 * pointait donc sur la *dernière section publiée* du module, ce qui expédiait un
 * étudiant qui n'a rien lu au dernier chapitre. Cette mémoire, purement locale
 * et par navigateur, permet au CTA de dire la vérité : « Commencer » quand rien
 * n'a été ouvert, « Reprendre » sinon.
 */

import {readPref, usePref, writePref} from '@/lib/clientPrefs';

const KEY = 'lastVisited';

type Store = Record<string, string>;

function parse(raw: string | null): Store {
    try {
        if (!raw) return {};
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
        return Object.fromEntries(
            Object.entries(parsed as Record<string, unknown>)
                .filter(([, v]) => typeof v === 'string')
        ) as Store;
    } catch {
        // JSON corrompu : la mémoire est un confort, jamais un prérequis — on
        // retombe silencieusement sur « aucune progression ».
        return {};
    }
}

export function getLastVisitedSection(modulePath: string): string | null {
    return parse(readPref(KEY))[modulePath] ?? null;
}

/** Version réactive : se resynchronise après hydratation et entre onglets. */
export function useLastVisitedSection(modulePath: string): string | null {
    return parse(usePref(KEY))[modulePath] ?? null;
}

export function setLastVisitedSection(modulePath: string, sectionPath: string): void {
    const store = parse(readPref(KEY));
    if (store[modulePath] === sectionPath) return;
    store[modulePath] = sectionPath;
    writePref(KEY, JSON.stringify(store));
}
