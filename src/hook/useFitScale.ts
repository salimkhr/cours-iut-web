'use client';

import {useEffect, useRef, useState, type RefObject} from "react";

/**
 * Mesure un panneau et renvoie l'échelle à appliquer à un cadre de taille fixe.
 * Mécanisme commun aux slides du builder (`ZoomedSlide`) et à la projection du quiz.
 *
 * `scale` vaut `null` tant que le panneau n'est pas mesuré : le rendu doit alors afficher
 * un état d'attente plutôt qu'un cadre à la mauvaise taille. `computeScale` doit être stable
 * (fonction de module ou `useCallback`) : un changement de référence relance la mesure.
 */
export function useFitScale<T extends HTMLElement = HTMLDivElement>(
    computeScale: (panelW: number, panelH: number) => number,
): {ref: RefObject<T | null>; scale: number | null} {
    const ref = useRef<T>(null);
    const [scale, setScale] = useState<number | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let raf = 0;
        const measure = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const {width, height} = el.getBoundingClientRect();
                setScale(computeScale(width, height));
            });
        };

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => {
            ro.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [computeScale]);

    return {ref, scale};
}
