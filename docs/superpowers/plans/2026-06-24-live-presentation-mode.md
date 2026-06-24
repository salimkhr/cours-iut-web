# Mode Présentation en Direct — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à un admin de piloter les slides en direct ; les autres écrans (élèves, projection) suivent en temps réel via SSE, avec une vue présentateur sur téléphone (chrono + notes + aperçu + contrôles).

**Architecture :** Un `LiveSessionRegistry` en mémoire (singleton `globalThis`) garde l'état `{ currentSlide, currentStep, presenterName, startedAt }` par section. Les commandes (position absolue) arrivent par `POST` (admin only) ; les écrans s'abonnent par SSE (`GET .../stream`). Côté client, `useLiveSession` masque le transport ; `SlidesScreen` se synchronise (followers : suivi auto + dérive/resync ; laptop admin : émission de commandes). Une page `/present` (admin) sert de seconde télécommande.

**Tech Stack :** Next 16 route handlers, `ReadableStream` + `text/event-stream`, `node:events` (zéro dépendance), `EventSource` client, React 19, Zustand absent ici (état local + contexte), Tailwind v4, `lucide-react`. Tests purs via `bun test`.

**Référence spec :** `docs/superpowers/specs/2026-06-24-live-presentation-mode-design.md`

---

## Conventions de vérification

- **Unités pures** (`formatStopwatch`, `computeDrift`, registry) → `bun test <fichier>`.
- **Routes API** → test manuel `curl` + smoke navigateur (deux onglets : présentateur + follower).
- **Composants React / hooks** → `bun run lint` + `bun run build` + smoke test deux écrans.
- Indentation 4 espaces, alias `@/*`, pas d'`any`, apostrophes JSX échappées. Commit par tâche.

---

## Écarts assumés vs spec (raffinements d'implémentation)

1. **Commandes en position absolue** `{ slide, step }` (pas `action: next/prev`) : le serveur ignore `slideSteps` (rendu client), donc le présentateur résout next/prev localement et envoie la position cible. Serveur agnostique du contenu.
2. **Pas de période de grâce** : la session vit jusqu'à `/stop` explicite ; une coupure SSE du présentateur n'arrête pas la session (il se reconnecte). La notion de grâce du spec §9 devient sans objet.
3. **Vue `/present` riche = slides en base (DB)** : l'aperçu slide + notes nécessite des `Block[]`. Pour une section encore en source fichier (`.tsx` legacy), `/present` tombe sur une **télécommande minimale** (chrono + ◀ ▶, sans aperçu ni notes). La synchro elle-même (bandeau, followers, laptop) reste source-agnostique.

---

## File Structure

**Nouveaux fichiers**

| Fichier | Responsabilité |
|---------|----------------|
| `src/lib/live/LiveSessionRegistry.ts` | Registry in-memory (état + pub/sub) |
| `src/lib/live/LiveSessionRegistry.test.ts` | Tests `bun test` du registry |
| `src/lib/live/liveTypes.ts` | Types partagés (`LiveSessionState`, `LiveCommand`, `LiveConnection`) |
| `src/lib/live/stopwatch.ts` | Pure : `formatStopwatch(ms)` |
| `src/lib/live/stopwatch.test.ts` | Tests |
| `src/lib/live/drift.ts` | Pure : `computeDrift(local, presenter)` |
| `src/lib/live/drift.test.ts` | Tests |
| `src/app/api/live/[moduleSlug]/[sectionSlug]/route.ts` | GET snapshot |
| `src/app/api/live/[moduleSlug]/[sectionSlug]/stream/route.ts` | GET SSE |
| `src/app/api/live/[moduleSlug]/[sectionSlug]/start/route.ts` | POST start (admin) |
| `src/app/api/live/[moduleSlug]/[sectionSlug]/stop/route.ts` | POST stop (admin) |
| `src/app/api/live/[moduleSlug]/[sectionSlug]/command/route.ts` | POST command (admin) |
| `src/components/Slides/hooks/useLiveSession.ts` | Abstraction transport client |
| `src/components/Slides/hooks/useFollowerSync.ts` | Suivi auto + dérive/pause (followers) |
| `src/components/Slides/LiveBanner.tsx` | Bandeau « En direct » + connexion + drift/resync |
| `src/components/Slides/ConnectionDot.tsx` | Point SVG 3 états (réutilisable) |
| `src/app/[moduleSlug]/[sectionSlug]/present/page.tsx` | Page vue présentateur (admin) |
| `src/components/Slides/PresenterView.tsx` | Vue présentateur (chrono, aperçu, notes, tap zones) |
| `src/components/Slides/hooks/useStopwatch.ts` | Tick du chrono (depuis `startedAt`) |
| `src/components/Slides/hooks/useWakeLock.ts` | Wake Lock screen |

**Fichiers modifiés**

| Fichier | Changement |
|---------|------------|
| `src/components/Slides/hooks/useSlidesNavigation.ts` | + `syncTo(slide, step)` |
| `src/components/Slides/context/SlidesContext.tsx` | + champs live (`live`, `isPresenter`) |
| `src/components/Slides/SlidesScreen.tsx` | Branche `useLiveSession` + `useFollowerSync` + `LiveBanner` |
| `src/components/Slides/SlidesActions.tsx` | + bouton « Présenter en direct » (admin) |

---

## Task 1 : Types + Registry in-memory

**Files:**
- Create: `src/lib/live/liveTypes.ts`, `src/lib/live/LiveSessionRegistry.ts`
- Test: `src/lib/live/LiveSessionRegistry.test.ts`

- [ ] **Step 1 : Types partagés**

`src/lib/live/liveTypes.ts` :

