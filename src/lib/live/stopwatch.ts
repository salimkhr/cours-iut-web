/** Formate une durée écoulée (ms) en mm:ss, ou h:mm:ss au-delà d'une heure. */
export function formatStopwatch(elapsedMs: number): string {
    const total = Math.max(0, Math.floor(elapsedMs / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
