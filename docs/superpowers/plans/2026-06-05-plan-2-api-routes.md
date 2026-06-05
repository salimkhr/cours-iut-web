# Cours Builder — Plan 2 : API Routes + Cache

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer les 5 API Routes admin pour lire/écrire le contenu, la fonction `getContentBlocks` avec cache `unstable_cache`, et l'index MongoDB sur `course_content`.

**Architecture:** Toutes les routes sont sous `/api/admin/content/`, protégées par `withAdmin`. La route `[module]/[section]/[type]` gère GET + PUT + DELETE. Le PUT upsert le document `course_content` ET met à jour le ref dans `modules`. `revalidateTag` invalide le cache après chaque écriture.

**Tech Stack:** Next.js `unstable_cache` + `revalidateTag`, MongoDB driver, Zod (via `blockRegistry`), `withAdmin`.

**Prérequis :** Plan 1 complété (types `Block`, `CourseContent`, `ContentRef`, `blockRegistry` disponibles).

---

### Task 1 : `getContentBlocks` avec `unstable_cache`

**Files:**
- Create: `src/lib/getContentBlocks.ts`

- [ ] **Créer `src/lib/getContentBlocks.ts`**

```typescript
import { unstable_cache } from "next/cache";
import { connectToDB } from "@/lib/mongodb";
import type { CourseContent } from "@/types/CourseContent";

export function getContentBlocks(
    moduleSlug: string,
    sectionSlug: string,
    contentType: string
): Promise<CourseContent | null> {
    return unstable_cache(
        async () => {
            const db = await connectToDB();
            const doc = await db
                .collection<CourseContent>("course_content")
                .findOne({ moduleSlug, sectionSlug, contentType });
            if (!doc) return null;
            return { ...doc, _id: doc._id?.toString() };
        },
        [`content-${moduleSlug}-${sectionSlug}-${contentType}`],
        { tags: [`content:${moduleSlug}:${sectionSlug}:${contentType}`] }
    )();
}
```

> **Note :** `_id` est converti en string avant de retourner pour la sérialisation JSON (règle MongoDB du CLAUDE.md).

- [ ] **Vérifier la compilation**

```bash
bun run lint
```
Attendu : aucune erreur sur `src/lib/getContentBlocks.ts`.

- [ ] **Commit**

```bash
git add src/lib/getContentBlocks.ts
git commit -m "feat(builder): add getContentBlocks with unstable_cache"
```

---

### Task 2 : Route `[module]/[section]/[type]` — GET + PUT + DELETE

**Files:**
- Create: `src/app/api/admin/content/[module]/[section]/[type]/route.ts`

- [ ] **Créer le répertoire et le fichier**

```bash
mkdir -p src/app/api/admin/content/\[module\]/\[section\]/\[type\]
```

