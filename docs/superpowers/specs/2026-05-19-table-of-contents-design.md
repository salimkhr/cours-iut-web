# Design — Table des matières flottante pour les pages Cours

**Date :** 2026-05-19
**Statut :** Approuvé

---

## Contexte

Les pages Cours peuvent être longues (plusieurs sections H2 et sous-sections H3). Les étudiants ont besoin de naviguer rapidement vers la section qui répond à leur question pendant un TP, sans avoir à scroller manuellement depuis le début.

---

## Ce qui est construit

Un composant `TableOfContents` — bouton flottant fixe en bas à droite qui ouvre un panneau listant tous les H2 et H3 du cours courant, avec surlignage actif au scroll.

---

## Périmètre

**Activé sur :** pages Cours uniquement (`currentContent === 'cours'`, mode normal — pas split)

**Non activé sur :** TP, Slides, Examen, mode côte à côte (split)

**Justification :** Le TP est linéaire (pas besoin de navigation non-linéaire). Le mode split affiche déjà le cours en parallèle. Les slides ont leur propre navigation.

---

## Comportement

### Extraction des headings

Au montage du composant (`useEffect`), scanner `querySelectorAll('h2, h3')` dans le `<main>` de la page.

Pour chaque heading sans `id` : injecter un `id` auto-généré via slugification du `textContent` :
- `"A- Introduction au DOM"` → `"a-introduction-au-dom"`
- `"1. Qu'est-ce que le DOM ?"` → `"1-qu-est-ce-que-le-dom"`

Aucune modification des fichiers de cours existants n'est nécessaire. Les headings qui ont déjà un `id` le conservent.

### Surlignage actif

`IntersectionObserver` avec `rootMargin: '-10% 0px -80% 0px'` : le heading entrant dans la zone haute de la fenêtre devient l'entrée active. Une seule entrée active à la fois.

### Navigation

Cliquer sur une entrée TOC :
1. Smooth scroll vers le heading correspondant (`scrollIntoView({ behavior: 'smooth' })`)
2. Ferme le panneau

### Ouverture / fermeture du panneau

- Clic sur le bouton flottant → ouvre le panneau
- Clic à l'extérieur du panneau → ferme
- Clic sur une entrée → ferme après navigation

---

## Structure du panneau

```
┌────────────────────────────┐
│  Table des matières     ✕  │
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
- Masqué si le cours n'a aucun heading (TOC vide)

---

## Intégration dans la page

Dans `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`, après le `<main>` et uniquement quand `currentContent === 'cours'` et `!isSplit` :

```tsx
{currentContent === 'cours' && !isSplit && (
    <TableOfContents modulePath={currentModule.path} />
)}
```

Le composant est `"use client"` et s'auto-exclut si la liste des headings extraits est vide.

---

## Fichiers

| Action | Fichier |
|--------|---------|
| Créer | `src/components/TableOfContents.tsx` |
| Modifier | `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` |

---

## Ce qui n'est PAS dans ce scope

- Pas de TOC sur les pages TP
- Pas de TOC en mode split (côte à côte)
- Pas de modification des fichiers de cours existants
- Pas d'export de metadata depuis les cours (approche DOM scanning uniquement)
- Pas de persistance de l'état ouvert/fermé entre pages
