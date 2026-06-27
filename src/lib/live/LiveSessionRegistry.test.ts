/// <reference types="bun-types" />
import { expect, test, beforeEach } from "bun:test";
import { LiveSessionRegistry } from "@/lib/live/LiveSessionRegistry";

const SID = "js/evenements";
let reg: LiveSessionRegistry;

beforeEach(() => {
    reg = new LiveSessionRegistry();
});

test("start crée une session à la position 0", () => {
    const s = reg.start(SID, "M. Khr");
    expect(s.currentSlide).toBe(0);
    expect(s.currentStep).toBe(0);
    expect(s.presenterName).toBe("M. Khr");
    expect(reg.get(SID)).toBeTruthy();
});

test("setPosition met à jour et notifie les abonnés", () => {
    reg.start(SID, "M. Khr");
    let received = 0;
    const unsub = reg.subscribe(SID, (st) => { received = st.currentSlide; });
    reg.setPosition(SID, { slide: 3, step: 1 });
    expect(received).toBe(3);
    expect(reg.get(SID)?.currentStep).toBe(1);
    unsub();
});

test("stop supprime la session et notifie la fin", () => {
    reg.start(SID, "M. Khr");
    let ended = false;
    const unsub = reg.subscribe(SID, () => {}, () => { ended = true; });
    reg.stop(SID);
    expect(reg.get(SID)).toBeFalsy();
    expect(ended).toBe(true);
    unsub();
});

test("setPosition sur session absente est ignoré", () => {
    expect(() => reg.setPosition(SID, { slide: 1, step: 0 })).not.toThrow();
    expect(reg.get(SID)).toBeFalsy();
});

test("subscribe avant start reçoit les événements du start() et setPosition()", () => {
    let received = -1; // -1 = pas encore reçu
    const unsub = reg.subscribe(SID, (st) => { received = st.currentSlide; });
    expect(received).toBe(-1); // pas encore de session
    reg.start(SID, "M. Khr");
    expect(received).toBe(0); // "state" émis par start()
    reg.setPosition(SID, { slide: 4, step: 2 });
    expect(received).toBe(4);
    unsub();
});

test("subscribe avant start reçoit aussi le ended après stop()", () => {
    let ended = false;
    const unsub = reg.subscribe(SID, () => {}, () => { ended = true; });
    reg.start(SID, "M. Khr");
    reg.stop(SID);
    expect(ended).toBe(true);
    unsub();
});

test("subscribe avant start puis nouveau start() sans reconnecter", () => {
    const received: number[] = [];
    const unsub = reg.subscribe(SID, (st) => { received.push(st.currentSlide); });
    reg.start(SID, "Prof A");
    reg.stop(SID);
    reg.start(SID, "Prof B"); // second cycle, même emitter
    expect(received).toEqual([0, 0]); // deux start() → deux "state" à slide 0
    unsub();
});
