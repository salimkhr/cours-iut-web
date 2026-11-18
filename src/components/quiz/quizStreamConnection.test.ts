import {describe, expect, test} from "bun:test";
import type {QuizPublicState} from "@/lib/quiz/quizPublicState";
import {connectQuizStream, retryDelay, type EventSourceLike, type StreamConnection, type StreamDeps} from "./quizStreamConnection";

class FakeSource implements EventSourceLike {
    readyState = 0;
    onopen: ((event: Event) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    closed = false;
    private listeners: ((event: MessageEvent<string>) => void)[] = [];
    constructor(readonly url: string) {}
    addEventListener(_type: "state", listener: (event: MessageEvent<string>) => void) {
        this.listeners.push(listener);
    }
    close() {
        this.closed = true;
        this.readyState = 2;
    }
    emitOpen() {
        this.readyState = 1;
        this.onopen?.(new Event("open"));
    }
    emitState(phase: string) {
        for (const l of this.listeners) l(new MessageEvent("state", {data: JSON.stringify({phase})}));
    }
    /** `closed: true` imite une réponse non SSE (502) : le navigateur abandonne. */
    emitError(closed: boolean) {
        this.readyState = closed ? 2 : 0;
        this.onerror?.(new Event("error"));
    }
}

type Reply = {status: number; body?: unknown} | "network";

function harness(replies: Reply[]) {
    const sources: FakeSource[] = [];
    const timers: {fn: () => void; ms: number; cleared: boolean}[] = [];
    const states: string[] = [];
    const connections: StreamConnection[] = [];
    const fatal: {status: number; message: string}[] = [];
    let fetches = 0;
    let visibility: DocumentVisibilityState = "visible";
    let onVisibility: (() => void) | null = null;

    const deps: StreamDeps = {
        fetch: async () => {
            fetches++;
            const reply = replies.shift() ?? {status: 200, body: {phase: "lobby"}};
            if (reply === "network") throw new TypeError("Failed to fetch");
            return new Response(JSON.stringify(reply.body ?? {}), {status: reply.status});
        },
        createEventSource: (url) => {
            const s = new FakeSource(url);
            sources.push(s);
            return s;
        },
        setTimeout: (fn, ms) => {
            const t = {fn, ms, cleared: false};
            timers.push(t);
            return t;
        },
        clearTimeout: (handle) => {
            (handle as {cleared: boolean}).cleared = true;
        },
        document: {
            get visibilityState() {
                return visibility;
            },
            addEventListener: (_: string, fn: () => void) => {
                onVisibility = fn;
            },
            removeEventListener: () => {
                onVisibility = null;
            },
        } as unknown as StreamDeps["document"],
    };

    const dispose = connectQuizStream<QuizPublicState>("s1", "student", {
        onState: (s) => states.push(s.phase),
        onConnection: (c) => connections.push(c),
        onFatal: (e) => fatal.push(e),
    }, deps);

    const flush = () => new Promise((r) => setTimeout(r, 0));
    return {
        sources, timers, states, connections, fatal, dispose, flush,
        get fetches() {
            return fetches;
        },
        get onVisibility() {
            return onVisibility;
        },
        setVisibility(v: DocumentVisibilityState) {
            visibility = v;
            onVisibility?.();
        },
        async fireLastTimer() {
            const t = timers.filter((x) => !x.cleared).at(-1);
            t?.fn();
            await flush();
        },
    };
}

describe("connectQuizStream", () => {
    test("charge l'état, ouvre le flux et suit les événements", async () => {
        const h = harness([{status: 200, body: {phase: "lobby"}}]);
        await h.flush();
        expect(h.states).toEqual(["lobby"]);
        expect(h.sources).toHaveLength(1);
        expect(h.sources[0].url).toBe("/api/quiz/sessions/s1/stream");
        h.sources[0].emitOpen();
        h.sources[0].emitState("running");
        expect(h.states).toEqual(["lobby", "running"]);
        expect(h.connections.at(-1)).toBe("connected");
        h.dispose();
    });

    test("coupure réseau (CONNECTING) : laisse le navigateur réessayer seul", async () => {
        const h = harness([]);
        await h.flush();
        h.sources[0].emitError(false);
        expect(h.connections.at(-1)).toBe("reconnecting");
        expect(h.timers).toHaveLength(0);
        expect(h.sources[0].closed).toBe(false);
        h.dispose();
    });

    test("502 du proxy (CLOSED) : recharge l'état et rouvre un flux, avec un délai croissant", async () => {
        const h = harness([{status: 200, body: {phase: "lobby"}}, {status: 502}, {status: 200, body: {phase: "review"}}]);
        await h.flush();
        h.sources[0].emitError(true);
        expect(h.connections.at(-1)).toBe("reconnecting");
        expect(h.timers.map((t) => t.ms)).toEqual([1_000]);

        await h.fireLastTimer(); // /state répond 502 → nouvel essai, plus tard
        expect(h.timers.map((t) => t.ms)).toEqual([1_000, 2_000]);
        expect(h.sources).toHaveLength(1);

        await h.fireLastTimer(); // /state répond enfin
        expect(h.states).toEqual(["lobby", "review"]);
        expect(h.sources).toHaveLength(2);
        h.sources[1].emitOpen();
        expect(h.connections.at(-1)).toBe("connected");
        h.dispose();
    });

    test("le délai repart de zéro après une reconnexion réussie, et plafonne à 10 s", async () => {
        expect([0, 1, 2, 3, 4, 50].map(retryDelay)).toEqual([1_000, 2_000, 4_000, 8_000, 10_000, 10_000]);
        const h = harness([]);
        await h.flush();
        h.sources[0].emitError(true);
        await h.fireLastTimer();
        h.sources[1].emitOpen();
        h.sources[1].emitError(true);
        expect(h.timers.at(-1)?.ms).toBe(1_000);
        h.dispose();
    });

    test("serveur injoignable au premier chargement : réessaie au lieu d'abandonner", async () => {
        const h = harness(["network", {status: 200, body: {phase: "lobby"}}]);
        await h.flush();
        expect(h.fatal).toEqual([]);
        expect(h.connections.at(-1)).toBe("reconnecting");
        await h.fireLastTimer();
        expect(h.states).toEqual(["lobby"]);
        h.dispose();
    });

    test("403 ou 404 : erreur définitive, aucun nouvel essai", async () => {
        const h = harness([{status: 403, body: {error: "Vous ne participez pas à cette session"}}]);
        await h.flush();
        expect(h.fatal).toEqual([{status: 403, message: "Vous ne participez pas à cette session"}]);
        expect(h.timers).toHaveLength(0);
        expect(h.sources).toHaveLength(0);
    });

    test("au réveil du téléphone, repart d'un état frais et d'un flux neuf", async () => {
        const h = harness([{status: 200, body: {phase: "running"}}, {status: 200, body: {phase: "finished"}}]);
        await h.flush();
        h.setVisibility("hidden");
        expect(h.fetches).toBe(1);
        h.setVisibility("visible");
        await h.flush();
        expect(h.sources[0].closed).toBe(true);
        expect(h.sources).toHaveLength(2);
        expect(h.states).toEqual(["running", "finished"]);
        h.dispose();
    });

    test("un ancien flux remplacé n'émet plus rien", async () => {
        const h = harness([]);
        await h.flush();
        h.setVisibility("visible");
        await h.flush();
        h.sources[0].emitState("finished");
        expect(h.states).toEqual(["lobby", "lobby"]);
        h.dispose();
    });

    test("dispose ferme le flux, annule le minuteur et se désabonne", async () => {
        const h = harness([]);
        await h.flush();
        h.sources[0].emitError(true);
        h.dispose();
        expect(h.timers[0].cleared).toBe(true);
        expect(h.onVisibility).toBeNull();
        await h.fireLastTimer();
        expect(h.sources).toHaveLength(1);
    });
});
