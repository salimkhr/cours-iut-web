'use client';

import {useEffect, useLayoutEffect, useRef} from 'react';

const PREFIX = 'scroll:';
const SAVE_DEBOUNCE_MS = 150;

interface ScrollRestoreProps {
    storageKey: string;
}

const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Mémorise une position de lecture par contenu (cours, TP, examen).
 *
 * C'est ce qui permet l'aller-retour utile pendant un TP : on quitte l'exercice
 * pour vérifier un point du cours, et l'on revient là où l'on était — chaque
 * onglet gardant sa propre position, indépendamment de l'autre.
 */
export default function ScrollRestore({storageKey}: ScrollRestoreProps) {
    /** Faux tant que cette page n'a pas été parcourue par l'utilisateur. */
    const touched = useRef(false);

    // Ce composant gère lui-même la position. Laisser en plus la restauration
    // native produisait un conflit : la position de l'entrée d'historique était
    // réappliquée après coup, par-dessus la nôtre.
    useEffect(() => {
        if (!('scrollRestoration' in window.history)) return;
        const previous = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';
        return () => {
            window.history.scrollRestoration = previous;
        };
    }, []);

    useIsomorphicLayoutEffect(() => {
        touched.current = false;
        if (window.location.hash) return;

        const saved = sessionStorage.getItem(PREFIX + storageKey);
        const y = saved !== null ? parseInt(saved, 10) || 0 : 0;

        window.scrollTo(0, y);
        // En navigation client, le contenu n'a pas toujours sa hauteur
        // définitive au commit : un `scrollTo` posé trop tôt reste sans effet et
        // l'on garde la position de la page précédente. On repasse à la frame
        // suivante, une fois la mise en page stabilisée.
        const frame = requestAnimationFrame(() => window.scrollTo(0, y));
        return () => cancelAnimationFrame(frame);
    }, [storageKey]);

    useEffect(() => {
        const fullKey = PREFIX + storageKey;
        let timeout: ReturnType<typeof setTimeout> | null = null;

        const save = () => sessionStorage.setItem(fullKey, String(window.scrollY));
        const onScroll = () => {
            touched.current = true;
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(save, SAVE_DEBOUNCE_MS);
        };

        window.addEventListener('scroll', onScroll, {passive: true});
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (timeout) clearTimeout(timeout);
            // On n'enregistre qu'une position réellement atteinte sur CETTE
            // page. Sauvegarder inconditionnellement écrivait la position
            // héritée de la page précédente par-dessus la vraie : le TP
            // rouvrait alors à l'endroit où l'on avait laissé le cours. En
            // développement, la double invocation du StrictMode suffisait à
            // déclencher cette écrasement dès le premier rendu.
            if (touched.current) save();
        };
    }, [storageKey]);

    return null;
}
