# Design — Tests des Route Handlers API

**Date :** 2026-05-24
**Contexte :** Le projet n'a aucun test en place. Cette feature introduit une suite de tests pour toutes les routes API (`src/app/api/`), en utilisant le runner intégré de Bun (`bun test`), sans dépendance de test supplémentaire sauf `mongodb-memory-server`.

---

## 1. Approche retenue

**Handler direct + `mongodb-memory-server`.**

Les Route Handlers Next.js App Router sont de simples fonctions async `(request: Request) => Response`. On les importe directement et on les appelle avec un `new Request(...)` — pas de serveur HTTP à démarrer, pas de `next-test-api-route-handler`.

Pour les routes avec MongoDB : instance `MongoMemoryServer` locale à chaque fichier de test (isolation maximale).

La route `/api/auth/[...all]` est gérée par `better-auth` — hors périmètre, pas testée.

---

## 2. Structure des fichiers

```
tests/
  helpers/
    db.ts                        # MongoMemoryServer factory (startMemoryDb)
  api/
    health.test.ts
    avatar.test.ts
    upload-avatar.test.ts
    admin/
      sync.test.ts
      modules.test.ts
      modules-id.test.ts
      users.test.ts
      users-id.test.ts
      sections.test.ts
      sections-order.test.ts
bunfig.toml                      # timeout = 30000, pas de preload global
```

---

## 3. Configuration Bun

**`bunfig.toml`** (ajout à la racine) :
```toml
[test]
timeout = 30000
```

Bun lit les `paths` de `tsconfig.json` automatiquement — l'alias `@/` fonctionne dans les tests sans configuration supplémentaire.

---

## 4. Helper MongoDB partagé

**`tests/helpers/db.ts`** :

```ts
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import type { Db } from "mongodb";

export async function startMemoryDb(): Promise<{ db: Db; stop: () => Promise<void> }> {
    const server = await MongoMemoryServer.create();
    const client = new MongoClient(server.getUri());
    await client.connect();
    const db = client.db("test");
    return {
        db,
        stop: async () => {
            await client.close();
            await server.stop();
        },
    };
}
```

Une instance par fichier de test → isolation totale entre fichiers. `beforeEach(() => db.dropDatabase())` isole les tests dans un même fichier.

---

## 5. Pattern de mock par fichier

Bun's `mock.module()` modifie le registre de modules. Le handler est importé via `await import()` top-level **après** les appels `mock.module()`, garantissant qu'il reçoit les versions mockées.

La variable `db` est déclarée avec `let` avant les mocks — la closure capture la référence. Quand le handler appelle `connectToDB()` pendant un test, `db` a déjà été assigné par `beforeAll`.

```ts
import { beforeAll, afterAll, beforeEach, describe, test, expect, mock } from "bun:test";
import type { Db } from "mongodb";

let db: Db;

// Mocks AVANT l'import du handler
mock.module("@/lib/mongodb", () => ({ connectToDB: async () => db }));
mock.module("@/lib/withAdmin", () => ({ withAdmin: (fn: Function) => fn }));

// Import dynamique top-level — reçoit les modules mockés
const { GET } = await import("@/app/api/admin/sync/route");

let stopDb: () => Promise<void>;
beforeAll(async () => {
    const { startMemoryDb } = await import("../../helpers/db");
    ({ db, stop: stopDb } = await startMemoryDb());
});
afterAll(() => stopDb());
beforeEach(async () => { await db.dropDatabase(); });
```

### Routes utilisant `getServerSession` directement (pas `withAdmin`)

Routes concernées : `PUT /api/admin/modules/[moduleId]`, `GET /api/admin/users`, `DELETE /api/admin/users/[userId]`, `POST /api/upload-avatar`.

```ts
mock.module("@/lib/auth", () => ({
    getServerSession: async () => ({ user: { id: "u1", role: "admin" } }),
    auth: {
        api: {
            listUsers: async () => ({ users: [] }),
            removeUser: async () => ({}),
        },
    },
}));
```

Pour tester le garde non-admin, surcharger le mock localement dans le test :
```ts
mock.module("@/lib/auth", () => ({ getServerSession: async () => null }));
```

### Routes avec dépendances filesystem ou upload

