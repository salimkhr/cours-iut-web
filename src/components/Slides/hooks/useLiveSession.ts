"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveSessionState, LiveConnection } from "@/lib/live/liveTypes";

interface UseLiveSession {
    isLive: boolean;
    presenterName: string | null;
    presenter: { slide: number; step: number } | null;
    startedAt: number | null;
    connection: LiveConnection;
    sendCommand: (pos: { slide: number; step: number }) => void;
    start: () => Promise<void>;
    stop: () => Promise<void>;
}

export function useLiveSession(moduleSlug: string, sectionSlug: string): UseLiveSession {
    const base = `/api/live/${moduleSlug}/${sectionSlug}`;
    const [state, setState] = useState<LiveSessionState | null>(null);
    const [connection, setConnection] = useState<LiveConnection>("offline");
    const esRef = useRef<EventSource | null>(null);

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
        es.addEventListener("ended", () => setState(null));

        return () => { es.close(); esRef.current = null; };
    }, [base]);

    const sendCommand = useCallback((pos: { slide: number; step: number }) => {
        void fetch(`${base}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pos),
        });
    }, [base]);

    const start = useCallback(async () => { await fetch(`${base}/start`, { method: "POST" }); }, [base]);
    const stop = useCallback(async () => { await fetch(`${base}/stop`, { method: "POST" }); }, [base]);

    return {
        isLive: state !== null,
        presenterName: state?.presenterName ?? null,
        presenter: state ? { slide: state.currentSlide, step: state.currentStep } : null,
        startedAt: state?.startedAt ?? null,
        connection,
        sendCommand, start, stop,
    };
}