- [ ] **Créer `src/app/api/admin/content/[module]/[section]/[type]/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { ObjectId } from "bson";
import { revalidateTag } from "next/cache";
import { connectToDB } from "@/lib/mongodb";
import { withAdmin } from "@/lib/withAdmin";
import { getBlockDefinition } from "@/lib/blockRegistry";
import type { Block, CourseContent } from "@/types/CourseContent";

type Ctx = { params: Promise<{ module: string; section: string; type: string }> };

// ── GET ──────────────────────────────────────────────────────────────────────

export const GET = withAdmin<Ctx>(async (
    _req: Request,
    { params }: Ctx
) => {
    try {
        const { module: moduleSlug, section: sectionSlug, type: contentType } = await params;
        const db = await connectToDB();
        const doc = await db
            .collection<CourseContent>("course_content")
            .findOne({ moduleSlug, sectionSlug, contentType });

        if (!doc) {
            return NextResponse.json({ blocks: [], source: "file" }, { status: 200 });
        }

        return NextResponse.json({
            contentId: doc._id?.toString(),
            blocks: doc.blocks,
            version: doc.version,
            updatedAt: doc.updatedAt,
            source: "db",
        });
    } catch (error) {
        console.error("[content GET]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
});

// ── PUT ──────────────────────────────────────────────────────────────────────

export const PUT = withAdmin<Ctx>(async (
    req: Request,
    { params }: Ctx
) => {
    try {
        const { module: moduleSlug, section: sectionSlug, type: contentType } = await params;
        const body = await req.json() as { blocks: Block[] };

        if (!Array.isArray(body?.blocks)) {
            return NextResponse.json({ error: "blocks[] requis" }, { status: 400 });
        }

        // Validation Zod bloc par bloc
        for (const block of body.blocks) {
            const def = getBlockDefinition(block.type);
            if (!def) {
                return NextResponse.json(
                    { error: `Type de bloc inconnu : ${block.type}` },
                    { status: 400 }
                );
            }
            const result = def.schema.safeParse(block.props);
            if (!result.success) {
                return NextResponse.json(
                    { error: `Bloc ${block.id} invalide`, details: result.error.flatten() },
                    { status: 400 }
                );
            }
        }

        const db = await connectToDB();
        const now = new Date();

        // Upsert course_content
        const existing = await db
            .collection<CourseContent>("course_content")
            .findOne({ moduleSlug, sectionSlug, contentType });

        let contentId: string;

        if (existing) {
            await db.collection<CourseContent>("course_content").updateOne(
                { _id: existing._id },
                {
                    $set: { blocks: body.blocks, updatedAt: now },
                    $inc: { version: 1 },
                }
            );
            contentId = existing._id!.toString();
        } else {
            const result = await db.collection<CourseContent>("course_content").insertOne({
                moduleSlug,
                sectionSlug,
                contentType: contentType as "cours" | "TP" | "examen",
                blocks: body.blocks,
                version: 1,
                createdAt: now,
                updatedAt: now,
            });
            contentId = result.insertedId.toString();
        }

        // Mettre à jour modules.sections[].contents[]
        await db.collection("modules").updateOne(
            { path: moduleSlug },
            {
                $set: {
                    "sections.$[s].contents.$[c].source": "db",
                    "sections.$[s].contents.$[c].contentId": contentId,
                },
            },
            {
                arrayFilters: [
                    { "s.path": sectionSlug },
                    { "c.type": contentType },
                ],
            }
        );

        revalidateTag(`content:${moduleSlug}:${sectionSlug}:${contentType}`);

        const updated = await db
            .collection<CourseContent>("course_content")
            .findOne({ moduleSlug, sectionSlug, contentType });

        return NextResponse.json({
            contentId,
            version: updated?.version ?? 1,
            updatedAt: updated?.updatedAt ?? now,
        });
    } catch (error) {
        console.error("[content PUT]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
});

// ── DELETE ────────────────────────────────────────────────────────────────────

export const DELETE = withAdmin<Ctx>(async (
    _req: Request,
    { params }: Ctx
) => {
    try {
        const { module: moduleSlug, section: sectionSlug, type: contentType } = await params;
        const db = await connectToDB();

        await db.collection<CourseContent>("course_content").deleteOne(
            { moduleSlug, sectionSlug, contentType }
        );

        // Repasser source à "file" dans modules
        await db.collection("modules").updateOne(
            { path: moduleSlug },
            {
                $set: { "sections.$[s].contents.$[c].source": "file" },
                $unset: { "sections.$[s].contents.$[c].contentId": "" },
            },
            {
                arrayFilters: [
                    { "s.path": sectionSlug },
                    { "c.type": contentType },
                ],
            }
        );

        revalidateTag(`content:${moduleSlug}:${sectionSlug}:${contentType}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[content DELETE]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
});
```

- [ ] **Vérifier la compilation**

```bash
bun run lint
```
Attendu : 0 erreur TypeScript.

- [ ] **Commit**

```bash
git add "src/app/api/admin/content/[module]/[section]/[type]/route.ts"
git commit -m "feat(builder): add content GET/PUT/DELETE API routes"
```

---

### Task 3 : Route `block-types` — liste du registre

**Files:**
- Create: `src/app/api/admin/content/block-types/route.ts`

- [ ] **Créer `src/app/api/admin/content/block-types/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import { getAllBlockDefinitions } from "@/lib/blockRegistry";

