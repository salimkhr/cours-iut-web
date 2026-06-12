# Image Upload Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le champ URL texte du bloc `image-card` par un widget d'upload avec drag & drop, progress bar XHR, aperçu, et pipeline ClamAV/sharp identique à l'upload avatar.

**Architecture:** 2 nouvelles routes API (`POST /api/admin/content/upload-image` et `GET /api/course-image/[filename]`), 1 nouveau composant `ImageUploadField`, et 2 modifications minimes (`DynamicPropsEditor` + `blockRegistry`). Aucune nouvelle dépendance — tout repose sur `src/lib/upload/` existant.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, React 19, Tailwind v4, shadcn/ui (`Label`, `Button`), Lucide React, XHR natif (pour `onprogress`), `withAdmin` HOC.

---

## Fichiers

| Action | Fichier |
|---|---|
| Créer | `src/app/api/admin/content/upload-image/route.ts` |
| Créer | `src/app/api/course-image/[filename]/route.ts` |
| Créer | `src/components/builder/ImageUploadField.tsx` |
| Modifier | `src/lib/blockRegistry.tsx` (type union + champs `image-card`) |
| Modifier | `src/components/builder/DynamicPropsEditor.tsx` (cas `"image-upload"`) |

---

## Task 1 : Route POST `/api/admin/content/upload-image`

**Files:**
- Create: `src/app/api/admin/content/upload-image/route.ts`

Pipeline identique à `src/app/api/upload-avatar/route.ts` : FormData → taille → buffer → `detectMime` → `scanWithClamAV` → `reencodeImage` → `storeFinal("course-images")`.

- [ ] **Créer le fichier avec le contenu suivant**

```ts
import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import { UPLOAD_CONFIG } from "@/lib/upload/config";
import { detectMime } from "@/lib/upload/mime";
import { scanWithClamAV } from "@/lib/upload/scanner";
import { isImage, reencodeImage } from "@/lib/upload/processor";
import { storeFinal, storeQuarantine } from "@/lib/upload/storage";

export const POST = withAdmin(async (req: Request) => {
    // ── 1. Parse form data ────────────────────────────────────────────────────
    let formData: FormData;
    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "Champ 'file' manquant" }, { status: 400 });
    }

    // ── 2. Taille ─────────────────────────────────────────────────────────────
    if (file.size === 0) {
        return NextResponse.json({ error: "Fichier vide" }, { status: 400 });
    }
    if (file.size > UPLOAD_CONFIG.maxBytes) {
        return NextResponse.json(
            { error: `Fichier trop volumineux (max ${UPLOAD_CONFIG.maxBytes / 1024 / 1024} Mo)` },
            { status: 413 },
        );
    }

    // ── 3. Buffer ─────────────────────────────────────────────────────────────
    const buf = Buffer.from(await file.arrayBuffer());

    // ── 4. Détection MIME ─────────────────────────────────────────────────────
    const mime = detectMime(buf);
    if (!mime) {
        return NextResponse.json({ error: "Type de fichier non reconnu" }, { status: 415 });
    }
    if (UPLOAD_CONFIG.blockedMimes.has(mime)) {
        return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 415 });
    }
    if (!UPLOAD_CONFIG.allowedMimes.has(mime)) {
        return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 415 });
    }

    // ── 5. Scan ClamAV ────────────────────────────────────────────────────────
    const scan = await scanWithClamAV(buf);
    if ("error" in scan) {
        console.error(`[UPLOAD-IMAGE] ClamAV erreur: ${scan.error}`);
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json(
                { error: "Scan antivirus indisponible, réessayez plus tard" },
                { status: 503 },
            );
        }
        console.warn("[UPLOAD-IMAGE] Scan ignoré (mode dev)");
    } else if (!scan.clean) {
        await storeQuarantine(buf, scan.virus);
        console.warn(`[UPLOAD-IMAGE] Fichier infecté: ${scan.virus}`);
        return NextResponse.json({ error: "Fichier infecté détecté" }, { status: 422 });
    }

    // ── 6. Re-encodage ────────────────────────────────────────────────────────
    let finalBuf: Buffer<ArrayBufferLike> = buf;
    let ext: string;

    if (isImage(mime)) {
        try {
            const result = await reencodeImage(buf, mime);
            finalBuf = result.buffer;
            ext = result.ext;
        } catch (err) {
            console.error(`[UPLOAD-IMAGE] Erreur re-encodage:`, err);
            return NextResponse.json({ error: "Image invalide ou corrompue" }, { status: 422 });
        }
    } else {
        ext = mime.split("/")[1]?.replace(/[^a-z0-9]/g, "") ?? "bin";
    }

    // ── 7. Stockage ───────────────────────────────────────────────────────────
    const filename = await storeFinal(finalBuf, ext, "course-images");
    console.log(`[UPLOAD-IMAGE] OK — ${filename} (${mime}, ${finalBuf.length} o)`);

    return NextResponse.json({ url: `/api/course-image/${filename}` });
});
```

