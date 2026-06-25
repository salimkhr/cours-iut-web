/// <reference types="bun-types" />
import { expect, test, beforeEach } from "bun:test";
import { liveRegistry } from "@/lib/live/LiveSessionRegistry";

const SID = "js/evenements";

beforeEach(() => liveRegistry.stop(SID));

test("start crée une session à la position 0", () => {
    const s = liveRegistry.start(SID, "M. Khr");
    expect(s.currentSlide).toBe(0);
    expect(s.currentStep).toBe(0);
    expect(s.presenterName).toBe("M. Khr");
    expect(liveRegistry.get(SID)).toBeTruthy();
});

test("setPosition met à jour et notifie les abonnés", () => {
    liveRegistry.start(SID, "M. Khr");
    let received = 0;
    const unsub = liveRegistry.subscribe(SID, (st) => { received = st.currentSlide; });
    liveRegistry.setPosition(SID, { slide: 3, step: 1 });
    expect(received).toBe(3);
    expect(liveRegistry.get(SID)?.currentStep).toBe(1);
    unsub();
});

test("stop supprime la session et notifie la fin", () => {
    liveRegistry.start(SID, "M. Khr");
    let ended = false;
    liveRegistry.subscribe(SID, () => {}, () => { ended = true; });
    liveRegistry.stop(SID);
    expect(liveRegistry.get(SID)).toBeFalsy();
    expect(ended).toBe(true);
});

test("setPosition sur session absente est ignoré", () => {
    expect(() => liveRegistry.setPosition(SID, { slide: 1, step: 0 })).not.toThrow();
    expect(liveRegistry.get(SID)).toBeFalsy();
});
