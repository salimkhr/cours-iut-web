"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { computeDrift, type Drift } from "@/lib/live/drift";

interface FollowerSyncArgs {
    isLive: boolean;
    isPresenter: boolean;
    presenter: { slide: number; step: number } | null;
    localSlide: number;
    syncTo: (slide: number, step: number) => void;
}

interface FollowerSync {
    paused: boolean;          // l'élève explore seul
    drift: Drift;
    resync: () => void;       // réaligne sur le présentateur
    notifyLocalNav: () => void; // à appeler quand l'élève navigue lui-même
}

/**
 * Couche de suivi pour un follower : applique la position du présentateur tant
 * que l'élève ne s'en écarte pas. Dès qu'il navigue, met en pause l'auto-suivi
 * et expose la dérive + un resync.
 */
export function useFollowerSync({
    isLive, isPresenter, presenter, localSlide, syncTo,
}: FollowerSyncArgs): FollowerSync {
    const [paused, setPaused] = useState(false);
    const applyingRef = useRef(false);

    const drift: Drift = isLive && presenter
        ? computeDrift(localSlide, presenter.slide)
        : { delta: 0, direction: "synced" };

    // Applique la position du présentateur (sauf si présentateur soi-même ou en pause)
    useEffect(() => {
        if (!isLive || isPresenter || paused || !presenter) return;
        applyingRef.current = true;
        syncTo(presenter.slide, presenter.step);
        // libère le flag après application
        const id = requestAnimationFrame(() => { applyingRef.current = false; });
        return () => cancelAnimationFrame(id);
    }, [isLive, isPresenter, paused, presenter, syncTo]);

    const notifyLocalNav = useCallback(() => {
        if (applyingRef.current) return; // changement venant du suivi, pas de l'élève
        if (isLive && !isPresenter) setPaused(true);
    }, [isLive, isPresenter]);

    const resync = useCallback(() => {
        if (presenter) syncTo(presenter.slide, presenter.step);
        setPaused(false);
    }, [presenter, syncTo]);

    // Quand la session se termine, on sort de pause
    useEffect(() => {
        if (!isLive) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPaused(false);
        }
    }, [isLive]);

    return { paused, drift, resync, notifyLocalNav };
}
