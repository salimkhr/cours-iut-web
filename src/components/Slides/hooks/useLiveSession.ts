"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveSessionState, LiveConnection } from "@/lib/live/liveTypes";

interface UseLiveSession {
    isLive: boolean;
    presenterName: string | null;
    presenter: { slide: number; step: number } | null;
    startedAt: number | null;
    connection: LiveConnection;
    /** Vrai uniquement sur l'appareil qui a démarré la session via start() */
    startedHere: boolean;
    sendCommand: (pos: { slide: number; step: number }) => void;
    start: () => Promise<void>;
    stop: () => Promise<void>;
    /** Reprend le contrôle côté client sans redémarrer la session (ex. après rechargement) */
    takeControl: () => void;
}

export function useLiveSession(moduleSlug: string, sectionSlug: string): UseLiveSession {
    const base = `/api/live/${moduleSlug}/${sectionSlug}`;
    const storageKey = `live-controller::${base}`;

    const [state, setState] = useState<LiveSessionState | null>(null);
    const [connection, setConnection] = useState<LiveConnection>("offline");
    // Persisté en sessionStorage pour survivre aux rechargements dans le même onglet
    const [startedHere, setStartedHere] = useState(
        () => typeof window !== "undefined" && sessionStorage.getItem(storageKey) === "true"
    );
    const esRef = useRef<EventSource | null>(null);

    const persistStarted = useCallback((value: boolean) => {
        if (value) sessionStorage.setItem(storageKey, "true");
        else sessionStorage.removeItem(storageKey);
        setStartedHere(value);
    }, [storageKey]);

    // Flux SSE (reconnexion native d'EventSource)
    useEffect(() => {
        const es = new EventSource(`${base}/stream`);
        esRef.current = es;

        es.onopen = () => setConnection("connected");
        es.onerror = () => setConnection((c) => (c === "connected" ? "reconnecting" : "offline"));
        es.addEventListener("state", (e) => {
            const data = JSON.parse((e as MessageEvent).data) as { live: boolean; state: LiveSessionState | null };
            setState(data.live ? data.state : null);
        });
        es.addEventListener("ended", () => {
            setState(null);
            persistStarted(false);
        });

        return () => { es.close(); esRef.current = null; };
    }, [base, persistStarted]);

    const sendCommand = useCallback((pos: { slide: number; step: number }) => {
        void fetch(`${base}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pos),
        });
    }, [base]);

    const start = useCallback(async () => {
        await fetch(`${base}/start`, { method: "POST" });
        persistStarted(true);
    }, [base, persistStarted]);

    const stop = useCallback(async () => {
        await fetch(`${base}/stop`, { method: "POST" });
        persistStarted(false);
    }, [base, persistStarted]);

    // Reprendre le contrôle côté client sans appeler /start (ne reset pas la slide)
    const takeControl = useCallback(() => persistStarted(true), [persistStarted]);

    return {
        isLive: state !== null,
        presenterName: state?.presenterName ?? null,
        presenter: state ? { slide: state.currentSlide, step: state.currentStep } : null,
        startedAt: state?.startedAt ?? null,
        connection,
        startedHere,
        sendCommand, start, stop, takeControl,
    };
}