- [ ] **Vérifier le lint**

```powershell
bun run lint 2>&1 | Select-String "upload-image"
```

Résultat attendu : aucune ligne d'erreur sur ce fichier.

- [ ] **Commit**

```powershell
git add src/app/api/admin/content/upload-image/route.ts
git commit -m "feat(builder): route POST /api/admin/content/upload-image"
```

---

## Task 2 : Route GET `/api/course-image/[filename]`

**Files:**
- Create: `src/app/api/course-image/[filename]/route.ts`

Identique à `src/app/api/avatar/[filename]/route.ts` sauf : lecture depuis `UPLOADS_DIR/course-images/` et cache public immutable.

- [ ] **Créer le répertoire et le fichier**

Créer `src/app/api/course-image/[filename]/route.ts` avec le contenu :

```ts
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
    jpg:  "image/jpeg",
    png:  "image/png",
    webp: "image/webp",
    gif:  "image/gif",
};

// UUID v4 + extension connue — ex: 550e8400-e29b-41d4-a716-446655440000.jpg
const SAFE_FILENAME = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}\.[a-z]{2,4}$/i;

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ filename: string }> },
) {
    const { filename } = await params;

    if (!SAFE_FILENAME.test(filename)) {
        return new NextResponse(null, { status: 400 });
    }

    const ext = filename.split(".").pop()!.toLowerCase();
    const contentType = MIME[ext];
    if (!contentType) {
        return new NextResponse(null, { status: 415 });
    }

    try {
        const uploadsDir = process.env.UPLOADS_DIR;
        if (!uploadsDir) throw new Error("Variable d'environnement manquante : UPLOADS_DIR");
        const filePath = path.join(uploadsDir, "course-images", filename);
        const buffer = await readFile(filePath);

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": "inline",
                "Cache-Control": "public, max-age=31536000, immutable",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch {
        return new NextResponse(null, { status: 404 });
    }
}
```

- [ ] **Vérifier le lint**

```powershell
bun run lint 2>&1 | Select-String "course-image"
```

Résultat attendu : aucune ligne d'erreur sur ce fichier.

- [ ] **Commit**

```powershell
git add src/app/api/course-image/[filename]/route.ts
git commit -m "feat(builder): route GET /api/course-image/[filename]"
```

---

## Task 3 : Composant `ImageUploadField`

**Files:**
- Create: `src/components/builder/ImageUploadField.tsx`

Widget avec 4 états (`empty` / `uploading` / `success` / `error`) et progress bar via XHR (car `fetch` natif ne supporte pas `onprogress` en upload).

