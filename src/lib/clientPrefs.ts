'use client';

import {useSyncExternalStore} from 'react';

/**
 * Petit store `localStorage` observable.
 *
 * Ces préférences (dernière section ouverte, sommaire déplié) n'existent pas au
 * rendu serveur. `useSyncExternalStore` est la primitive faite pour ça : le
 * snapshot serveur est neutre, le client se resynchronise après hydratation
 * sans `setState` dans un effet.
 */

type Listener = () => void;

const listeners = new Set<Listener>();

function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    // Un autre onglet peut changer la valeur : `storage` ne se déclenche que
    // pour les autres documents, d'où la notification manuelle dans `writePref`.
    window.addEventListener('storage', listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', listener);
    };
}

export function readPref(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem(key);
    } catch {
        // Mode privé strict ou quota : la préférence est un confort, pas un prérequis.
        return null;
    }
}

export function writePref(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // idem : échec sans conséquence fonctionnelle
    }
    listeners.forEach((l) => l());
}

/** Valeur courante d'une préférence, `null` côté serveur et au premier rendu. */
export function usePref(key: string): string | null {
    return useSyncExternalStore(
        subscribe,
        () => readPref(key),
        () => null,
    );
}