Pour `GET /api/avatar/[filename]` et `POST /api/upload-avatar` :
```ts
mock.module("fs/promises", () => ({
    readFile: async (path: string) => Buffer.from("fake-image-content"),
}));

mock.module("@/lib/upload/scanner", () => ({
    scanWithClamAV: async () => ({ clean: true }),
}));
mock.module("@/lib/upload/processor", () => ({
    isImage: () => true,
    reencodeImage: async (buf: Buffer) => ({ buffer: buf, ext: "jpg" }),
}));
mock.module("@/lib/upload/storage", () => ({
    storeFinal: async () => "550e8400-e29b-41d4-a716-446655440000.jpg",
    storeQuarantine: async () => {},
}));
mock.module("@/lib/upload/mime", () => ({
    detectMime: () => "image/jpeg",
}));
```

Pour `GET /api/admin/sync`, en plus de `connectToDB`, mocker `fs/promises` pour simuler l'arborescence `src/cours` :
```ts
mock.module("fs/promises", () => ({
    readdir: async (path: string, opts?: { withFileTypes?: boolean }) => {
        // retourner les entrées simulées selon le path
    },
}));
```

---

## 6. Couverture par route

### `GET /api/health`
- DB up → `{ status: "ok", db: { status: "up" } }`
- DB down (mock `connectToDB` qui rejette) → `{ status: "degraded", db: { status: "down" } }`

### `GET /api/avatar/[filename]`
- UUID valide + fichier présent → 200, `Content-Type: image/jpeg`
- Nom de fichier invalide (pas UUID) → 400
- Extension inconnue → 415
- Fichier absent (`readFile` rejette) → 404
- `UPLOADS_DIR` non défini → 404

### `POST /api/upload-avatar`
- Pas de session → 401
- Champ `file` manquant → 400
- Fichier vide (`size === 0`) → 400
- Fichier trop volumineux → 413
- MIME non autorisé → 415
- Fichier infecté (ClamAV retourne `{ clean: false }`) → 422
- Image valide → 200 avec `{ url: "/api/avatar/<uuid>.jpg" }`

### `GET /api/admin/sync`
- Filesystem vide + MongoDB vide → `{ missingModules: [], missingSections: [] }`
- Dossier module présent dans filesystem, absent de MongoDB → apparaît dans `missingModules`
- Module présent dans les deux, section présente dans filesystem mais absente de MongoDB → apparaît dans `missingSections` avec prefill correct (title dérivé du slug, order, contents)

### `POST /api/admin/modules`
- Body valide → 201 avec `insertedId`
- Body invalide (échec Zod) → 400

### `PUT /api/admin/modules/[moduleId]`
- Session non-admin (`getServerSession` → null) → 403
- Update valide → 200 `{ success: true }`
- `moduleId` inexistant → 404
- Body invalide → 400

### `GET /api/admin/users`
- Non-admin → 403
- Admin → 200 (délègue à `auth.api.listUsers` mocké)

### `DELETE /api/admin/users/[userId]`
- Non-admin → 403
- Admin → 200 `{ success: true }`

### `POST /api/admin/[moduleId]/sections`
- Body valide + module existant → 200 `{ success: true, section }`
- Body invalide → 400
- `moduleId` inexistant → 404

### `PUT /api/admin/[moduleId]/sections`
- Update valide → 200 `{ success: true, section }`
- Module inexistant → 404
- Section introuvable dans le module → 404

### `PUT /api/admin/[moduleId]/sections/[order]`
- Même pattern que `PUT /api/admin/[moduleId]/sections` — valide → 200 ; module absent → 404.

---

## 7. Dépendances à ajouter

```
mongodb-memory-server   (devDependency)
```

Aucune autre dépendance de test — `bun:test` est intégré à Bun.

---

## 8. Contraintes

- **ESM top-level await** : les fichiers de test utilisent `await import()` au top-level. Bun supporte nativement l'ESM top-level await.
- **Ordre d'appel** : `mock.module()` doit précéder `await import()` dans le fichier — ne pas inverser.
- **`UPLOADS_DIR`** : les tests de `avatar` et `upload-avatar` définissent `process.env.UPLOADS_DIR = "/fake/uploads"` dans `beforeAll`.
- **Isolation** : chaque fichier de test démarre sa propre instance `MongoMemoryServer`. Pas de state partagé entre fichiers.
- **`sections-order.test.ts`** : le fichier `src/app/api/admin/[moduleId]/sections/[order]/route.ts` n'a pas été lu en détail — l'implémentation adaptera le test à sa structure réelle.
