import { EventEmitter } from "node:events";
import type { LiveSessionState, LiveCommand } from "@/lib/live/liveTypes";

type StateListener = (state: LiveSessionState) => void;
type EndListener = () => void;

class LiveSessionRegistry {
    // États des sessions actives (absent = pas de session en cours)
    private states = new Map<string, LiveSessionState>();
    // Emitters persistants par slot — créés dès le premier subscribe, survivent aux stop/start
    private emitters = new Map<string, EventEmitter>();

    private getOrCreateEmitter(sessionId: string): EventEmitter {
        let emitter = this.emitters.get(sessionId);
        if (!emitter) {
            emitter = new EventEmitter();
            emitter.setMaxListeners(0); // illimité : N abonnés SSE par session
            this.emitters.set(sessionId, emitter);
        }
        return emitter;
    }

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
        this.states.set(sessionId, state);
        this.getOrCreateEmitter(sessionId).emit("state", state);
        return state;
    }

    stop(sessionId: string): void {
        if (!this.states.has(sessionId)) return;
        this.states.delete(sessionId);
        // Les abonnés SSE restent connectés et reçoivent "ended" ;
        // ils se re-synchroniseront automatiquement au prochain start() sans reconnecter.
        this.getOrCreateEmitter(sessionId).emit("ended");
    }

    setPosition(sessionId: string, cmd: LiveCommand): void {
        const state = this.states.get(sessionId);
        if (!state) return;
        const updated: LiveSessionState = {
            ...state,
            currentSlide: cmd.slide,
            currentStep: cmd.step,
            updatedAt: Date.now(),
        };
        this.states.set(sessionId, updated);
        this.getOrCreateEmitter(sessionId).emit("state", updated);
    }

    get(sessionId: string): LiveSessionState | null {
        return this.states.get(sessionId) ?? null;
    }

    subscribe(
        sessionId: string,
        onState: StateListener,
        onEnd?: EndListener,
    ): () => void {
        // Crée l'emitter si absent — le subscribe fonctionne même avant le start().
        const emitter = this.getOrCreateEmitter(sessionId);
        emitter.on("state", onState);
        if (onEnd) emitter.on("ended", onEnd);
        return () => {
            emitter.off("state", onState);
            if (onEnd) emitter.off("ended", onEnd);
        };
    }
}

export { LiveSessionRegistry };

// Singleton qui survit au hot-reload en dev (cf. pattern src/lib/mongodb.ts).
const globalForLive = globalThis as unknown as {
    _liveRegistry?: LiveSessionRegistry;
};
export const liveRegistry =
    globalForLive._liveRegistry ?? new LiveSessionRegistry();
if (process.env.NODE_ENV !== "production") {
    globalForLive._liveRegistry = liveRegistry;
}
