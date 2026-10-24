/**
 * Limiteur d'échecs en mémoire, sur fenêtre glissante.
 *
 * Suffit pour une instance unique (sortie `standalone`) : les compteurs ne sont pas partagés
 * entre processus et repartent de zéro au redémarrage.
 */
export class AttemptLimiter {
    private readonly failures = new Map<string, number[]>();

    constructor(
        private readonly maxFailures: number,
        private readonly windowMs: number,
        private readonly clock: () => number = () => Date.now(),
    ) {}

    private recent(key: string): number[] {
        const since = this.clock() - this.windowMs;
        const kept = (this.failures.get(key) ?? []).filter((t) => t > since);
        if (kept.length === 0) this.failures.delete(key);
        else this.failures.set(key, kept);
        return kept;
    }

    isBlocked(key: string): boolean {
        return this.recent(key).length >= this.maxFailures;
    }

    /** Secondes avant qu'un essai soit de nouveau permis (0 si non bloqué). */
    retryAfterSeconds(key: string): number {
        const kept = this.recent(key);
        if (kept.length < this.maxFailures) return 0;
        return Math.ceil((kept[kept.length - this.maxFailures] + this.windowMs - this.clock()) / 1000);
    }

    recordFailure(key: string): void {
        this.failures.set(key, [...this.recent(key), this.clock()]);
    }

    reset(key: string): void {
        this.failures.delete(key);
    }
}