```ts
export interface LiveSessionState {
    sessionId: string;        // `${moduleSlug}/${sectionSlug}`
    presenterName: string;
    currentSlide: number;
    currentStep: number;
    startedAt: number;        // epoch ms
    updatedAt: number;
}

export interface LiveCommand {
    slide: number;
    step: number;
}

export type LiveConnection = "connected" | "reconnecting" | "offline";
```

- [ ] **Step 2 : Écrire le test du registry**

`src/lib/live/LiveSessionRegistry.test.ts` :

```ts
import { expect, test, beforeEach } from "bun:test";
import { liveRegistry } from "@/lib/live/LiveSessionRegistry";

const SID = "js/evenements";

beforeEach(() => liveRegistry.stop(SID));

test("start crée une session à la position 0", () => {
    const s = liveRegistry.start(SID, "M. Khr");
    expect(s.currentSlide).toBe(0);
    expect(s.currentStep).toBe(0);
    expect(s.presenterName).toBe("M. Khr");
    expect(liveRegistry.get(SID)).not.toBeNull();
});

test("setPosition met à jour et notifie les abonnés", () => {
    liveRegistry.start(SID, "M. Khr");
    let received: number | null = null;
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
    expect(liveRegistry.get(SID)).toBeNull();
    expect(ended).toBe(true);
});

test("setPosition sur session absente est ignoré", () => {
    expect(() => liveRegistry.setPosition(SID, { slide: 1, step: 0 })).not.toThrow();
    expect(liveRegistry.get(SID)).toBeNull();
});
```

- [ ] **Step 3 : Lancer le test, vérifier l'échec**

