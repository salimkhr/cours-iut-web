# Image Upload dans le Builder — Design Spec
Date : 2026-06-12

## Contexte

Le bloc `image-card` du builder accepte actuellement uniquement une URL saisie manuellement dans le PropsPanel. Cette spec décrit l'ajout d'un mécanisme d'upload direct (drag & drop ou clic), avec scan ClamAV en production, re-encodage et stockage sur le serveur.

## Objectif

Remplacer le champ `src` texte libre de `image-card` par un widget `ImageUploadField` dans le PropsPanel : drop zone, aperçu, progress bar, gestion d'erreur.

---

## Architecture

### Fichiers (5)

| Fichier | Action |
|---|---|
| `src/app/api/admin/content/upload-image/route.ts` | Créer — route upload admin |
| `src/app/api/course-image/[filename]/route.ts` | Créer — route serving images cours |
| `src/components/builder/ImageUploadField.tsx` | Créer — widget upload |
| `src/components/builder/DynamicPropsEditor.tsx` | Modifier — cas `"image-upload"` |
| `src/lib/blockRegistry.tsx` | Modifier — champ `src` de `image-card` |

### Aucune nouvelle dépendance

Tout repose sur l'infrastructure existante : `src/lib/upload/` (config, mime, scanner, processor, storage).

---

## Route `POST /api/admin/content/upload-image`

**Auth :** `withAdmin` (admin uniquement).

**Pipeline identique à `/api/upload-avatar` :**
1. Parse `FormData` → champ `file`
2. Vérification taille (max `UPLOAD_CONFIG.maxBytes` = 10 Mo)
3. Lecture buffer
4. `detectMime(buf)` — refus si bloqué ou non autorisé
5. `scanWithClamAV(buf)` — ignoré si `NODE_ENV !== "production"`, bloquant sinon
6. `reencodeImage(buf, mime)` — re-encodage sharp
7. `storeFinal(buf, ext, "course-images")` → `UPLOADS_DIR/course-images/{uuid}.{ext}`

**Réponse succès :** `{ url: "/api/course-image/{filename}" }`

**Réponses erreur :** reprend exactement les codes/messages de la route avatar (400, 413, 415, 422, 503).

---

## Route `GET /api/course-image/[filename]`

**Auth :** aucune (images publiques une fois uploadées — accessibles aux étudiants).

**Identique à `/api/avatar/[filename]` sauf :**
- Lit depuis `UPLOADS_DIR/course-images/{filename}`
- Cache : `public, max-age=31536000, immutable` (UUID immuable → cache agressif OK)

**Validation filename :** même regex UUID v4 + extension.

---

## Composant `ImageUploadField`

### Interface

```ts
interface ImageUploadFieldProps {
    value: string;                    // props.src actuel
    onChange: (url: string) => void;  // met à jour props.src
    label?: string;
}
```

### États

| État | Condition | UI |
|---|---|---|
| `empty` | `value === ""` | Drop zone + texte d'aide + formats acceptés |
| `uploading` | fetch en cours | Spinner + "Envoi en cours…" + progress bar (0–100 %) |
| `success` | `value !== ""` | Aperçu image pleine largeur + bouton "Supprimer" |
| `error` | fetch échoué | Message d'erreur rouge + bouton "Réessayer" |

### Comportements

- **Drop zone :** `onDragEnter/Leave/Over/Drop` — fond teinté au survol
- **Clic :** déclenche `<input type="file" accept="image/jpeg,image/png,image/webp,image/gif">` caché via `ref`
- **Upload :** `fetch("/api/admin/content/upload-image", { method: "POST", body: formData })`
- **Progress :** `XMLHttpRequest` avec `onprogress` pour lire le pourcentage réel
- **Succès :** `onChange(data.url)` → le canvas relit `props.src` → `ImageCard` ré-affiche
- **Suppression :** `onChange("")` → retour à l'état `empty`
- **Erreur :** affiche `data.error` depuis la réponse JSON

### Note sur la progress bar

`fetch` natif ne supporte pas `onprogress` en upload. Le composant utilise `XMLHttpRequest` pour avoir un vrai pourcentage (`xhr.upload.addEventListener("progress", …)`).

---

## Modifications `DynamicPropsEditor`

Ajouter le type `"image-upload"` à l'union `FieldDef["type"]` dans `blockRegistry.tsx` et le cas correspondant dans `DynamicPropsEditor` :

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

---

## Modifications `blockRegistry.tsx`

Définition `image-card` mise à jour :

```ts
{
    type: "image-card",
    label: "Image",
    defaultProps: { src: "", title: "" },
    fields: [
        { key: "src", label: "Image", type: "image-upload" },
        { key: "title", label: "Titre / légende", type: "text" },
    ],
    // render inchangé
}
```

---

## Tests manuels

- [ ] Insérer un bloc Image → PropsPanel s'ouvre avec drop zone (pas de champ URL)
- [ ] Drag & drop d'un JPEG → progress bar → aperçu dans PropsPanel et dans le canvas
- [ ] Clic sur la zone → sélecteur de fichier s'ouvre
- [ ] Fichier > 10 Mo → message d'erreur "Fichier trop volumineux"
- [ ] Fichier non-image (ex: .txt) → message "Type de fichier non autorisé"
- [ ] Bouton "Supprimer" → retour à la drop zone, `src` vidé
- [ ] Bloc Image existant avec `src` → aperçu affiché directement à l'ouverture du panel
- [ ] En dev : ClamAV non disponible → upload réussi (warn ignoré)
- [ ] Image affichée correctement dans le canvas après upload
