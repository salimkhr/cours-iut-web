import { expect, test } from "bun:test";
import { formatStopwatch } from "@/lib/live/stopwatch";

test("mm:ss sous une heure", () => {
    expect(formatStopwatch(0)).toBe("00:00");
    expect(formatStopwatch(65_000)).toBe("01:05");
    expect(formatStopwatch(599_000)).toBe("09:59");
});

test("h:mm:ss au-delà d'une heure", () => {
    expect(formatStopwatch(3_661_000)).toBe("1:01:01");
});

test("négatif borné à zéro", () => {
    expect(formatStopwatch(-5000)).toBe("00:00");
});