Run: `bun test src/lib/live/LiveSessionRegistry.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 4 : Implémenter le registry**

`src/lib/live/LiveSessionRegistry.ts` :

```ts
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
            sessionId, presenterName,
            currentSlide: 0, currentStep: 0,
            startedAt: now, updatedAt: now,
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

    subscribe(sessionId: string, onState: StateListener, onEnd?: EndListener): () => void {
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
const globalForLive = globalThis as unknown as { _liveRegistry?: LiveSessionRegistry };
export const liveRegistry = globalForLive._liveRegistry ?? new LiveSessionRegistry();
if (process.env.NODE_ENV !== "production") globalForLive._liveRegistry = liveRegistry;
```

- [ ] **Step 5 : Test vert + commit**

```bash
bun test src/lib/live/LiveSessionRegistry.test.ts
bun run lint
git add src/lib/live/liveTypes.ts src/lib/live/LiveSessionRegistry.ts src/lib/live/LiveSessionRegistry.test.ts
git commit -m "feat(live): LiveSessionRegistry in-memory pub/sub + types"
```

---

## Task 2 : Helpers purs (chrono + dérive)

**Files:**
- Create: `src/lib/live/stopwatch.ts`, `src/lib/live/drift.ts`
- Test: `src/lib/live/stopwatch.test.ts`, `src/lib/live/drift.test.ts`

- [ ] **Step 1 : Tests**

`src/lib/live/stopwatch.test.ts` :

```ts
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
```

`src/lib/live/drift.test.ts` :

```ts
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
```

- [ ] **Step 2 : Vérifier l'échec**

Run: `bun test src/lib/live/stopwatch.test.ts src/lib/live/drift.test.ts`
Expected: FAIL — modules introuvables.

- [ ] **Step 3 : Implémenter**

`src/lib/live/stopwatch.ts` :

```ts
/** Formate une durée écoulée (ms) en mm:ss, ou h:mm:ss au-delà d'une heure. */
export function formatStopwatch(elapsedMs: number): string {
    const total = Math.max(0, Math.floor(elapsedMs / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
```

`src/lib/live/drift.ts` :

```ts
export type DriftDirection = "synced" | "ahead" | "behind";

export interface Drift {
    delta: number;            // valeur absolue de l'écart
    direction: DriftDirection;
}

/** Écart entre la position locale d'un follower et celle du présentateur. */
export function computeDrift(localSlide: number, presenterSlide: number): Drift {
    const diff = localSlide - presenterSlide;
    if (diff === 0) return { delta: 0, direction: "synced" };
    return { delta: Math.abs(diff), direction: diff > 0 ? "ahead" : "behind" };
}
```

- [ ] **Step 4 : Vert + commit**

```bash
bun test src/lib/live/stopwatch.test.ts src/lib/live/drift.test.ts
git add src/lib/live/stopwatch.ts src/lib/live/stopwatch.test.ts src/lib/live/drift.ts src/lib/live/drift.test.ts
git commit -m "feat(live): formatStopwatch + computeDrift pure helpers"
```

---

## Task 3 : Routes API — snapshot + SSE

**Files:**
- Create: `src/app/api/live/[moduleSlug]/[sectionSlug]/route.ts`
- Create: `src/app/api/live/[moduleSlug]/[sectionSlug]/stream/route.ts`

- [ ] **Step 1 : Route snapshot (GET index)**

`src/app/api/live/[moduleSlug]/[sectionSlug]/route.ts` :

```ts
import { NextResponse } from "next/server";
import { liveRegistry } from "@/lib/live/LiveSessionRegistry";

type Ctx = { params: Promise<{ moduleSlug: string; sectionSlug: string }> };

export async function GET(_req: Request, { params }: Ctx) {
    const { moduleSlug, sectionSlug } = await params;
    const sessionId = `${moduleSlug}/${sectionSlug}`;
    const state = liveRegistry.get(sessionId);
    return NextResponse.json({ live: state !== null, state });
}
```

- [ ] **Step 2 : Route SSE (GET stream)**

`src/app/api/live/[moduleSlug]/[sectionSlug]/stream/route.ts` :

```ts
import { liveRegistry } from "@/lib/live/LiveSessionRegistry";
import type { LiveSessionState } from "@/lib/live/liveTypes";

type Ctx = { params: Promise<{ moduleSlug: string; sectionSlug: string }> };

// SSE : flux long-vivant, jamais mis en cache, rendu dynamique.
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: Ctx) {
    const { moduleSlug, sectionSlug } = await params;
    const sessionId = `${moduleSlug}/${sectionSlug}`;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            const send = (event: string, data: unknown) => {
                controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
            };

            // État initial (ou "no session")
            const initial = liveRegistry.get(sessionId);
            send("state", { live: initial !== null, state: initial });

            const onState = (st: LiveSessionState) => send("state", { live: true, state: st });
            const onEnd = () => send("ended", { live: false, state: null });
            const unsub = liveRegistry.subscribe(sessionId, onState, onEnd);

            // Heartbeat anti-timeout proxy
            const ping = setInterval(() => controller.enqueue(encoder.encode(": ping\n\n")), 20_000);

            const close = () => {
                clearInterval(ping);
                unsub();
                try { controller.close(); } catch { /* déjà fermé */ }
            };
            req.signal.addEventListener("abort", close);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    });
}
```

> Note : si la session est créée **après** l'abonnement d'un follower, `subscribe` au moment T retourne un no-op (pas d'emitter). Pour couvrir ce cas, le client `useLiveSession` rouvre le flux à intervalle de secours OU le `start` recrée l'emitter et les followers déjà connectés ne le voient pas. **Décision :** le client refait un `GET` snapshot périodique léger (toutes les ~10 s) tant que `live === false` pour détecter un démarrage (cf. Task 5). Quand `live` devient vrai, il rouvre le stream. Simple et robuste.

- [ ] **Step 3 : Test manuel**

```bash
bun dev
# Terminal 2 :
curl -N http://localhost:3000/api/live/js/evenements/stream
# Attendu : "event: state\ndata: {\"live\":false,...}" puis des ": ping" toutes les 20s.
```

- [ ] **Step 4 : Commit**

```bash
bun run lint
git add "src/app/api/live"
git commit -m "feat(live): routes snapshot + SSE stream"
```

---

## Task 4 : Routes API — start / stop / command (admin)

**Files:**
- Create: `start/route.ts`, `stop/route.ts`, `command/route.ts` sous `src/app/api/live/[moduleSlug]/[sectionSlug]/`

- [ ] **Step 1 : Helper de garde admin (inline dans chaque route)**

Pattern réutilisé (le proxy garantit déjà un cookie ; on vérifie le rôle) :

```ts
import { getServerSession } from "@/lib/auth";
// ...
const session = await getServerSession();
if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

- [ ] **Step 2 : start**

`.../start/route.ts` :

```ts
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { liveRegistry } from "@/lib/live/LiveSessionRegistry";

type Ctx = { params: Promise<{ moduleSlug: string; sectionSlug: string }> };

export async function POST(_req: Request, { params }: Ctx) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { moduleSlug, sectionSlug } = await params;
    const state = liveRegistry.start(`${moduleSlug}/${sectionSlug}`, session.user.name ?? "Présentateur");
    return NextResponse.json({ live: true, state });
}
```

- [ ] **Step 3 : stop**

`.../stop/route.ts` :

```ts
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { liveRegistry } from "@/lib/live/LiveSessionRegistry";

type Ctx = { params: Promise<{ moduleSlug: string; sectionSlug: string }> };

export async function POST(_req: Request, { params }: Ctx) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { moduleSlug, sectionSlug } = await params;
    liveRegistry.stop(`${moduleSlug}/${sectionSlug}`);
    return NextResponse.json({ live: false });
}
```

- [ ] **Step 4 : command (position absolue)**

`.../command/route.ts` :

```ts
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { liveRegistry } from "@/lib/live/LiveSessionRegistry";

type Ctx = { params: Promise<{ moduleSlug: string; sectionSlug: string }> };

export async function POST(req: Request, { params }: Ctx) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { moduleSlug, sectionSlug } = await params;
    const body = await req.json().catch(() => null) as { slide?: number; step?: number } | null;
    if (!body || typeof body.slide !== "number" || typeof body.step !== "number") {
        return NextResponse.json({ error: "Position invalide" }, { status: 422 });
    }
    liveRegistry.setPosition(`${moduleSlug}/${sectionSlug}`, { slide: body.slide, step: body.step });
    return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5 : Test manuel (deux terminaux)**

```bash
# Terminal SSE :
curl -N http://localhost:3000/api/live/js/evenements/stream
# Terminal commandes (avec un cookie admin valide via navigateur, ou tester depuis l'UI en Task 6) :
# POST start puis command → le terminal SSE doit recevoir les events "state".
```

- [ ] **Step 6 : Commit**

```bash
bun run lint
git add "src/app/api/live"
git commit -m "feat(live): routes start/stop/command (admin-gated, position absolue)"
```

---

## Task 5 : useLiveSession (abstraction transport)

**Files:**
- Create: `src/components/Slides/hooks/useLiveSession.ts`

- [ ] **Step 1 : Implémenter le hook**

`src/components/Slides/hooks/useLiveSession.ts` :

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveSessionState, LiveConnection } from "@/lib/live/liveTypes";

interface UseLiveSession {
    isLive: boolean;
    presenterName: string | null;
    presenter: { slide: number; step: number } | null;
    startedAt: number | null;
    connection: LiveConnection;
    sendCommand: (pos: { slide: number; step: number }) => void;
    start: () => Promise<void>;
    stop: () => Promise<void>;
}

export function useLiveSession(moduleSlug: string, sectionSlug: string): UseLiveSession {
    const base = `/api/live/${moduleSlug}/${sectionSlug}`;
    const [state, setState] = useState<LiveSessionState | null>(null);
    const [connection, setConnection] = useState<LiveConnection>("offline");
    const esRef = useRef<EventSource | null>(null);

    // Flux SSE (reconnexion native d'EventSource)
    useEffect(() => {
        const es = new EventSource(`${base}/stream`);
        esRef.current = es;

        es.onopen = () => setConnection("connected");
        es.onerror = () => setConnection((c) => (c === "connected" ? "reconnecting" : "offline"));
        es.addEventListener("state", (e) => {
            const data = JSON.parse((e as MessageEvent).data) as { live: boolean; state: LiveSessionState | null };
            setState(data.live ? data.state : null);
        });
        es.addEventListener("ended", () => setState(null));

        return () => { es.close(); esRef.current = null; };
    }, [base]);

    const sendCommand = useCallback((pos: { slide: number; step: number }) => {
        void fetch(`${base}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pos),
        });
    }, [base]);

    const start = useCallback(async () => { await fetch(`${base}/start`, { method: "POST" }); }, [base]);
    const stop = useCallback(async () => { await fetch(`${base}/stop`, { method: "POST" }); }, [base]);

    return {
        isLive: state !== null,
        presenterName: state?.presenterName ?? null,
        presenter: state ? { slide: state.currentSlide, step: state.currentStep } : null,
        startedAt: state?.startedAt ?? null,
        connection,
        sendCommand, start, stop,
    };
}
```

- [ ] **Step 2 : Lint + commit**

```bash
bun run lint
git add src/components/Slides/hooks/useLiveSession.ts
git commit -m "feat(live): useLiveSession hook (SSE + commands)"
```

---

## Task 6 : Étendre useSlidesNavigation + SlidesContext

**Files:**
- Modify: `src/components/Slides/hooks/useSlidesNavigation.ts`
- Modify: `src/components/Slides/context/SlidesContext.tsx`

- [ ] **Step 1 : Ajouter `syncTo` à la navigation**

Dans `useSlidesNavigation.ts`, ajouter à l'interface `SlidesNavigation` :

```ts
    syncTo: (slide: number, step: number) => void;