- [ ] **Créer `src/components/builder/ImageUploadField.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { ImageIcon, X, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
}

type UploadState = "empty" | "uploading" | "success" | "error";

export function ImageUploadField({ value, onChange, label }: ImageUploadFieldProps) {
    const [state, setState] = useState<UploadState>(value ? "success" : "empty");
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function upload(file: File) {
        setState("uploading");
        setProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
                setProgress(Math.round((e.loaded / e.total) * 100));
            }
        });

        xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const data = JSON.parse(xhr.responseText) as { url: string };
                onChange(data.url);
                setState("success");
            } else {
                let msg = "Erreur lors de l'envoi";
                try {
                    const data = JSON.parse(xhr.responseText) as { error?: string };
                    if (data.error) msg = data.error;
                } catch { /* responseText non-JSON */ }
                setError(msg);
                setState("error");
            }
        });

        xhr.addEventListener("error", () => {
            setError("Erreur réseau");
            setState("error");
        });

        xhr.open("POST", "/api/admin/content/upload-image");
        xhr.send(formData);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) upload(file);
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) upload(file);
        e.target.value = "";
    }

    function handleRemove() {
        onChange("");
        setState("empty");
        setError(null);
        setProgress(0);
    }

    const dropZoneCls = cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer select-none",
        dragOver
            ? "border-brand-primary bg-brand-primary/5"
            : "border-bridge-400/40 dark:border-bridge-500/35 hover:border-brand-primary/50 hover:bg-brand-primary/5",
    );

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <Label className="text-sm font-semibold text-brand-dark dark:text-bridge-200">
                    {label}
                </Label>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
            />

            {state === "empty" && (
                <div
                    className={dropZoneCls}
                    onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
                    aria-label="Zone de dépôt d'image — cliquez ou glissez un fichier"
                >
                    <ImageIcon className="w-8 h-8 text-bridge-400 dark:text-bridge-500" />
                    <p className="text-sm text-bridge-500 dark:text-bridge-400 text-center">
                        Glissez une image ou{" "}
                        <span className="text-brand-primary font-medium">cliquez pour parcourir</span>
                    </p>
                    <p className="text-xs text-bridge-400 dark:text-bridge-500">
                        JPEG · PNG · WebP · GIF — max 10 Mo
                    </p>
                </div>
            )}

            {state === "uploading" && (
                <div className="rounded-lg border border-bridge-400/40 dark:border-bridge-500/35 p-4 flex flex-col gap-2">
                    <p className="text-sm text-bridge-600 dark:text-bridge-300">Envoi en cours…</p>
                    <div className="w-full h-1.5 bg-bridge-200 dark:bg-bridge-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-primary rounded-full transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-bridge-400 dark:text-bridge-500 text-right">
                        {progress} %
                    </p>
                </div>
            )}

            {state === "success" && (
                <div className="rounded-lg border border-bridge-400/40 dark:border-bridge-500/35 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={value}
                        alt="Aperçu de l'image uploadée"
                        className="w-full object-cover max-h-48"
                    />
                    <div className="p-2 flex justify-end border-t border-bridge-400/20 dark:border-bridge-500/20">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleRemove}
                        >
                            <X className="w-3.5 h-3.5" /> Supprimer
                        </Button>
                    </div>
                </div>
            )}

            {state === "error" && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex flex-col gap-2">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="self-start h-7 text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                        onClick={() => { setState("empty"); setError(null); }}
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Réessayer
                    </Button>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Vérifier le lint**

```powershell
bun run lint 2>&1 | Select-String "ImageUploadField"
```

Résultat attendu : aucune ligne d'erreur.

- [ ] **Commit**

```powershell
git add src/components/builder/ImageUploadField.tsx
git commit -m "feat(builder): composant ImageUploadField — drop zone + progress XHR + aperçu"
```

---

## Task 4 : Modifier `blockRegistry.tsx` — type union + champs `image-card`

**Files:**
- Modify: `src/lib/blockRegistry.tsx`

Deux changements atomiques :
1. Étendre le type union de `FieldDef["type"]` avec `"image-upload"`
2. Remplacer le champ `src` de `image-card` (type `"text"`) par `type: "image-upload"`

- [ ] **Étendre le type union dans `FieldDef` (ligne ~28)**

Localiser cette ligne dans `src/lib/blockRegistry.tsx` :
```ts
    type: "text" | "textarea" | "number" | "select" | "boolean" | "array-of-strings";
