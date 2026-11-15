"use client";

import {useEffect, useState} from "react";
import type {QuizPublicState} from "@/lib/quiz/quizPublicState";
import {connectQuizStream, type StreamConnection} from "@/components/quiz/quizStreamConnection";

export type {StreamConnection};

export interface QuizStream<T extends QuizPublicState> {
    state: T | null;
    connection: StreamConnection;
    /** Erreur bloquante (session introuvable, accès refusé…). */
    error: {status: number; message: string} | null;
}

/**
 * Charge d'abord l'état persistant (récupération après reconnexion), puis suit
 * le flux SSE. Le serveur renvoie l'état courant à chaque ouverture, donc
 * aucune mise à jour n'est perdue ; la reprise est décrite dans `connectQuizStream`.
 */
export function useQuizStream<T extends QuizPublicState>(
    sessionId: string,
    audience: "projection" | "student",
): QuizStream<T> {
    const [state, setState] = useState<T | null>(null);
    const [connection, setConnection] = useState<StreamConnection>("connecting");
    const [error, setError] = useState<QuizStream<T>["error"]>(null);

    useEffect(() => connectQuizStream<T>(sessionId, audience, {
        onState: setState,
        onConnection: setConnection,
        onFatal: setError,
    }, {
        fetch: (url, init) => fetch(url, init),
        createEventSource: (url) => new EventSource(url),
        setTimeout: (fn, ms) => window.setTimeout(fn, ms),
        clearTimeout: (handle) => window.clearTimeout(handle as number),
        document,
    }), [sessionId, audience]);

    return {state, connection, error};
}