```

Dans le corps du hook (avant le `return`) :

```ts
    const syncTo = useCallback((slide: number, step: number) => {
        setCurrentSlide(Math.max(0, Math.min(slide, slidesCount - 1)));
        setCurrentStep(Math.max(0, step));
    }, [slidesCount]);
```

Et l'exposer dans l'objet retourné : ajouter `syncTo,`.

- [ ] **Step 2 : Étendre SlidesContext**

Dans `SlidesContext.tsx`, ajouter au type (section UI) :

```ts
    // Live (optionnel : absent hors mode présentation)
    live?: {
        isLive: boolean;
        isPresenter: boolean;
        presenterName: string | null;
        connection: import("@/lib/live/liveTypes").LiveConnection;
        drift: import("@/lib/live/drift").Drift;
        paused: boolean;
        resync: () => void;
    };
```

> Champ optionnel → aucune régression pour les consommateurs existants (`SlidePreviewList`, builder) qui ne le fournissent pas.

- [ ] **Step 3 : Lint + commit**

```bash
bun run lint
git add src/components/Slides/hooks/useSlidesNavigation.ts src/components/Slides/context/SlidesContext.tsx
git commit -m "feat(live): syncTo navigation + champs live dans SlidesContext"
```

---

## Task 7 : useFollowerSync (suivi auto + dérive/pause)

**Files:**
- Create: `src/components/Slides/hooks/useFollowerSync.ts`

- [ ] **Step 1 : Implémenter**

`src/components/Slides/hooks/useFollowerSync.ts` :

```ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { computeDrift, type Drift } from "@/lib/live/drift";

interface FollowerSyncArgs {
    isLive: boolean;
    isPresenter: boolean;
    presenter: { slide: number; step: number } | null;
    localSlide: number;
    syncTo: (slide: number, step: number) => void;
}

interface FollowerSync {
    paused: boolean;          // l'élève explore seul
    drift: Drift;
    resync: () => void;       // réaligne sur le présentateur
    notifyLocalNav: () => void; // à appeler quand l'élève navigue lui-même
}

/**
 * Couche de suivi pour un follower : applique la position du présentateur tant
 * que l'élève ne s'en écarte pas. Dès qu'il navigue, met en pause l'auto-suivi
 * et expose la dérive + un resync.
 */
export function useFollowerSync({
    isLive, isPresenter, presenter, localSlide, syncTo,
}: FollowerSyncArgs): FollowerSync {
    const [paused, setPaused] = useState(false);
    const applyingRef = useRef(false);

    const drift: Drift = isLive && presenter
        ? computeDrift(localSlide, presenter.slide)
        : { delta: 0, direction: "synced" };

    // Applique la position du présentateur (sauf si présentateur soi-même ou en pause)
    useEffect(() => {
        if (!isLive || isPresenter || paused || !presenter) return;
        applyingRef.current = true;
        syncTo(presenter.slide, presenter.step);
        // libère le flag après application
        const id = requestAnimationFrame(() => { applyingRef.current = false; });
        return () => cancelAnimationFrame(id);
    }, [isLive, isPresenter, paused, presenter, syncTo]);

    const notifyLocalNav = useCallback(() => {
        if (applyingRef.current) return; // changement venant du suivi, pas de l'élève
        if (isLive && !isPresenter) setPaused(true);
    }, [isLive, isPresenter]);

    const resync = useCallback(() => {
        if (presenter) syncTo(presenter.slide, presenter.step);
        setPaused(false);
    }, [presenter, syncTo]);

    // Quand la session se termine, on sort de pause
    useEffect(() => { if (!isLive) setPaused(false); }, [isLive]);

    return { paused, drift, resync, notifyLocalNav };
}
```

- [ ] **Step 2 : Lint + commit**

```bash
bun run lint
git add src/components/Slides/hooks/useFollowerSync.ts
git commit -m "feat(live): useFollowerSync (auto-follow + drift + pause)"
```

---

## Task 8 : ConnectionDot + LiveBanner

**Files:**
- Create: `src/components/Slides/ConnectionDot.tsx`, `src/components/Slides/LiveBanner.tsx`

- [ ] **Step 1 : ConnectionDot**

`src/components/Slides/ConnectionDot.tsx` :

```tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { LiveConnection } from "@/lib/live/liveTypes";

