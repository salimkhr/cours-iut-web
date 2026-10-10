import type {QuizAudience, QuizPublicState} from "@/lib/quiz/quizPublicState";

type StateListener = (state: QuizPublicState) => void;

interface Subscriber {
    audience: QuizAudience;
    onState: StateListener;
}

/**
 * Canaux SSE par session. Contrairement à `LiveSessionRegistry`, la diffusion
 * construit un état différent pour chaque abonné (projection ou étudiant).
 */
export class LiveQuizRegistry {
    private subscribers = new Map<string, Set<Subscriber>>();

    subscribe(sessionId: string, audience: QuizAudience, onState: StateListener): () => void {
        const sub: Subscriber = {audience, onState};
        let set = this.subscribers.get(sessionId);
        if (!set) {
            set = new Set();
            this.subscribers.set(sessionId, set);
        }
        set.add(sub);
        return () => {
            const current = this.subscribers.get(sessionId);
            current?.delete(sub);
            if (current && current.size === 0) this.subscribers.delete(sessionId);
        };
    }

    publish(sessionId: string, build: (audience: QuizAudience) => QuizPublicState): void {
        const set = this.subscribers.get(sessionId);
        if (!set) return;
        for (const sub of [...set]) {
            try {
                sub.onState(build(sub.audience));
            } catch {
                // Un abonné défaillant (flux fermé) ne doit pas bloquer les autres.
                set.delete(sub);
            }
        }
    }

    subscriberCount(sessionId: string): number {
        return this.subscribers.get(sessionId)?.size ?? 0;
    }
}