export const GET = withAdmin(async () => {
    const definitions = getAllBlockDefinitions();
    const types = definitions.map(({ type, label, defaultProps, fields }) => ({
        type,
        label,
        defaultProps,
        fields,
    }));
    return NextResponse.json({ types });
});
```

- [ ] **Tester manuellement**

Démarrer `bun dev`, puis dans un terminal :

```bash
curl -s http://localhost:3000/api/admin/content/block-types \
  -H "Cookie: <cookie de session admin>"
```
Attendu : JSON avec un tableau `types` de 7 entrées (text, heading, list, image-card, table, section-card, named-component).

- [ ] **Commit**

```bash
git add "src/app/api/admin/content/block-types/route.ts"
git commit -m "feat(builder): add block-types API route"
```

---

### Task 4 : Route `status` — état de migration

**Files:**
- Create: `src/app/api/admin/content/status/route.ts`

- [ ] **Créer `src/app/api/admin/content/status/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import { connectToDB } from "@/lib/mongodb";
import type { ContentRef } from "@/types/CourseContent";

type StatusMap = Record<string, Record<string, Record<string, string>>>;

export const GET = withAdmin(async () => {
    try {
        const db = await connectToDB();
        const modules = await db.collection("modules").find({}, {
            projection: { path: 1, sections: 1 }
        }).toArray();

        const status: StatusMap = {};

        for (const mod of modules) {
            status[mod.path] = {};
            for (const section of (mod.sections ?? [])) {
                status[mod.path][section.path] = {};
                for (const content of (section.contents ?? []) as ContentRef[]) {
                    status[mod.path][section.path][content.type] =
                        (content as { source?: string }).source ?? "file";
                }
            }
        }

        return NextResponse.json(status);
    } catch (error) {
        console.error("[content status]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
});
```

- [ ] **Tester manuellement**

```bash
curl -s http://localhost:3000/api/admin/content/status \
  -H "Cookie: <cookie de session admin>" | jq .
```
Attendu : JSON avec la structure `{ javascript: { "1-le-dom": { cours: "file", TP: "file" } } }`.

- [ ] **Commit**

```bash
git add "src/app/api/admin/content/status/route.ts"
git commit -m "feat(builder): add migration status API route"
```

---

### Task 5 : Index MongoDB sur `course_content`

**Files:**
- Create: `src/scripts/create-content-index.ts`

- [ ] **Créer `src/scripts/create-content-index.ts`**

```typescript
import { connectToDB } from "@/lib/mongodb";

async function createIndex() {
    const db = await connectToDB();
    await db.collection("course_content").createIndex(
        { moduleSlug: 1, sectionSlug: 1, contentType: 1 },
        { unique: true, name: "unique_content_ref" }
    );
    console.log("Index course_content créé.");
    process.exit(0);
}

createIndex().catch((err) => {
    console.error("Erreur :", err);
    process.exit(1);
});
```

- [ ] **Exécuter le script**

```bash
bun run tsx src/scripts/create-content-index.ts
```
Attendu : `Index course_content créé.`

> **Note :** Ce script est idempotent — si l'index existe déjà, MongoDB le signale mais ne renvoie pas d'erreur.

- [ ] **Commit**

```bash
git add src/scripts/create-content-index.ts
git commit -m "feat(builder): add MongoDB index script for course_content"
```

---

### Task 6 : Vérification finale

- [ ] **Build complet**

```bash
bun run build
```
Attendu : build réussi, 0 erreur TypeScript.

- [ ] **Test manuel PUT** : avec `bun dev`, envoyer un PUT sur `/api/admin/content/javascript/1-le-dom/cours` avec `{ "blocks": [] }` et vérifier que la réponse contient `contentId`, `version`, `updatedAt`.

- [ ] **Vérifier l'invalidation de cache** : après un PUT, vérifier dans les logs Next.js que `revalidateTag` est appelé (`Revalidating tag content:javascript:1-le-dom:cours`).
