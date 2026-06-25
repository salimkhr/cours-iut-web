import { EventEmitter } from "node:events";
import type { LiveSessionState, LiveCommand } from "@/lib/live/liveTypes";

type StateListener = (state: LiveSessionState) => void;
type EndListener = () => void;

interface Entry {
    state: LiveSessionState;
    emitter: EventEmitter;
}

class LiveSessionRegistry {
    private sessions = new Map<string, Entry>();

    start(sessionId: string, presenterName: string): LiveSessionState {
        const now = Date.now();
        const state: LiveSessionState = {
            sessionId,
            presenterName,
            currentSlide: 0,
            currentStep: 0,
            startedAt: now,
            updatedAt: now,
        };
        const existing = this.sessions.get(sessionId);
        const emitter = existing?.emitter ?? new EventEmitter();
        emitter.setMaxListeners(0);
        this.sessions.set(sessionId, { state, emitter });
        emitter.emit("state", state);
        return state;
    }

    stop(sessionId: string): void {
        const entry = this.sessions.get(sessionId);
        if (!entry) return;
        entry.emitter.emit("ended");
        entry.emitter.removeAllListeners();
        this.sessions.delete(sessionId);
    }

    setPosition(sessionId: string, cmd: LiveCommand): void {
        const entry = this.sessions.get(sessionId);
        if (!entry) return;
        entry.state = {
            ...entry.state,
            currentSlide: cmd.slide,
            currentStep: cmd.step,
            updatedAt: Date.now(),
        };
        entry.emitter.emit("state", entry.state);
    }

    get(sessionId: string): LiveSessionState | null {
        return this.sessions.get(sessionId)?.state ?? null;
    }

    subscribe(
        sessionId: string,
        onState: StateListener,
        onEnd?: EndListener,
    ): () => void {
        const entry = this.sessions.get(sessionId);
        if (!entry) return () => {};
        entry.emitter.on("state", onState);
        if (onEnd) entry.emitter.on("ended", onEnd);
        return () => {
            entry.emitter.off("state", onState);
            if (onEnd) entry.emitter.off("ended", onEnd);
        };
    }
}

// Singleton qui survit au hot-reload en dev (cf. pattern src/lib/mongodb.ts).
const globalForLive = globalThis as unknown as {
    _liveRegistry?: LiveSessionRegistry;
};
export const liveRegistry =
    globalForLive._liveRegistry ?? new LiveSessionRegistry();
if (process.env.NODE_ENV !== "production") {
    globalForLive._liveRegistry = liveRegistry;
}
