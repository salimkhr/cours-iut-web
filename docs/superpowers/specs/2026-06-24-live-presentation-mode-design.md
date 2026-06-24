# Mode Présentation en Direct — Design Spec

**Date :** 2026-06-24
**Statut :** Approuvé
**Périmètre :** Mode « présentation live » des slides — l'admin contrôle, les autres écrans (élèves, projection) suivent en temps réel ; une vue présentateur sur téléphone sert de seconde télécommande avec chrono et notes.

---

## 1. Vue d'ensemble

Aujourd'hui la navigation des slides (`currentSlide`, `currentStep`) est un état React **purement local** (`useSlidesNavigation`). Ce spec ajoute une **couche de synchronisation temps réel** : la position du présentateur est poussée vers tous les écrans connectés, et deux surfaces (laptop + téléphone) peuvent piloter la même session.

Aucune infra temps réel n'existe dans le projet. On l'ajoute via **SSE (Server-Sent Events)** — un route handler Next renvoyant un flux `text/event-stream`, sans nouvelle dépendance ni process serveur séparé. Les commandes (zappette, téléphone) remontent par simple `POST`.

**Pourquoi SSE et pas WebSocket :** le flux est un broadcast un-vers-plusieurs (présentateur → écrans) avec des commandes ponctuelles en sens inverse. SSE est conçu pour ça, offre la reconnexion automatique native d'`EventSource`, et reste compatible avec le build standalone (WebSocket imposerait un process `ws` distinct). L'abstraction `useLiveSession` masque le transport pour permettre une migration ultérieure si un besoin bidirectionnel apparaît.

---

## 2. Rôles & surfaces

| Surface | URL | Qui | Rôle |
|---------|-----|-----|------|
| **Présentateur — laptop** | `/[moduleSlug]/[sectionSlug]/slide` | admin | Pilote (clavier/zappette), branché sur la projection |
| **Présentateur — téléphone** | `/[moduleSlug]/[sectionSlug]/present` | admin | Seconde télécommande : chrono + notes + aperçu + ◀ ▶ |
| **Followers** | `/[moduleSlug]/[sectionSlug]/slide` | tout connecté | Suivent en direct, navigation libre + resync |

La même URL `/slide` sert au présentateur et aux followers : c'est le **rôle (`role === 'admin'`)** et l'état de session qui déterminent l'affichage (contrôles vs suivi).

---

## 3. Modèle de session

- **Granularité :** une session live par section (`moduleSlug/sectionSlug` = `sessionId`). Un deck = les slides d'une section.
- **Unicité :** une session active à la fois par section.
- **État serveur (en mémoire) :**

```ts
interface LiveSessionState {
    sessionId: string;          // `${moduleSlug}/${sectionSlug}`
    presenterName: string;      // nom de l'admin (depuis la session better-auth)
    currentSlide: number;
    currentStep: number;
    startedAt: number;          // epoch ms — origine du chrono
    updatedAt: number;
}
```

- **Persistance :** aucune (in-memory). Une session live est éphémère ; sa perte au redémarrage est acceptable. *(Persistance Mongo = hors périmètre v1.)*
- **Source de vérité = serveur.** Les surfaces de contrôle appliquent une **mise à jour optimiste** locale immédiate, puis se réalignent sur l'écho SSE.

---

## 4. Architecture serveur

### 4.1 LiveSessionRegistry

Singleton en mémoire sur l'instance standalone (`globalThis` caché, comme `_mongoClientPromise` dans `src/lib/mongodb.ts` pour survivre au hot-reload en dev).

```
src/lib/live/LiveSessionRegistry.ts
```

Responsabilités :
- `start(sessionId, presenterName)` → crée/réinitialise la session, `startedAt = Date.now()`.
- `stop(sessionId)` → supprime la session, émet un événement `ended`.
- `command(sessionId, { action, slide, step })` → met à jour `currentSlide/currentStep`, émet `state`.
- `get(sessionId)` → snapshot ou `null`.
- `subscribe(sessionId, listener)` → enregistre un listener (pour le flux SSE), retourne un `unsubscribe`.

Implémentation : un `Map<sessionId, { state, emitter: EventEmitter }>`. Pas de dépendance — `node:events`.

### 4.2 Routes API (`src/app/api/live/[moduleSlug]/[sectionSlug]/...`)

| Route | Méthode | Auth | Rôle |
|-------|---------|------|------|
| `.../start` | POST | admin | Démarre la session |
| `.../stop` | POST | admin | Arrête la session |
| `.../command` | POST | admin | `{ action: "next"\|"prev"\|"goto", slide?, step? }` |
| `.../stream` | GET | session connectée | Flux SSE `text/event-stream` |
| `.../` (index) | GET | session connectée | Snapshot JSON (état initial / fallback) |

