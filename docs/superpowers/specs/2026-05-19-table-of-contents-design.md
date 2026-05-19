# Design — Table des matières flottante pour les pages Cours, TP et Examen

**Date :** 2026-05-19
**Statut :** Approuvé

---

## Contexte

Les pages Cours, TP et Examen peuvent être longues. Les étudiants ont besoin de naviguer rapidement vers la section pertinente, et de pouvoir consulter une autre vue (Cours depuis le TP, Cours depuis l'Examen, etc.) sans perdre leur position.

---

## Ce qui est construit

Un composant `TableOfContents` — bouton flottant fixe en bas à droite qui ouvre un panneau à trois onglets : **Cours**, **TP** et **Examen**. L'onglet de la page courante est actif par défaut, avec surlignage au scroll. Les onglets des autres pages listent leurs headings (issus du store Zustand) et naviguent vers ces pages à l'ancre choisie.

---

## Périmètre

**Activé sur :** pages Cours (`currentContent === 'cours'`), TP (`currentContent === 'tp'`) et Examen (`currentContent === 'examen'`), mode normal uniquement.

**Non activé sur :** Slides, mode côte à côte (split).

**Justification :** Le mode split affiche déjà les deux contenus en parallèle. Les slides ont leur propre navigation.

---

## Comportement

### Trois onglets

Le panneau affiche trois onglets :

- **Cours** — headings H2+H3 de la page Cours de la section courante
- **TP** — headings H2+H3 de la page TP de la section courante
- **Examen** — headings H2+H3 de la page Examen de la section courante

L'onglet correspondant à la page actuellement affichée est l'onglet actif par défaut à l'ouverture.

### Extraction des headings — page courante

Au montage du composant (`useEffect`), scanner `querySelectorAll('h2, h3')` dans le `<main>` de la page.

Pour chaque heading sans `id` : injecter un `id` auto-généré via slugification du `textContent` :
- `"A- Introduction au DOM"` → `"a-introduction-au-dom"`
- `"1. Qu'est-ce que le DOM ?"` → `"1-qu-est-ce-que-le-dom"`

Aucune modification des fichiers de cours existants n'est nécessaire. Les headings qui ont déjà un `id` le conservent.

Les headings extraits sont **persistés dans un store Zustand** (`tocStore`) par clé `sectionSlug + contentSlug` (ex: `"1-le-dom/cours"`).

### Extraction des headings — autre page

Chaque onglet qui n'est pas la page courante affiche les headings extraits lors de la dernière visite de cette page (lus depuis le store Zustand).

Si l'étudiant n'a pas encore visité une page dans cette session, l'onglet correspondant affiche un message : `"Visitez le [Cours/TP/Examen] pour charger sa table des matières."` avec un lien de navigation vers cette page.

### Surlignage actif

`IntersectionObserver` avec `rootMargin: '-10% 0px -80% 0px'` : actif **uniquement sur l'onglet de la page courante**. Le heading entrant dans la zone haute de la fenêtre devient l'entrée active. Une seule entrée active à la fois.

L'onglet de l'autre page ne surligne aucune entrée.

### Navigation

**Onglet courant (même page) :**
1. Smooth scroll vers le heading correspondant (`scrollIntoView({ behavior: 'smooth' })`)
2. Ferme le panneau

**Onglet autre page :**
1. Navigation `router.push` vers l'URL de l'autre page + `#slug`
2. Ferme le panneau

L'URL des autres pages se construit depuis les params courants en remplaçant le segment `contentSlug` :
- `cours` → `/[moduleSlug]/[sectionSlug]/cours#slug`
- `tp` → `/[moduleSlug]/[sectionSlug]/tp#slug`
- `examen` → `/[moduleSlug]/[sectionSlug]/examen#slug`

### Ouverture / fermeture du panneau

- Clic sur le bouton flottant → ouvre le panneau
- Clic à l'extérieur du panneau → ferme
- Clic sur une entrée → ferme après navigation
- Touche `Escape` → ferme

---

## Structure du panneau

```
┌────────────────────────────┐
│  [Cours] [TP] [Examen]  ✕  │  ← onglets
├────────────────────────────┤
│ ▶ A- Introduction au DOM   │  ← H2 actif (couleur module)
│     1. Qu'est-ce que le DOM│  ← H3, indenté, plus petit
│     2. L'arbre DOM         │
│   B- Sélectionner          │  ← H2 inactif
│     1. querySelector       │
│     2. getElementById      │
│   C- Modifier le DOM       │
│     1. textContent         │
│     2. classList           │
└────────────────────────────┘
```

**Onglets :** `text-xs font-semibold`, onglet actif = bordure inférieure couleur module, inactif = `text-brand-dark/40`

**H2** : `font-semibold text-sm`, couleur module quand actif, `text-brand-dark/80` sinon

**H3** : `pl-4 text-xs text-brand-dark/55`, couleur module (atténuée) quand actif

**Largeur panneau :** `w-64` (256px), `max-h-[60vh]` avec `overflow-y-auto`

**Position panneau :** `absolute bottom-14 right-0` par rapport au bouton

---

## Bouton flottant

- Position : `fixed bottom-6 right-6 z-40`
- Forme : cercle `w-10 h-10`
- Couleur : `var(--color-{module.path})` (s'adapte au module courant)
- Icône : `List` (lucide-react)
- Shadow : `shadow-lg`
- Masqué si les deux onglets sont vides

---

## Store Zustand — `tocStore`

```ts
interface TocEntry { id: string; text: string; level: 2 | 3 }
interface TocStore {
  headings: Record<string, TocEntry[]>  // clé: `${sectionSlug}/${contentSlug}`
  setHeadings: (key: string, headings: TocEntry[]) => void
}
```

Le store vit dans `src/lib/store/tocStore.ts`. Il est peuplé par `TableOfContents` à chaque montage (page Cours, TP ou Examen) et persiste en mémoire pour la session (pas de localStorage).

---

## Intégration dans la page

Dans `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`, après le `<main>` et uniquement quand on est sur Cours, TP ou Examen hors mode split :

```tsx
{(currentContent === 'cours' || currentContent === 'tp' || currentContent === 'examen') && !isSplit && (
    <TableOfContents
        modulePath={currentModule.path}
        currentContent={currentContent}
        moduleSlug={moduleSlug}
        sectionSlug={sectionSlug}
    />
)}
```

Le composant est `"use client"` et s'auto-exclut si les deux onglets sont vides.

---

## Fichiers

| Action | Fichier |
|--------|---------|
| Créer | `src/components/TableOfContents.tsx` |
| Créer | `src/lib/store/tocStore.ts` |
| Modifier | `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` |

---

## Ce qui n'est PAS dans ce scope

- Pas de TOC en mode split (côte à côte)
- Pas de TOC sur Slides
- Pas de modification des fichiers de cours existants
- Pas de persistance entre sessions (localStorage) — le store Zustand est en mémoire
- Pas d'export de metadata depuis les cours (approche DOM scanning uniquement)