const MAP: Record<LiveConnection, { color: string; label: string }> = {
    connected: { color: "bg-green-500", label: "Connecté" },
    reconnecting: { color: "bg-amber-500", label: "Reconnexion…" },
    offline: { color: "bg-red-500", label: "Hors-ligne" },
};

/** Point d'état de connexion : couleur + pulse + texte (jamais la couleur seule). */
export function ConnectionDot({ connection }: { connection: LiveConnection }) {
    const { color, label } = MAP[connection];
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className="relative inline-flex size-2.5">
                {connection === "connected" && (
                    <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping", color)} />
                )}
                <span className={cn("relative inline-flex size-2.5 rounded-full", color)} />
            </span>
            <span className="sr-only">{label}</span>
        </span>
    );
}
```

- [ ] **Step 2 : LiveBanner**

`src/components/Slides/LiveBanner.tsx` :

```tsx
"use client";

import React from "react";
import { Radio } from "lucide-react";
import { ConnectionDot } from "@/components/Slides/ConnectionDot";
import type { LiveConnection } from "@/lib/live/liveTypes";
import type { Drift } from "@/lib/live/drift";

interface LiveBannerProps {
    presenterName: string | null;
    connection: LiveConnection;
    paused: boolean;
    drift: Drift;
    onResync: () => void;
}

export function LiveBanner({ presenterName, connection, paused, drift, onResync }: LiveBannerProps) {
    const driftLabel =
        drift.direction === "ahead" ? `${drift.delta} slide${drift.delta > 1 ? "s" : ""} d'avance`
        : drift.direction === "behind" ? `${drift.delta} slide${drift.delta > 1 ? "s" : ""} de retard`
        : null;

    return (
        <div
            className="absolute top-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-background/90 px-4 py-1.5 text-sm shadow-md backdrop-blur"
            role="status"
        >
            <span className="inline-flex items-center gap-1.5 font-medium">
                <Radio className="size-4 text-red-500" />
                En direct
            </span>
            <ConnectionDot connection={connection} />
            {presenterName && <span className="text-muted-foreground">vous suivez {presenterName}</span>}

            {paused && driftLabel && (
                <>
                    <span className="text-amber-600">· {driftLabel}</span>
                    <button
                        type="button"
                        onClick={onResync}
                        className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                    >
                        Resync
                    </button>
                </>
            )}
        </div>
    );
}
```

- [ ] **Step 3 : Lint + commit**

```bash
bun run lint
git add src/components/Slides/ConnectionDot.tsx src/components/Slides/LiveBanner.tsx
git commit -m "feat(live): ConnectionDot + LiveBanner (drift/resync)"
```

---

## Task 9 : Intégrer le live dans SlidesScreen + bouton présentateur

Branche tout : `useLiveSession`, `useFollowerSync`, le bandeau, l'émission de commandes (laptop), l'annonce a11y. Nécessite de connaître `moduleSlug/sectionSlug` et `isAdmin` → on les passe en props à `SlidesScreen`.

**Files:**
- Modify: `src/components/Slides/SlidesScreen.tsx`
- Modify: `src/components/Slides/SlidesActions.tsx`
- Modify: `src/components/Slides/SlideBlocksRenderer.tsx` (transmettre les nouvelles props)

- [ ] **Step 1 : Élargir les props de SlidesScreen**

Dans `SlidesScreen.tsx`, étendre l'interface :

```ts
interface SlidesScreenProps {
    children: React.ReactNode;
    module?: Module;
    section?: Section;
    moduleSlug?: string;
    sectionSlug?: string;
    isAdmin?: boolean;
}
```

- [ ] **Step 2 : Brancher les hooks live**

Après `const navigation = useSlidesNavigation(slides.length);` :

```tsx
    const live = useLiveSession(moduleSlug ?? "", sectionSlug ?? "");
    const liveEnabled = Boolean(moduleSlug && sectionSlug);

    // Le laptop devient "présentateur" quand il a démarré la session (admin).
    const [isPresenting, setIsPresenting] = useState(false);
    const isPresenter = Boolean(isAdmin && isPresenting && live.isLive);

    const follower = useFollowerSync({
        isLive: liveEnabled && live.isLive,
        isPresenter,
        presenter: live.presenter,
        localSlide: navigation.currentSlide,
        syncTo: navigation.syncTo,
    });

    // Émission de commandes quand on présente (position absolue après résolution locale)
    const emitIfPresenter = useCallback((slide: number, step: number) => {
        if (isPresenter) live.sendCommand({ slide, step });
    }, [isPresenter, live]);
```

Envelopper les actions de navigation pour (a) notifier la nav locale d'un follower, (b) émettre si présentateur. Remplacer le câblage clavier et les valeurs passées au contexte :

```tsx
    const next = useCallback(() => {
        follower.notifyLocalNav();
        navigation.nextSlide();
    }, [follower, navigation]);

    const prev = useCallback(() => {
        follower.notifyLocalNav();
        navigation.prevSlide();
    }, [follower, navigation]);

    // Après chaque changement de position en mode présentateur, émettre l'état courant
    useEffect(() => {
        emitIfPresenter(navigation.currentSlide, navigation.currentStep);
    }, [navigation.currentSlide, navigation.currentStep, emitIfPresenter]);

    useKeyboardNav({ next, prev, toggleFullscreen });
