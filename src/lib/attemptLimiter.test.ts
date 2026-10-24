import {describe, expect, test} from "bun:test";
import {AttemptLimiter} from "@/lib/attemptLimiter";

describe("AttemptLimiter", () => {
    test("bloque après le nombre d'échecs, par clé", () => {
        let now = 0;
        const limiter = new AttemptLimiter(3, 60_000, () => now);
        for (let i = 0; i < 3; i++) {
            expect(limiter.isBlocked("u1")).toBe(false);
            limiter.recordFailure("u1");
            now += 1_000;
        }
        expect(limiter.isBlocked("u1")).toBe(true);
        expect(limiter.isBlocked("u2")).toBe(false);
    });

    test("fenêtre glissante : le plus ancien échec expire en premier", () => {
        let now = 0;
        const limiter = new AttemptLimiter(2, 60_000, () => now);
        limiter.recordFailure("u1");
        now = 30_000;
        limiter.recordFailure("u1");
        expect(limiter.retryAfterSeconds("u1")).toBe(30);
        now = 60_001;
        expect(limiter.isBlocked("u1")).toBe(false);
        expect(limiter.retryAfterSeconds("u1")).toBe(0);
    });

    test("une réussite remet le compteur à zéro", () => {
        const limiter = new AttemptLimiter(2, 60_000, () => 0);
        limiter.recordFailure("u1");
        limiter.recordFailure("u1");
        limiter.reset("u1");
        expect(limiter.isBlocked("u1")).toBe(false);
    });
});