- **Garde admin :** `auth.api.getSession({ headers })` puis `role === 'admin'` sur start/stop/command (cf. flux d'auth de `src/proxy.ts`). Le `presenterName` vient de cette session.
- **Flux SSE :** le handler GET renvoie un `ReadableStream` avec en-têtes `Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`, `Connection: keep-alive`. À l'abonnement : émet immédiatement l'état courant (`event: state`) puis chaque mise à jour. Envoie un **heartbeat** `: ping\n\n` toutes les ~20 s pour garder la connexion vivante derrière les proxies. Ferme proprement sur `request.signal` (abort) → `unsubscribe`.
- **CSP :** les routes sont same-origin (`connect-src 'self'`), aucune entrée CSP supplémentaire nécessaire (contrairement à un `wss://` externe).

---

## 5. Abstraction client : `useLiveSession`

```
src/components/Slides/hooks/useLiveSession.ts
```

Masque le transport. Signature :

```ts
type LiveConnection = "connected" | "reconnecting" | "offline";

interface UseLiveSession {
    isLive: boolean;
    presenterName: string | null;
    presenter: { slide: number; step: number } | null;
    connection: LiveConnection;
    // commandes (no-op si non admin) :
    sendCommand: (cmd: { action: "next" | "prev" | "goto"; slide?: number; step?: number }) => void;
    start: () => Promise<void>;
    stop: () => Promise<void>;
}
```

- Ouvre un `EventSource` sur `.../stream`. Mappe l'état des événements `state` / `ended`.
- **États de connexion :** `EventSource.onopen` → `connected` ; `onerror` (avec retry auto) → `reconnecting` ; après N échecs / `readyState === CLOSED` → `offline`.
- `sendCommand` POST vers `.../command` (utilisé par laptop + téléphone). Mise à jour optimiste possible côté appelant.

---

## 6. Expérience Follower (URL `/slide`)

À l'ouverture de la page slide, `useLiveSession` détecte une session active :

- **Bandeau « En direct »** en haut : point SVG qui pulse (Lucide `Radio` / dot animé, **pas d'emoji**) + « En direct — vous suivez {presenterName} ». Couleur du point = état de connexion (vert / ambre / rouge).
- **Navigation libre :** l'élève garde le contrôle de son `useSlidesNavigation` local. Tant qu'il est aligné sur le présentateur, sa slide suit automatiquement les pushs SSE.
- **Pause de l'auto-suivi :** dès que l'élève navigue lui-même (flèche, clic), l'auto-suivi se **met en pause** (il explore à son rythme).
- **Badge de dérive (directionnel) :** « +2 slides d'avance » / « 3 slides de retard » selon `localSlide - presenterSlide`, avec un bouton **[Resync]** qui réaligne `local = presenter` et réactive l'auto-suivi. À `0 d'écart`, le badge disparaît ; un indicateur discret « vous suivez » subsiste.
- **Dégradation hors-ligne :** si `connection === "offline"`, la dernière position connue reste affichée, grisée, avec « Reconnexion… ». Pas d'écran noir.
- **Accessibilité :** changement de slide chez le follower annoncé via `aria-live="polite"` (« Slide 4 sur 12 »). Bouton Resync = libellé explicite.

Si **aucune** session n'est active, la page slide se comporte exactement comme aujourd'hui (aucune régression).

---

## 7. Expérience Présentateur — laptop (URL `/slide`, admin)

- **Bouton « Présenter en direct »** (admin only) dans le chrome des slides (`SlidesActions`). Toggle on → `start()`.
- Une fois live, `useKeyboardNav` (flèches/zappette) et les contrôles envoient `sendCommand` au serveur **en plus** de la mise à jour optimiste locale. L'écran reste la source visuelle de la projection.
- **Synchro laptop ↔ téléphone :** comme les deux surfaces postent vers la même session et lisent le même flux SSE, elles restent cohérentes automatiquement.
- **Arrêt sécurisé :** « Arrêter la présentation » demande **confirmation** (un appui accidentel ne coupe pas le direct).

---

## 8. Expérience Présentateur — téléphone (URL `/present`, admin)

Vue présentateur dédiée, **thème sombre par défaut** (salle en pénombre + projection). Hiérarchie : **le chrono et les slides priment ; les notes sont secondaires** (peu de notes en pratique).

### 8.1 Layout

```
┌──────────────────────────────┐
│           ⏱ 18:42             │  ← Chrono = héro (haut)
│                               │
│  ┌────────────┐  ▸ suivante   │
│  │ slide N    │  ┌─────────┐  │  ← slide actuelle + aperçu suivante
│  └────────────┘  └─────────┘  │
│  notes (courtes, discrètes)   │  ← notes secondaires
├───────────────┬───────────────┤
│      ◀        │       ▶        │  ← demi-écrans tactiles (préc/suiv)
└───────────────┴───────────────┘
```

- **Slide actuelle + aperçu « suivante »** : rendus via `SlideScreen` à l'échelle (réutilisable avec l'approche `ZoomedSlide`/scale ; les deux specs peuvent partager un composant de slide scalée, sans dépendance dure).
- **Notes** : lues depuis les blocs `slide-note` (type existant, champ `content`) de la slide courante. Affichage compact ; si vide, masquées.

### 8.2 Chrono

- **Stopwatch simple** depuis `startedAt` (origine = démarrage de la session), qui monte. Format `mm:ss` (bascule `h:mm:ss` au-delà d'une heure). Élément le plus visible de l'écran.
- Piloté par `startedAt` du serveur → identique sur laptop et téléphone. Aucun jalon, aucune alerte, aucun réglage : un compteur, point.

### 8.3 Ergonomie tactile (manipulation à une main, sans regarder)

- **Zones ◀ / ▶ = demi-écrans pleine hauteur** (bien au-delà des 44px min), `gap` ≥ 8px de la zone centrale.
- `touch-action: manipulation` (supprime le délai de tap 300ms) ; `overscroll-behavior: contain` (un swipe ne recharge pas la page).
- **Retour haptique** `navigator.vibrate(10)` à chaque changement de slide → l'avancée se *sent*.
- **Wake Lock API** (`navigator.wakeLock.request("screen")`) : empêche le verrouillage de l'écran pendant la présentation ; relâché à l'arrêt / au `visibilitychange`.
- Chaque action poste `sendCommand` (mise à jour optimiste locale immédiate).

---

## 9. États de connexion & dégradation

| État | Détection | Affichage follower | Affichage présentateur |
|------|-----------|--------------------|------------------------|
| `connected` | `EventSource.onopen` | point vert pulse, suit en direct | « Direct actif » |
| `reconnecting` | `onerror` + retry auto | point ambre, « Reconnexion… » | bandeau ambre |
| `offline` | `readyState === CLOSED` / N échecs | dernière slide grisée + « Hors-ligne » | alerte de reconnexion |

- **Déconnexion du présentateur :** si le flux du présentateur tombe, le serveur ne **clôt pas** immédiatement la session — **délai de grâce** (~30 s) avant de notifier `ended` aux followers (évite une coupure sur micro-perte réseau).
- Reconnexion gérée nativement par `EventSource` ; à la reprise, l'état courant est ré-émis immédiatement.

---

## 10. Auth & sécurité

- **start / stop / command** : exigent `role === 'admin'` (via `auth.api.getSession`). Un non-admin reçoit `403`.
- **stream / index** : exigent une session connectée (déjà garanti par les règles de `src/proxy.ts` sur ces chemins). Lecture seule.
- Aucun secret côté client. SSE same-origin → pas d'élargissement CSP.
- `/present` est protégé admin au niveau du proxy (sous le préfixe section, mais le handler vérifie aussi le rôle pour la défense en profondeur).

---

## 11. Accessibilité (rappels appliqués)

- `aria-live="polite"` sur l'annonce de slide chez le follower.
- Indicateurs de connexion : **couleur + forme + texte** (jamais la couleur seule).
- Cibles tactiles ≥ 44px (téléphone : demi-écrans).
- `prefers-reduced-motion` : la pulsation du point « live » passe en variation d'opacité discrète / statique.
- Pas d'emoji comme icône (Lucide / SVG).

---

## 12. Réutilisations

- `useSlidesNavigation` — état local inchangé ; `useLiveSession` se superpose.
- `useKeyboardNav` — émet `sendCommand` quand le mode live est actif (laptop).
- `slide-note` — source des notes du téléphone.
- `SlideScreen` — rendu des slides (actuelle/suivante) à l'échelle.
- Pattern `globalThis` de `src/lib/mongodb.ts` — pour le registry singleton en dev.

---

## 13. Non-périmètre

- Persistance Mongo de l'état de session (in-memory uniquement en v1).
- Multi-instance / scaling horizontal (le registry suppose une instance standalone unique ; un backend pub/sub type Redis serait nécessaire pour plusieurs instances — hors v1).
- Chat / questions des élèves, sondages, curseur partagé (aucun besoin bidirectionnel haute fréquence ⇒ justifie SSE).
- Enregistrement / replay de la session.
- Le builder de slides (couvert par `2026-06-24-builder-canvas-redesign-design.md`).