```

Dans la valeur du `SlidesContext.Provider`, surcharger `nextSlide/prevSlide` par `next/prev` et ajouter le bloc `live` :

```tsx
                nextSlide: next,
                prevSlide: prev,
                live: liveEnabled ? {
                    isLive: live.isLive,
                    isPresenter,
                    presenterName: live.presenterName,
                    connection: live.connection,
                    drift: follower.drift,
                    paused: follower.paused,
                    resync: follower.resync,
                } : undefined,
```

Exposer aussi un moyen pour `SlidesActions` de démarrer/arrêter : passer via le contexte ou via un prop drilling léger. **Décision :** ajouter au contexte deux callbacks admin optionnels :

```ts
    // dans SlidesContextType (UI) :
    startPresenting?: () => void;
    stopPresenting?: () => void;
```

et les fournir :

```tsx
                startPresenting: isAdmin ? async () => { await live.start(); setIsPresenting(true); } : undefined,
                stopPresenting: isAdmin ? async () => { await live.stop(); setIsPresenting(false); } : undefined,
```

- [ ] **Step 3 : Bandeau + annonce a11y dans le rendu**

Dans le JSX desktop de `SlidesScreen` (après `<SlidesProgress/>`), insérer :

```tsx
                        {live.isLive && liveEnabled && !isPresenter && (
                            <LiveBanner
                                presenterName={live.presenterName}
                                connection={live.connection}
                                paused={follower.paused}
                                drift={follower.drift}
                                onResync={follower.resync}
                            />
                        )}
                        {/* Annonce lecteur d'écran */}
                        <p className="sr-only" aria-live="polite">
                            Slide {navigation.currentSlide + 1} sur {slides.length}
                        </p>
```

Imports à ajouter en tête : `useLiveSession`, `useFollowerSync`, `LiveBanner`, et `useCallback, useEffect` (déjà partiellement importés).

- [ ] **Step 4 : Bouton « Présenter en direct » dans SlidesActions**

Dans `SlidesActions.tsx`, récupérer du contexte `startPresenting, stopPresenting, live` et ajouter (admin only → boutons présents seulement si `startPresenting` défini) :

```tsx
            {startPresenting && (
                live?.isPresenter ? (
                    <Button
                        size="icon"
                        variant="ghost"
                        title="Arrêter la présentation"
                        onClick={() => { if (confirm("Arrêter la présentation en direct ?")) stopPresenting?.(); }}
                    >
                        <RadioTower className="text-red-500" />
                    </Button>
                ) : (
                    <Button size="icon" variant="ghost" title="Présenter en direct" onClick={startPresenting}>
                        <RadioTower />
                    </Button>
                )
            )}
```

Importer `RadioTower` de `lucide-react` ; déstructurer `startPresenting, stopPresenting, live` depuis `useSlides()`.

- [ ] **Step 5 : Transmettre les props depuis SlideBlocksRenderer**

`SlideBlocksRenderer` reçoit déjà `module`/`section`. Lui ajouter `moduleSlug`, `sectionSlug`, `isAdmin` (props) et les passer à `<SlidesScreen>`. Mettre à jour l'appelant `slide/page.tsx` pour fournir `moduleSlug`, `sectionSlug`, `isAdmin={isAdmin}`.

```tsx
// slide/page.tsx — branche DB :
<SlideBlocksRenderer
    blocks={doc.blocks}
    module={currentModule}
    section={currentSection}
    moduleSlug={moduleSlug}
    sectionSlug={sectionSlug}
    isAdmin={isAdmin}
/>
```

> Branche FILE (legacy `.tsx`) : ces slides n'utilisent pas `SlideBlocksRenderer`. Le live y reste inactif en v1 (le composant legacy rend son propre `SlidesScreen` sans les props live). Acceptable : la migration pousse vers la DB. Noter au suivi.

- [ ] **Step 6 : Build + smoke test deux onglets**

```bash
bun run lint
bun run build
```
Puis `bun dev`, deux onglets sur `/js/evenements/slide` (un admin, un autre compte) :
- [ ] Onglet admin : bouton `RadioTower` → démarre, l'autre onglet affiche le bandeau « En direct ».
- [ ] Admin avance (flèche) → l'onglet follower suit.
- [ ] Le follower avance seul → bandeau « X d'avance [Resync] », resync réaligne.
- [ ] Arrêt (confirmation) → bandeau disparaît chez le follower.

- [ ] **Step 7 : Commit**

```bash
git add src/components/Slides/SlidesScreen.tsx src/components/Slides/SlidesActions.tsx src/components/Slides/SlideBlocksRenderer.tsx "src/app/[moduleSlug]/[sectionSlug]/slide/page.tsx" src/components/Slides/context/SlidesContext.tsx
git commit -m "feat(live): intégration SlidesScreen (followers, présentateur, bandeau)"
```

---

## Task 10 : useStopwatch + useWakeLock

**Files:**
- Create: `src/components/Slides/hooks/useStopwatch.ts`, `src/components/Slides/hooks/useWakeLock.ts`

- [ ] **Step 1 : useStopwatch**

`src/components/Slides/hooks/useStopwatch.ts` :

```ts
"use client";

import { useEffect, useState } from "react";
import { formatStopwatch } from "@/lib/live/stopwatch";

/** Renvoie le temps écoulé formaté depuis `startedAt` (tick 1s). Vide si null. */
export function useStopwatch(startedAt: number | null): string {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (startedAt === null) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [startedAt]);
    if (startedAt === null) return "--:--";
    return formatStopwatch(now - startedAt);
}
```

- [ ] **Step 2 : useWakeLock**

`src/components/Slides/hooks/useWakeLock.ts` :

```ts
"use client";

import { useEffect } from "react";