```

La remplacer par :
```ts
    type: "text" | "textarea" | "number" | "select" | "boolean" | "array-of-strings" | "image-upload";
```

- [ ] **Mettre à jour les champs de `image-card` (~ligne 241–244)**

Localiser le bloc `fields` de `image-card` :
```ts
        fields: [
            { key: "src", label: "URL de l'image", type: "text", placeholder: "/images/..." },
            { key: "title", label: "Titre / légende", type: "text" },
        ],
```

Le remplacer par :
```ts
        fields: [
            { key: "src", label: "Image", type: "image-upload" },
            { key: "title", label: "Titre / légende", type: "text" },
        ],
```

- [ ] **Vérifier le lint**

```powershell
bun run lint 2>&1 | Select-String "blockRegistry"
```

Résultat attendu : aucune ligne d'erreur.

- [ ] **Commit**

```powershell
git add src/lib/blockRegistry.tsx
git commit -m "feat(builder): image-card — champ src devient type image-upload"
```

---

## Task 5 : Modifier `DynamicPropsEditor.tsx` — cas `"image-upload"`

**Files:**
- Modify: `src/components/builder/DynamicPropsEditor.tsx`

Ajouter l'import de `ImageUploadField` et le cas `"image-upload"` dans la chaîne if/else, **avant** le cas par défaut (`// Défaut : text`).

- [ ] **Ajouter l'import de `ImageUploadField`**

En haut du fichier, après les imports existants de composants builder, ajouter :
```ts
import { ImageUploadField } from "@/components/builder/ImageUploadField";
```

La ligne d'import s'insère après :
```ts
import { InlineTextEditor } from "@/components/builder/InlineTextEditor";
```

- [ ] **Ajouter le cas `"image-upload"` avant le défaut**

Localiser le commentaire `// Défaut : text` dans `DynamicPropsEditor` (vers la fin de la fonction `return`). Insérer le bloc suivant **juste avant** ce commentaire :

```tsx
                if (field.type === "image-upload") {
                    return (
                        <ImageUploadField
                            key={field.key}
                            value={String(props[field.key] ?? "")}
                            onChange={(url) => set(field.key, url)}
                            label={field.label}
                        />
                    );
                }
```

- [ ] **Vérifier le lint**

```powershell
bun run lint 2>&1 | Select-String "DynamicPropsEditor"
```

Résultat attendu : aucune ligne d'erreur.

- [ ] **Vérifier le build TypeScript**

```powershell
bun run build 2>&1 | Select-String -Pattern "error|Error" | Select-Object -First 20
```

Résultat attendu : aucune erreur TypeScript (warnings de build OK).

- [ ] **Commit**

```powershell
git add src/components/builder/DynamicPropsEditor.tsx
git commit -m "feat(builder): DynamicPropsEditor — cas image-upload → ImageUploadField"
```

---

## Task 6 : Vérification manuelle end-to-end

- [ ] **Démarrer le serveur de développement**

```powershell
bun dev
```

- [ ] **Tests manuels à effectuer dans le navigateur**

1. Ouvrir le builder sur un cours → insérer un bloc **Image** → le PropsPanel doit afficher une drop zone (pas de champ URL texte).
2. Drag & drop d'un JPEG → voir la progress bar → l'aperçu apparaît dans le PropsPanel ET dans le canvas.
3. Cliquer sur la zone → le sélecteur de fichier s'ouvre.
4. Bouton **Supprimer** → retour à la drop zone, `src` vidé dans le canvas.
5. Rouvrir un bloc Image existant avec `src` renseigné → l'aperçu s'affiche directement (état `success`).
6. Tester avec un fichier > 10 Mo → message « Fichier trop volumineux ».
7. Tester avec un `.txt` → message « Type de fichier non autorisé ».
8. En dev : vérifier dans la console que le warn ClamAV ignoré s'affiche et que l'upload réussit quand même.

- [ ] **Commit final si des ajustements visuels ont été faits**

```powershell
git add -p
git commit -m "fix(builder): ajustements visuels ImageUploadField"
```
