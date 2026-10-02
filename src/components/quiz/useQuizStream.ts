"use client";

import {useEffect, useState} from "react";
import type {QuizPublicState} from "@/lib/quiz/quizPublicState";

export type StreamConnection = "connecting" | "connected" | "reconnecting";

export interface QuizStream<T extends QuizPublicState> {
    state: T | null;
    connection: StreamConnection;
    /** Erreur bloquante (session introuvable, accès refusé…). */
    error: {status: number; message: string} | null;
}

/**
 * Charge d'abord l'état persistant (récupération après reconnexion), puis suit
 * le flux SSE. EventSource se reconnecte seul ; le serveur renvoie l'état
 * courant à chaque ouverture, donc aucune mise à jour n'est perdue.
 */
export function useQuizStream<T extends QuizPublicState>(
    sessionId: string,
    audience: "projection" | "student",
): QuizStream<T> {
    const [state, setState] = useState<T | null>(null);
    const [connection, setConnection] = useState<StreamConnection>("connecting");
    const [error, setError] = useState<QuizStream<T>["error"]>(null);

    useEffect(() => {
        let closed = false;
        let source: EventSource | null = null;
        const query = audience === "projection" ? "?audience=projection" : "";

        void fetch(`/api/quiz/sessions/${sessionId}/state${query}`, {cache: "no-store"})
            .then(async (res) => {
                if (closed) return;
                const json = await res.json().catch(() => null);
                if (!res.ok) {
                    setError({status: res.status, message: json?.error ?? "Session indisponible"});
                    return;
                }
                setState(json as T);
                source = new EventSource(`/api/quiz/sessions/${sessionId}/stream${query}`);
                source.addEventListener("state", (event) => {
                    setState(JSON.parse((event as MessageEvent<string>).data) as T);
                    setConnection("connected");
                });
                source.onopen = () => setConnection("connected");
                source.onerror = () => setConnection("reconnecting");
            })
            .catch(() => {
                if (!closed) setError({status: 0, message: "Connexion impossible"});
            });

        return () => {
            closed = true;
            source?.close();
        };
    }, [sessionId, audience]);

    return {state, connection, error};
}