/** Maintient l'écran allumé tant que `active` est vrai (API Wake Lock, best-effort). */
export function useWakeLock(active: boolean): void {
    useEffect(() => {
        if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
        let sentinel: WakeLockSentinel | null = null;
        let cancelled = false;

        const request = async () => {
            try {
                sentinel = await navigator.wakeLock.request("screen");
            } catch { /* refusé / non supporté */ }
        };
        void request();

        const onVisibility = () => {
            if (document.visibilityState === "visible" && !cancelled) void request();
        };
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            cancelled = true;
            document.removeEventListener("visibilitychange", onVisibility);
            void sentinel?.release().catch(() => {});
        };
    }, [active]);
}
```

- [ ] **Step 3 : Lint + commit**

```bash
bun run lint
git add src/components/Slides/hooks/useStopwatch.ts src/components/Slides/hooks/useWakeLock.ts
git commit -m "feat(live): useStopwatch + useWakeLock hooks"
```

---

## Task 11 : PresenterView + route /present

**Files:**
- Create: `src/components/Slides/PresenterView.tsx`
- Create: `src/app/[moduleSlug]/[sectionSlug]/present/page.tsx`

- [ ] **Step 1 : PresenterView**

`src/components/Slides/PresenterView.tsx` :

```tsx
"use client";

import React, { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SlideScreen } from "@/components/Slides/SlideScreen";
import { SlideChildItem } from "@/components/builder/SlideChildrenRenderer";
import { ConnectionDot } from "@/components/Slides/ConnectionDot";
import { useLiveSession } from "@/components/Slides/hooks/useLiveSession";
import { useStopwatch } from "@/components/Slides/hooks/useStopwatch";
import { useWakeLock } from "@/components/Slides/hooks/useWakeLock";
import type { Block } from "@/types/CourseContent";

interface PresenterViewProps {
    moduleSlug: string;
    sectionSlug: string;
    slides: Block[];   // blocs de type "slide" (DB) — peut être vide (fallback minimal)
}

export function PresenterView({ moduleSlug, sectionSlug, slides }: PresenterViewProps) {
    const live = useLiveSession(moduleSlug, sectionSlug);
    const elapsed = useStopwatch(live.startedAt);
    useWakeLock(live.isLive);

    const cur = live.presenter?.slide ?? 0;
    const currentSlide = slides[cur] ?? null;
    const nextSlide = slides[cur + 1] ?? null;
    const notes = currentSlide
        ? (currentSlide.children ?? []).filter((c) => c.type === "slide-note").map((c) => String(c.props.content ?? "")).join("\n")
        : "";

    // Position absolue : on s'appuie sur l'index de slide (étape 0 pour la télécommande téléphone v1)
    const go = useCallback((target: number) => {
        const clamped = Math.max(0, Math.min(target, Math.max(0, slides.length - 1)));
        live.sendCommand({ slide: clamped, step: 0 });
        if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(10);
    }, [live, slides.length]);

    if (!live.isLive) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-300">
                <button
                    type="button"
                    onClick={() => void live.start()}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-white"
                >
                    Démarrer la présentation
                </button>
            </div>
        );
    }

    return (
        <div
            className="flex min-h-[100dvh] flex-col bg-slate-900 text-slate-100 select-none"
            style={{ touchAction: "manipulation", overscrollBehavior: "contain" }}
        >
            {/* Chrono = héro */}
            <div className="flex items-center justify-center gap-3 py-3">
                <span className="font-mono text-4xl tabular-nums">{elapsed}</span>
                <ConnectionDot connection={live.connection} />
            </div>

            {/* Slides : actuelle + aperçu suivante */}
            <div className="flex flex-1 items-center gap-3 px-3">
                <div className="aspect-video flex-1 overflow-hidden rounded-lg bg-card text-card-foreground">
                    {currentSlide
                        ? <SlideScreen title={String(currentSlide.props.title ?? "")}>
                              {(currentSlide.children ?? []).map((c) => <SlideChildItem key={c.id} block={c} />)}
                          </SlideScreen>
                        : <div className="flex h-full items-center justify-center text-sm text-slate-400">Slide {cur + 1}</div>}
                </div>
                <div className="hidden w-40 shrink-0 sm:block">
                    <div className="mb-1 text-[10px] uppercase tracking-widest text-slate-400">Suivante</div>
                    <div className="aspect-video overflow-hidden rounded bg-card text-card-foreground">
                        {nextSlide
                            ? <div className="origin-top-left scale-[0.3]" style={{ width: 533, height: 300 }}>
                                  <SlideScreen title={String(nextSlide.props.title ?? "")}>
                                      {(nextSlide.children ?? []).map((c) => <SlideChildItem key={c.id} block={c} />)}
                                  </SlideScreen>
                              </div>
                            : <div className="flex h-full items-center justify-center text-xs text-slate-400">Fin</div>}
                    </div>
                </div>
            </div>

            {/* Notes (secondaires) */}
            {notes && (
                <div className="max-h-24 overflow-y-auto px-4 py-2 text-sm text-slate-300">{notes}</div>
            )}

            {/* Demi-écrans tactiles */}
            <div className="grid h-28 grid-cols-2 gap-1 p-1">
                <button
                    type="button"
                    aria-label="Slide précédente"
                    onClick={() => go(cur - 1)}
                    className="flex items-center justify-center rounded-lg bg-slate-800 active:bg-slate-700"
                >
                    <ChevronLeft className="size-10" />
                </button>
                <button
                    type="button"
                    aria-label="Slide suivante"
                    onClick={() => go(cur + 1)}
                    className="flex items-center justify-center rounded-lg bg-slate-800 active:bg-slate-700"
                >
                    <ChevronRight className="size-10" />
                </button>
            </div>
        </div>
    );
}
```

> Dépendance : `SlideChildItem` provient de `src/components/builder/SlideChildrenRenderer.tsx` (créé dans le plan builder, Task 5). Si ce plan est exécuté **avant** le builder, extraire d'abord `SlideChildItem`/`PREVIEW_CONTEXT` dans ce fichier partagé (petit pré-requis), ou dupliquer le switch `slide-*` localement. Choix recommandé : créer `SlideChildrenRenderer` ici si absent (les deux plans le partagent).

- [ ] **Step 2 : Route /present (admin)**

`src/app/[moduleSlug]/[sectionSlug]/present/page.tsx` :

```tsx
import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { getModuleData } from "@/hook/getModuleData";
import { getContentBlocks } from "@/lib/getContentBlocks";
import { PresenterView } from "@/components/Slides/PresenterView";
import type { Block } from "@/types/CourseContent";

