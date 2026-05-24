# Design — Synchronisation cours filesystem / MongoDB

**Date :** 2026-05-24
**Contexte :** Lors d'une migration de serveur ou d'une MEP, un cours peut exister dans `src/cours` sans avoir d'entrée correspondante dans la collection `modules` de MongoDB. Cette feature permet à l'admin de détecter et créer rapidement les modules et sections manquants.

---

## 1. Route Handler — `GET /api/admin/sync`

**Fichier :** `src/app/api/admin/sync/route.ts`

Accessible uniquement aux admins (protégé par `proxy.ts`, rôle `admin` requis).

### Logique

1. Lit `src/cours` via `fs.readdir` (disponible server-side dans les Route Handlers)
2. Récupère tous les documents de la collection MongoDB `modules`
3. Pour chaque dossier module dans `src/cours` :
   - Absent de Mongo → ajouté à `missingModules`
   - Présent → compare les sous-dossiers sections → sections absentes ajoutées à `missingSections`
4. Pour chaque section manquante, lit les fichiers `.tsx` présents pour construire le prefill

### Réponse

```ts
type SyncResponse = {
  missingModules: {
    slug: string;
  }[];
  missingSections: {
    moduleSlug: string;
    sectionSlug: string;
    prefill: {
      path: string;
      title: string;       // formaté depuis slug (ex. "1-le-dom" → "Le Dom")
      order: number;       // préfixe numérique du slug
      contents: string[];  // noms des .tsx sans extension (ex. ["Cours", "TP", "Slide"])
      isAvailable: false;
      hasCorrection: false;
      totalDuration: 0;
      tags: [];
    };
  }[];
};
```

### Dérivation automatique depuis le slug de section

| Champ | Source |
|---|---|
| `path` | slug tel quel (`1-le-dom`) |
| `order` | préfixe numérique (`1`) |
| `title` | slug sans préfixe + dé-kebab + capitalize (`"le-dom"` → `"Le Dom"`) |
| `contents` | liste des `.tsx` présents dans le dossier, sans extension |
| `isAvailable` | `false` (safe pour MEP) |
| `hasCorrection` | `false` |
| `totalDuration` | `0` |
| `tags` | `[]` |

---

## 2. Badge sur `AdminHomeFab`

**Fichier modifié :** `src/components/admin/AdminHomeFab.tsx`

- Au montage, `useEffect` fait un `fetch('/api/admin/sync')` et stocke le résultat dans un state local
- `totalMissing = missingModules.length + missingSections.length`
- Si `totalMissing > 0` : badge rouge positionné en absolu sur le bouton FAB avec le compte
- Le dropdown gagne un item **"Synchroniser les cours"** (icône `RefreshCw`)
- Après toute création réussie (module ou section), re-fetch du diff pour mettre à jour le badge

```
[🔧]³  ← FAB avec badge rouge "3"
  └─ dropdown
       ├─ + Créer un module         (existant)
       └─ ↻ Synchroniser les cours  (nouveau)
```

---

## 3. Composant `SyncSheet`

**Fichier :** `src/components/admin/SyncSheet.tsx`

Sheet latéral droit (même style que `AddModuleButton`) listé par module.

### Affichage

```
── javascript ──────────────────────────
  ⚠ Module absent de MongoDB   [Créer →]

── php ─────────────────────────────────
  • 3-les-tableaux              [Créer →]
  • 5-les-classes               [Créer →]
```

- Les modules entièrement absents affichent un badge "Module" distinctif
- Les sections manquantes sont listées sous leur module parent (même si le module existe)

### Comportement des boutons "Créer →"

- **Module manquant** : ferme le `SyncSheet`, ouvre `AddModuleButton` avec `path` pré-rempli depuis le slug
- **Section manquante** : ferme le `SyncSheet`, ouvre le sheet de création de section existant (`AddSectionButton` / `SectionForm`) avec tous les champs dérivables pré-remplis

Les champs pré-remplis restent modifiables dans le formulaire. Les champs non-dérivables (description, tags, totalDuration, objectifs) sont vides et à compléter manuellement.

### État vide

Si `totalMissing === 0` : le sheet affiche un message "Tout est synchronisé ✓".

---

## 4. Fichiers créés / modifiés

| Fichier | Action |
|---|---|
| `src/app/api/admin/sync/route.ts` | Créé |
| `src/components/admin/SyncSheet.tsx` | Créé |
| `src/components/admin/AdminHomeFab.tsx` | Modifié (badge + item dropdown + SyncSheet) |

Aucune modification aux formulaires existants (`AddModuleButton`, `SectionForm`) — ils sont réutilisés tels quels avec des props de pre-fill.

---

## 5. Contraintes et edge cases

- **Build** : `fs.readdir` ne doit être appelé que dans la Route Handler (serveur), jamais côté client
- **Standalone** : en mode `next build --standalone`, les fichiers `src/cours` sont copiés dans `.next/standalone` — le `process.cwd()` pointe correctement vers le dossier de l'app
- **Race condition** : si deux admins créent le même module simultanément, le second insert échouera sur un éventuel index unique sur `path` (à gérer avec un `upsert` ou un try/catch)
- **Section dans module absent** : si un module entier est absent, ses sections manquantes sont listées comme "Module absent" uniquement — pas de création de section sans module parent
