import type {QuizPublicState} from "@/lib/quiz/quizPublicState";

export type StreamConnection = "connecting" | "connected" | "reconnecting";

/** Sous-ensemble d'EventSource utilisé ici : un faux suffit en test. */
export interface EventSourceLike {
    readonly readyState: number;
    onopen: ((event: Event) => void) | null;
    onerror: ((event: Event) => void) | null;
    addEventListener(type: "state", listener: (event: MessageEvent<string>) => void): void;
    close(): void;
}

export interface StreamDeps {
    fetch: (url: string, init: RequestInit) => Promise<Response>;
    createEventSource: (url: string) => EventSourceLike;
    setTimeout: (fn: () => void, ms: number) => unknown;
    clearTimeout: (handle: unknown) => void;
    /** Absent hors navigateur. */
    document?: Pick<Document, "visibilityState" | "addEventListener" | "removeEventListener">;
}

export interface StreamCallbacks<T extends QuizPublicState> {
    onState: (state: T) => void;
    onConnection: (connection: StreamConnection) => void;
    /** Erreur définitive : session introuvable, accès refusé, non connecté. */
    onFatal: (error: {status: number; message: string}) => void;
}

const CLOSED = 2;
const RETRY_MS = [1_000, 2_000, 4_000, 8_000];
const MAX_RETRY_MS = 10_000;
/** Ces statuts ne changeront pas en réessayant. */
const FATAL_STATUS = new Set([401, 403, 404]);

export function retryDelay(attempt: number): number {
    return RETRY_MS[attempt] ?? MAX_RETRY_MS;
}

/**
 * Charge l'état persistant, puis suit le flux SSE. EventSource se reconnecte seul après une coupure
 * réseau, mais abandonne pour de bon sur une réponse non SSE (502/504 du proxy, redémarrage) :
 * on relance alors nous-mêmes, avec un délai croissant. Au réveil du téléphone, on repart de zéro,
 * car un flux endormi peut rester ouvert sans plus rien recevoir.
 */
export function connectQuizStream<T extends QuizPublicState>(
    sessionId: string,
    audience: "projection" | "student",
    callbacks: StreamCallbacks<T>,
    deps: StreamDeps,
): () => void {
    const query = audience === "projection" ? "?audience=projection" : "";
    let disposed = false;
    let source: EventSourceLike | null = null;
    let retryTimer: unknown = null;
    let attempt = 0;
    let generation = 0;

    const closeSource = () => {
        source?.close();
        source = null;
    };

    const scheduleRetry = () => {
        if (disposed || retryTimer !== null) return;
        callbacks.onConnection("reconnecting");
        retryTimer = deps.setTimeout(() => {
            retryTimer = null;
            void load();
        }, retryDelay(attempt));
        attempt++;
    };

    const open = (current: number) => {
        const es = deps.createEventSource(`/api/quiz/sessions/${sessionId}/stream${query}`);
        source = es;
        es.addEventListener("state", (event) => {
            if (current !== generation) return;
            callbacks.onState(JSON.parse(event.data) as T);
            callbacks.onConnection("connected");
        });
        es.onopen = () => {
            if (current !== generation) return;
            attempt = 0;
            callbacks.onConnection("connected");
        };
        es.onerror = () => {
            if (current !== generation) return;
            callbacks.onConnection("reconnecting");
            // CONNECTING : le navigateur réessaie seul. CLOSED : il a abandonné, à nous de relancer.
            if (es.readyState === CLOSED) {
                closeSource();
                scheduleRetry();
            }
        };
    };

    async function load(): Promise<void> {
        const current = ++generation;
        closeSource();
        let res: Response;
        try {
            res = await deps.fetch(`/api/quiz/sessions/${sessionId}/state${query}`, {cache: "no-store"});
        } catch {
            if (!disposed && current === generation) scheduleRetry();
            return;
        }
        if (disposed || current !== generation) return;
        const json = await res.json().catch(() => null) as (T & {error?: string}) | null;
        if (disposed || current !== generation) return;
        if (!res.ok) {
            if (FATAL_STATUS.has(res.status)) {
                callbacks.onFatal({status: res.status, message: json?.error ?? "Session indisponible"});
            } else {
                scheduleRetry();
            }
            return;
        }
        callbacks.onState(json as T);
        open(current);
    }

    const onVisibility = () => {
        if (disposed || deps.document?.visibilityState !== "visible") return;
        if (retryTimer !== null) {
            deps.clearTimeout(retryTimer);
            retryTimer = null;
        }
        attempt = 0;
        void load();
    };

    deps.document?.addEventListener("visibilitychange", onVisibility);
    void load();

    return () => {
        disposed = true;
        generation++;
        if (retryTimer !== null) deps.clearTimeout(retryTimer);
        deps.document?.removeEventListener("visibilitychange", onVisibility);
        closeSource();
    };
}