interface Props {
    params: Promise<{ moduleSlug: string; sectionSlug: string }>;
}

export default async function PresentPage({ params }: Props) {
    const { moduleSlug, sectionSlug } = await params;
    const [session, { currentSection }] = await Promise.all([
        getServerSession(),
        getModuleData({ moduleSlug, sectionSlug }),
    ]);

    // Garde admin (défense en profondeur ; le proxy garantit déjà l'authentification)
    if (session?.user.role !== "admin") notFound();
    if (!currentSection) notFound();

    // Slides en base si disponibles ; sinon liste vide → télécommande minimale
    const doc = await getContentBlocks(moduleSlug, sectionSlug, "slide");
    const slides: Block[] = (doc?.blocks ?? []).filter((b) => b.type === "slide");

    return <PresenterView moduleSlug={moduleSlug} sectionSlug={sectionSlug} slides={slides} />;
}
```

- [ ] **Step 3 : Build + smoke test mobile**

```bash
bun run lint
bun run build
```
`bun dev`, ouvrir `/js/evenements/present` (admin) sur téléphone (ou DevTools mobile) :
- [ ] Chrono démarre et monte ; `Démarrer` si pas encore live.
- [ ] ◀ ▶ avancent ; l'écran follower (autre onglet) suit ; vibration sur mobile réel.
- [ ] Aperçu « suivante » + notes (si slide DB avec `slide-note`).
- [ ] L'écran ne se verrouille pas (Wake Lock) ; un swipe ne recharge pas la page.

- [ ] **Step 4 : Commit**

```bash
git add src/components/Slides/PresenterView.tsx "src/app/[moduleSlug]/[sectionSlug]/present"
git commit -m "feat(live): vue présentateur téléphone /present (chrono, aperçu, notes, tap zones)"
```

---

## Task 12 : Vérification end-to-end & polish

- [ ] **Step 1 : Tests purs + lint + build**

```bash
bun test src/lib/live
bun run lint
bun run build
```
Expected : tests verts (registry, stopwatch, drift), lint zéro, build standalone OK.

- [ ] **Step 2 : Scénario complet 3 surfaces**

`bun dev` + une section slide en **base** (sinon basculer via le builder/PATCH). Trois fenêtres :
- **A (laptop admin)** `/slide` : démarrer la présentation.
- **B (téléphone admin)** `/present` : avancer avec ◀ ▶.
- **C (élève)** `/slide` : suit.
- [ ] B avance → A **et** C avancent (serveur = source de vérité, laptop+téléphone synchrones).
- [ ] A avance au clavier → B et C suivent.
- [ ] C navigue seul → bandeau dérive + Resync ; A/B inchangés.
- [ ] Couper le Wi-Fi de C 5 s → point ambre « reconnexion », puis vert au retour, position rattrapée.
- [ ] Arrêt depuis A (confirmation) → bandeau disparaît chez C, `/present` repasse à « Démarrer ».

- [ ] **Step 3 : Vérif a11y / reduced-motion**

- [ ] `aria-live` annonce le numéro de slide chez le follower.
- [ ] `prefers-reduced-motion` : le `animate-ping` du point live se désactive (classe `motion-safe:`).
- [ ] Indicateurs connexion = couleur **+** forme **+** `sr-only` texte.
- [ ] Cibles ◀ ▶ du téléphone = demi-largeur, hauteur 112px (≫ 44px).

- [ ] **Step 4 : Commit final (si correctifs)**

```bash
bun run lint
git add -A
git commit -m "fix(live): polish a11y + corrections smoke test présentation live"
```

---

## Self-Review — couverture de la spec

| Section spec | Tâche(s) |
|--------------|----------|
| §1 Vue d'ensemble / SSE | 3, 5 |
| §2 Rôles & surfaces | 9 (laptop, follower), 11 (téléphone) |
| §3 Modèle de session (in-memory, absolu, source serveur) | 1, 4 |
| §4 LiveSessionRegistry + routes API | 1, 3, 4 |
| §5 useLiveSession | 5 |
| §6 Follower (bandeau, nav libre, drift, resync, dégradation, aria-live) | 7, 8, 9 |
| §7 Présentateur laptop (toggle, émission, arrêt confirmé) | 9 |
| §8 Présentateur téléphone (layout, chrono, notes, tap, wake lock, haptique) | 10, 11 |
| §9 États de connexion | 5 (détection), 8 (affichage) |
| §10 Auth & sécurité (admin start/stop/command, /present) | 4, 11 |
| §11 Accessibilité | 8, 9, 12 |
| §12 Réutilisations | 6, 9, 11 |

**Écarts assumés (documentés en tête) :** commandes en position absolue ; pas de période de grâce (lifetime explicite) ; `/present` riche réservé aux slides en base, fallback minimal pour le legacy fichier ; live inactif sur les slides legacy `.tsx` en v1.

**Pré-requis inter-plans :** `SlideChildItem`/`SlideChildrenRenderer` (`src/components/builder/SlideChildrenRenderer.tsx`) est partagé avec le plan builder. Le premier plan exécuté le crée ; l'autre le réutilise.
