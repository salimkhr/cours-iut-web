import { expect, test } from "bun:test";
import { computeDrift } from "@/lib/live/drift";

test("synchronisé", () => {
    expect(computeDrift(4, 4)).toEqual({ delta: 0, direction: "synced" });
});

test("en avance sur le présentateur", () => {
    expect(computeDrift(6, 4)).toEqual({ delta: 2, direction: "ahead" });
});

test("en retard", () => {
    expect(computeDrift(2, 5)).toEqual({ delta: 3, direction: "behind" });
});
