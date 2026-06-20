# Plan A — Outils MCP de création de module

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter trois outils MCP (`create_module`, `create_section`, `edit_section`) à la route HTTP pour créer un module, ses sections et le squelette vide de ses cours/TP/examen.

**Architecture:** Outils ajoutés à la factory `buildMcpServer` dans `src/app/api/mcp/route.ts`, gatés `isAdmin`. Ils écrivent dans les collections applicatives `modules` et `course_content` (accès Mongo direct OK — pas de l'auth), réutilisent les schémas Zod existants (`moduleFormSchema`, `sectionApiSchema`) pour valider, créent des docs `course_content` vides (`source:"db"`) et invalident le cache via `revalidateTag`.

**Tech Stack:** Next.js route handler, `@modelcontextprotocol/sdk` (`server.tool`), `zod`, MongoDB driver, schémas `src/lib/schemas/*`.

**Note tests :** pas de harnais de test dans le repo (CLAUDE.md §8). Vérification par `bun run build` (typecheck strict) + appels MCP manuels une fois le serveur déployé et connecté. Pas d'ajout de Vitest.

---

## Structure des fichiers

| Fichier | Responsabilité | Action |
|---|---|---|
| `src/app/api/mcp/route.ts` | Ajout des 3 outils + helper `slugify` | **Modifier** |

Tout tient dans `route.ts` (où vivent déjà les autres outils, `loadBlocks`/`saveBlocks`, la factory). On suit ce pattern plutôt que d'éclater en nouveaux fichiers.

---

## Task 1: Helper `slugify` + outil `create_module`

**Files:**
- Modify: `src/app/api/mcp/route.ts` (imports en tête ; helper après les imports ; tool dans `buildMcpServer`)

- [ ] **Step 1: Ajouter les imports nécessaires**

En tête de `src/app/api/mcp/route.ts`, ajouter aux imports existants :
```ts
import { moduleFormSchema } from "@/lib/schemas/module.schema";
import { sectionApiSchema } from "@/lib/schemas/section.schema";
import type { ContentRef } from "@/types/CourseContent";
```
(`Block` et `CourseContent` sont déjà importés depuis `@/types/CourseContent` — ajouter `ContentRef`
à cet import existant ou via la ligne ci-dessus.)

- [ ] **Step 2: Ajouter le helper `slugify`**

Après les helpers existants (`sortChildren`), avant `buildMcpServer` :
```ts
/** Convertit un titre en slug kebab-case (a-z, 0-9, tirets). */
function slugify(input: string): string {
    return input
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")   // retire les accents
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
```

- [ ] **Step 3: Ajouter l'outil `create_module` dans `buildMcpServer`**

À l'intérieur de `buildMcpServer`, après `list_block_types` (avant `list_modules`) :
```ts
    // ── create_module ──────────────────────────────────────────────────────────
    server.tool(
        "create_module",
        "Crée un nouveau module (structure pédagogique seule, isExtra:true). Réservé aux admins.",
        {
            title:       z.string().describe("Titre affiché du module, ex: Rust"),
            iconName:    z.string().optional().describe("Nom d'icône lucide (défaut: Code)"),
            path:        z.string().optional().describe("Slug du module (défaut: dérivé du titre)"),
            description: z.string().optional(),
        },
        async ({ title, iconName, path, description }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();
            const slug = path ? slugify(path) : slugify(title);

            if (await db.collection("modules").findOne({ path: slug })) {
                throw new Error(`Un module avec le path "${slug}" existe déjà.`);
            }

            const parsed = moduleFormSchema.safeParse({
                title,
                path: slug,
                iconName: iconName ?? "Code",
                description: description ?? "",
                associatedSae: [],
                coefficients: [],
                instructors: [],
                isExtra: true,
            });
            if (!parsed.success) {
                throw new Error(`Module invalide : ${JSON.stringify(parsed.error.flatten())}`);
            }

            const r = await db.collection("modules").insertOne({
                ...parsed.data,
                sections: [],
                updatedAt: new Date().toISOString(),
            });

            return {
                content: [{
                    type: "text" as const,
                    text: `Module créé. moduleId=${r.insertedId.toString()}, path=${slug}`,
                }],
            };
        }
    );
```

- [ ] **Step 4: Vérifier le build**

Run: `bun run build`
Expected: build OK (typecheck strict, pas d'import inutilisé).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/mcp/route.ts
git commit -m "feat(mcp): outil create_module (squelette de module)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Outil `create_section`

**Files:**
- Modify: `src/app/api/mcp/route.ts` (tool dans `buildMcpServer`)

- [ ] **Step 1: Ajouter l'outil `create_section` dans `buildMcpServer`**

Juste après l'outil `create_module` :
```ts
    // ── create_section ─────────────────────────────────────────────────────────
    server.tool(
        "create_section",
        "Ajoute une section à un module + crée le squelette vide (course_content) de chaque type de contenu. Réservé aux admins.",
        {
            module:        z.string().describe("Slug du module"),
            title:         z.string().describe("Titre de la section"),
            contentTypes:  z.array(CONTENT_TYPE).min(1).describe("Types de contenu : cours | TP | examen"),
            order:         z.number().int().min(1).optional().describe("Position (défaut: max+1)"),
            path:          z.string().optional().describe("Slug de section (défaut: dérivé du titre)"),
            objectives:    z.array(z.string()).optional(),
            totalDuration: z.number().int().min(1).optional().describe("Nombre de séances (défaut: 1)"),
            tags:          z.array(z.string()).optional(),
            icon:          z.string().optional(),
        },
        async ({ module, title, contentTypes, order, path, objectives, totalDuration, tags, icon }) => {
            if (!isAdmin) throw new Error("Forbidden");
            const db = await connectToDB();

            const mod = await db.collection<{ path: string; sections?: Array<{ path: string; order?: number }> }>("modules")
                .findOne({ path: module });
            if (!mod) throw new Error(`Module "${module}" introuvable.`);

            const sectionPath = path ? slugify(path) : slugify(title);
            const sections = mod.sections ?? [];
            if (sections.some((s) => s.path === sectionPath)) {
                throw new Error(`Une section "${sectionPath}" existe déjà dans ce module.`);
            }
            const nextOrder = order ?? (sections.reduce((m, s) => Math.max(m, s.order ?? 0), 0) + 1);

            // Valide la "forme brute" (contents = types) via le schéma admin existant.
            const rawCheck = sectionApiSchema.safeParse({
                title,
                path: sectionPath,
                order: nextOrder,
                totalDuration: totalDuration ?? 1,
                hasCorrection: false,
                isAvailable: false,
                correctionIsAvailable: false,
                examenIsLock: false,
                contents: contentTypes,
                objectives: objectives ?? [],
                tags: tags ?? [],
            });
            if (!rawCheck.success) {
                throw new Error(`Section invalide : ${JSON.stringify(rawCheck.error.flatten())}`);
            }

            // Crée un course_content vide par type, construit les ContentRef.
            const now = new Date();
            const contents: ContentRef[] = [];
            for (const type of contentTypes) {
                const r = await db.collection<CourseContent>("course_content").insertOne({
                    moduleSlug: module,
                    sectionSlug: sectionPath,
                    contentType: type,
                    blocks: [],
                    version: 1,
                    createdAt: now,
                    updatedAt: now,
                });
                contents.push({ type, source: "db", contentId: r.insertedId.toString() });
            }

            const section = {
                title,
                path: sectionPath,
                order: nextOrder,
                contents,
                objectives: objectives ?? [],
                tags: tags ?? [],
                totalDuration: totalDuration ?? 1,
                hasCorrection: false,
                isAvailable: false,
                correctionIsAvailable: false,
                examenIsLock: false,
                ...(icon ? { icon } : {}),
            };

            await db.collection("modules").updateOne({ path: module }, { $push: { sections: section } });
            for (const type of contentTypes) {
                revalidateTag(`content:${module}:${sectionPath}:${type}`, { expire: 0 });
            }

            return {
                content: [{
                    type: "text" as const,
                    text: `Section "${sectionPath}" créée (order ${nextOrder}) avec ${contentTypes.join(", ")}.`,
                }],
            };
        }
    );
```

- [ ] **Step 2: Vérifier le build**

Run: `bun run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/mcp/route.ts
git commit -m "feat(mcp): outil create_section (+ squelette course_content vide)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Outil `edit_section`

**Files:**
- Modify: `src/app/api/mcp/route.ts` (tool dans `buildMcpServer`)

- [ ] **Step 1: Ajouter l'outil `edit_section` dans `buildMcpServer`**

Juste après l'outil `create_section` :
```ts
    // ── edit_section ───────────────────────────────────────────────────────────
    server.tool(
        "edit_section",
        "Édite les métadonnées d'une section (rename, nb séances, ordre, objectifs, flags). addContentTypes est ADDITIF (crée le squelette des types manquants) ; le retrait passe par delete_content. Réservé aux admins.",
        {
            module:                z.string(),
            sectionPath:           z.string().describe("Slug de la section à éditer"),
            title:                 z.string().optional(),
            newPath:               z.string().optional().describe("Nouveau slug (cascade sur course_content)"),
            order:                 z.number().int().min(1).optional(),
            objectives:            z.array(z.string()).optional(),
            totalDuration:         z.number().int().min(1).optional(),
            tags:                  z.array(z.string()).optional(),
            icon:                  z.string().optional(),
            isAvailable:           z.boolean().optional(),
            hasCorrection:         z.boolean().optional(),
            correctionIsAvailable: z.boolean().optional(),
            examenIsLock:          z.boolean().optional(),
            addContentTypes:       z.array(CONTENT_TYPE).optional().describe("Types à AJOUTER (additif)"),
        },
        async (args) => {
            if (!isAdmin) throw new Error("Forbidden");
            const { module, sectionPath, newPath, addContentTypes } = args;
            const db = await connectToDB();

            const mod = await db.collection<{ sections?: Array<{ path: string; contents?: ContentRef[] }> }>("modules")
                .findOne({ path: module });
            if (!mod) throw new Error(`Module "${module}" introuvable.`);
            const sections = mod.sections ?? [];
            const idx = sections.findIndex((s) => s.path === sectionPath);
            if (idx === -1) throw new Error(`Section "${sectionPath}" introuvable.`);
            const current = sections[idx];

            const set: Record<string, unknown> = {};
            const meta: Array<[string, unknown]> = [
                ["title", args.title], ["order", args.order], ["objectives", args.objectives],
                ["totalDuration", args.totalDuration], ["tags", args.tags], ["icon", args.icon],
                ["isAvailable", args.isAvailable], ["hasCorrection", args.hasCorrection],
                ["correctionIsAvailable", args.correctionIsAvailable], ["examenIsLock", args.examenIsLock],
            ];
            for (const [field, value] of meta) {
                if (value !== undefined) set[`sections.${idx}.${field}`] = value;
            }

            // Slug effectif des nouveaux course_content (tient compte d'un rename simultané).
            const effectivePath = newPath ? slugify(newPath) : sectionPath;

            // addContentTypes : additif seul.
            const existingTypes = new Set((current.contents ?? []).map((c) => c.type));
            if (addContentTypes?.length) {
                const now = new Date();
                const refs: ContentRef[] = [...(current.contents ?? [])];
                for (const type of addContentTypes) {
                    if (existingTypes.has(type)) continue;
                    const r = await db.collection<CourseContent>("course_content").insertOne({
                        moduleSlug: module, sectionSlug: effectivePath, contentType: type,
                        blocks: [], version: 1, createdAt: now, updatedAt: now,
                    });
                    refs.push({ type, source: "db", contentId: r.insertedId.toString() });
                }
                set[`sections.${idx}.contents`] = refs;
            }

            // Rename de path : cascade sur les course_content existants.
            if (newPath && effectivePath !== sectionPath) {
                if (sections.some((s) => s.path === effectivePath)) {
                    throw new Error(`Le path "${effectivePath}" est déjà pris dans ce module.`);
                }
                set[`sections.${idx}.path`] = effectivePath;
                await db.collection("course_content").updateMany(
                    { moduleSlug: module, sectionSlug: sectionPath },
                    { $set: { sectionSlug: effectivePath } }
                );
            }

            if (Object.keys(set).length === 0) {
                return { content: [{ type: "text" as const, text: "Rien à modifier." }] };
            }
            await db.collection("modules").updateOne({ path: module }, { $set: set });

            // Invalide l'ancien et le nouveau slug pour tous les types concernés.
            const types = new Set<string>([...existingTypes, ...(addContentTypes ?? [])]);
            for (const t of types) {
                revalidateTag(`content:${module}:${sectionPath}:${t}`, { expire: 0 });
                if (effectivePath !== sectionPath) {
                    revalidateTag(`content:${module}:${effectivePath}:${t}`, { expire: 0 });
                }
            }

            return {
                content: [{
                    type: "text" as const,
                    text: `Section "${sectionPath}" mise à jour${effectivePath !== sectionPath ? ` (renommée en "${effectivePath}")` : ""}.`,
                }],
            };
        }
    );
```

- [ ] **Step 2: Vérifier le build**

Run: `bun run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/mcp/route.ts
git commit -m "feat(mcp): outil edit_section (métadonnées + addContentTypes additif + cascade rename)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Vérification manuelle (MCP connecté)

À faire une fois le serveur MCP déployé et connecté (dépend du travail Scalekit, en pause). Pas de
code : validation fonctionnelle des 3 outils.

- [ ] **Step 1: create_module**

Appeler `create_module` avec `title:"Rust"`. Vérifier le retour `moduleId`/`path=rust`, puis
`list_modules` contient `rust`. Rappeler `create_module` avec le même titre → erreur « existe déjà ».

- [ ] **Step 2: create_section**

Appeler `create_section` `module:"rust", title:"Ownership", contentTypes:["cours","TP"]`.
Vérifier : `list_sections("rust")` montre la section avec `cours:db` et `TP:db` ; `get_content("rust","ownership","cours")` renvoie `blocks:[]`, `source:"db"`.

- [ ] **Step 3: edit_section (métadonnées + additif)**

`edit_section module:"rust", sectionPath:"ownership", totalDuration:3, addContentTypes:["examen"]`.
Vérifier : `totalDuration` passé à 3 ; un `examen` db ajouté ; les `cours`/`TP` existants intacts.

- [ ] **Step 4: edit_section (cascade rename)**

`edit_section module:"rust", sectionPath:"ownership", newPath:"propriete"`.
Vérifier : la section a `path:"propriete"` ; `get_content("rust","propriete","cours")` renvoie le
contenu (le `sectionSlug` des course_content a bien suivi) ; l'ancien `ownership` ne renvoie plus rien.

---

## Auto-revue (effectuée à l'écriture)

- **Couverture spec** : §4.1 → Task 1 ; §4.2 → Task 2 ; §4.3 (métadonnées + addContentTypes additif +
  cascade newPath) → Task 3 ; vérif §8 → Task 4. OK.
- **Placeholders** : aucun TODO/TBD ; tout le code des 3 outils est explicite.
- **Cohérence des types** : `CONTENT_TYPE` (déjà défini dans route.ts) réutilisé ; `ContentRef`/
  `CourseContent` importés de `@/types/CourseContent` ; `slugify` défini en Task 1 et utilisé en
  Tasks 2-3 ; `isAdmin`/`connectToDB`/`revalidateTag` déjà présents dans le module. OK.
- **Note** : `create_section`/`edit_section` créent les `course_content` directement (pas via
  `saveBlocks`, qui suppose une section déjà existante avec arrayFilters) — choix assumé.
