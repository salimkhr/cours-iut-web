# Spec — Refonte des pages d'erreur

| Champ      | Valeur                        |
|------------|-------------------------------|
| Date       | 16 mai 2026                   |
| Périmètre  | Pages 403, 404, 500           |
| Approche   | A — GIF dans le card          |

---

## Objectif

Remplacer la page 404 minimaliste existante et créer les pages 403 et 500 manquantes, en adoptant le design de la page login (`AuthLayout`) et en conservant la logique de GIF aléatoire adapté à chaque erreur.

---

## Architecture

### Composant partagé

**`src/components/error/ErrorLayout.tsx`** — Client Component (`"use client"`)

Props :
```typescript
interface ErrorLayoutProps {
    code: string;           // "403" | "404" | "500"
    description: string;    // texte affiché sous le code
    gifTag: string;         // tag envoyé à l'API Giphy
    action?: ReactNode;     // bouton secondaire (Réessayer, Se connecter)
}
```

Comportement :
- Utilise `AuthLayout` avec `title={code}` et `description={description}`
- `children` d'`AuthLayout` (le card) contient : GIF + bouton ↺ + boutons d'action
- Appelle `useRandomGif(gifTag)` — le hook existant doit accepter un `tag` optionnel en paramètre (actuellement hardcodé `"404-not-found"`)
- GIF affiché avec `ImageCard` (`rounded-xl`, hauteur `h-48`, `object-cover`)
- Pendant le chargement : skeleton de même taille
- Bouton ↺ discret pour recharger le GIF via `refetch`
- Bouton "Retour à l'accueil" toujours présent (→ `/`)
- Bouton secondaire optionnel via prop `action`

### Modification du hook

**`src/hook/useRandomGif.ts`** — ajout d'un paramètre `tag` optionnel

```typescript
export default function useRandomGif(tag = "404-not-found") { ... }
```

Le tag est injecté dans l'URL Giphy à la place de la valeur hardcodée.

---

## Pages

### `src/app/not-found.tsx` (404 — remplace l'existant)

```
title        → "404"
description  → "Cette page n'existe pas ou a été déplacée."
gifTag       → "404 not found"
action       → (aucun)
```

### `src/app/forbidden.tsx` (403 — nouveau, Next.js 16 natif)

```
title        → "403"
description  → "Vous n'avez pas les droits pour accéder à cette ressource."
gifTag       → "access denied"
action       → <Button asChild><Link href="/login">Se connecter</Link></Button>
```

### `src/app/error.tsx` (500 — nouveau, erreurs runtime Next.js)

```
title        → "500"
description  → "Quelque chose s'est mal passé côté serveur. Réessayez dans quelques instants."
gifTag       → "fail oops"
action       → <Button onClick={reset}>Réessayer</Button>
```

`error.tsx` reçoit `{ error, reset }` de Next.js — `reset` est passé en prop `action`.

---

## Layout interne du card

De haut en bas dans le card glassmorphism :

1. GIF (`ImageCard`, `h-48`, `rounded-xl`, `object-cover`) — affiché dès que `gifUrl` est disponible, skeleton sinon
2. Bouton ↺ discret (`variant="ghost"`, icône `RefreshCw`) pour recharger le GIF
3. Séparateur visuel
4. Bouton "Retour à l'accueil" (pleine largeur, variante primaire)
5. Bouton secondaire si présent (`action` prop, pleine largeur, variante outline)

---

## Fichiers touchés

| Fichier | Action |
|---------|--------|
| `src/hook/useRandomGif.ts` | Modifier — ajouter param `tag` |
| `src/components/error/ErrorLayout.tsx` | Créer |
| `src/app/not-found.tsx` | Remplacer |
| `src/app/forbidden.tsx` | Créer |
| `src/app/error.tsx` | Créer |

Aucune nouvelle dépendance.
