# Export / Import modules — Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à l'admin d'exporter tous les modules (avec leurs sections) depuis un environnement MongoDB et de les importer dans un autre, sans ressaisie manuelle.

**Architecture:** Deux Route Handlers sécurisés (`withAdmin`) + un Sheet client branché sur le FAB existant. Aucune nouvelle page, aucun outil externe requis.

**Tech Stack:** Next.js App Router, MongoDB driver natif, react-hook-form absent (formulaire minimal), shadcn/ui Sheet + Button + Input.

---

## Routes API

### `GET /api/admin/export`

- Protégé par `withAdmin`.
- Lit toute la collection `modules` via `connectToDB()`.
- Convertit les `_id` (ObjectId) en string pour les sections si nécessaire, puis les **supprime** du payload final.
- Renvoie une `Response` avec header `Content-Disposition: attachment; filename="modules-export.json"` et `Content-Type: application/json`.
- Corps : tableau JSON de modules (voir format ci-dessous).

### `POST /api/admin/import`

- Protégé par `withAdmin`.
- Accepte un body JSON : tableau de modules (même format que l'export).
- Pour chaque module du tableau :
  - Upsert par `path` dans la collection `modules` (filtre `{ path: module.path }`).
  - `$set` tous les champs scalaires (`title`, `iconName`, `description`, `isExtra`, `associatedSae`, `coefficients`, `manager`, `instructors`).
  - Pour les sections : upsert par `section.path` dans le tableau `sections` du document — les sections déjà présentes en prod et absentes du JSON sont **conservées** (pas de suppression).
- Renvoie `{ inserted: number, updated: number }` avec status 200.
- En cas de body invalide (pas un tableau, ou module sans `path`) → 400.

---

## Format d'échange

```json
[
  {
    "title": "JavaScript",
    "path": "javascript",
    "iconName": "code",
    "description": "Cours JS",
    "isExtra": false,
    "associatedSae": ["SAÉ 2.01"],
    "coefficients": [{ "competenceName": "1/ Réaliser un développement", "value": 10 }],
    "manager": { "firstName": "Salim", "lastName": "K", "email": "s@example.com" },
    "instructors": [],
    "sections": [
      {
        "title": "Introduction",
        "path": "1-introduction",
        "order": 1,
        "contents": ["cours", "TP"],
        "totalDuration": 2,
        "isAvailable": true,
        "hasCorrection": false,
        "correctionIsAvailable": false,
        "examenIsLock": false,
        "description": "",
        "objectives": [],
        "tags": []
      }
    ]
  }
]
```

Règles :
- `_id` jamais inclus dans l'export, jamais lu à l'import — MongoDB génère de nouveaux IDs.
- Le champ `path` est la clé d'upsert pour les modules et pour les sections (au sein d'un module).
- Les sections existantes en prod non présentes dans le JSON importé sont conservées.

---

## Composant UI : `ExportImportSheet.tsx`

Nouveau composant client `src/components/admin/ExportImportSheet.tsx`.

**Structure du Sheet (côté droit, `sm:max-w-[440px]`) :**

```
┌─ Header (bg-brand-primary) ─────────────────┐
│  [icône]  Exporter / Importer               │
└─────────────────────────────────────────────┘
│                                             │
│  Eyebrow: EXPORT                            │
│  Bouton "Télécharger l'export JSON"         │
│  → GET /api/admin/export → download fichier │
│                                             │
│  ── séparateur ──────────────────────────── │
│                                             │
│  Eyebrow: IMPORT                            │
│  Input file (.json)                         │
│  Preview : "X modules, Y sections détectés" │
│  Bouton "Importer" (disabled si pas de fich)│
│  → POST /api/admin/import → résumé résultat │
│                                             │
└─────────────────────────────────────────────┘
```

**Comportement :**
- Export : `fetch('/api/admin/export')` → crée un `<a download>` programmatique → click → révoque l'URL.
- Import : lecture du fichier via `FileReader` → parse JSON côté client → validation basique (tableau non vide, chaque item a un `path`) → `fetch POST /api/admin/import` avec le JSON → affiche `{inserted, updated}` sous le bouton.
- Erreurs affichées inline (pas de toast), état de chargement sur les boutons.

---

## Intégration dans `AdminHomeFab`

Ajouter une 3ème entrée au `DropdownMenu` :

```tsx
<DropdownMenuItem onClick={() => setExportImportOpen(true)}>
  <ArrowUpDown className="w-4 h-4" />
  Exporter / Importer
</DropdownMenuItem>
```

Monter `<ExportImportSheet open={exportImportOpen} onOpenChange={setExportImportOpen} />` aux côtés de `AddModuleButton` et `SyncSheet`.

---

## Tests

- `GET /api/admin/export` : 403 si pas admin ; 200 avec tableau JSON contenant les modules de la DB (en-tête `Content-Disposition` présent).
- `POST /api/admin/import` : 403 si pas admin ; 400 si body invalide ; 200 avec `{inserted, updated}` après upsert ; vérification dans la DB que les modules sont bien créés/mis à jour.
