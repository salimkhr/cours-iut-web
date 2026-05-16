# Error Pages Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la page 404 existante et créer les pages 403 et 500 en réutilisant le design `AuthLayout` (fond pont, gradient, card glassmorphism), avec un GIF Giphy aléatoire adapté à chaque erreur.

**Architecture:** Un composant partagé `ErrorLayout` (Client Component) encapsule `AuthLayout`, passe le code d'erreur comme titre et le texte comme description, et met le GIF + les boutons dans le card. Le hook `useRandomGif` est étendu pour accepter un tag Giphy configurable. Les pages d'erreur (`not-found.tsx`, `forbidden.tsx`, `error.tsx`) deviennent de simples wrappers sur `ErrorLayout`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, Lucide React, `next/image`

---

## Fichiers

| Fichier | Action |
|---|---|
| `src/hook/useRandomGif.ts` | Modifier — ajouter param `tag` |
| `src/components/error/ErrorLayout.tsx` | Créer |
| `src/app/not-found.tsx` | Remplacer |
| `src/app/forbidden.tsx` | Créer |
| `src/app/error.tsx` | Créer |

---

## Task 1 : Étendre `useRandomGif` avec un param `tag`

**Files:**
- Modify: `src/hook/useRandomGif.ts`

Le hook est actuellement hardcodé sur `"404-not-found"`. Il faut que chaque page d'erreur puisse passer son propre tag Giphy.

- [ ] **Step 1 : Modifier le hook**

Remplacer le contenu de `src/hook/useRandomGif.ts` par :

```typescript
import { useCallback, useEffect, useState } from "react";

interface GifData {
  images: {
    original: {
      url: string;
    };
  };
}

export default function useRandomGif(tag = "404-not-found") {
  const [gifUrl, setGifUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGif = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/random?api_key=V1lkx88QRDG9DnAdryMooFePC01U9WTa&tag=${encodeURIComponent(tag)}&rating=g`
      );
      const { data } = (await response.json()) as { data: GifData };
      setGifUrl(data.images.original.url);
    } catch {
      setGifUrl(
        "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTg3ejJ6dTBucnNpYmR5bnE1N3A1Mm9ocGw5MzUwM3Q0Yjh4bnB6MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lJnAXeJO8tE7E37mxq/giphy.gif"
      );
      setError("Failed to load GIF");
    } finally {
      setLoading(false);
    }
  }, [tag]);

  useEffect(() => {
    fetchGif();
  }, [fetchGif]);

  return { gifUrl, loading, error, refetch: fetchGif };
}
```

Changements : param `tag = "404-not-found"`, `tag` injecté via `encodeURIComponent` dans l'URL, `tag` dans les deps de `useCallback`.

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add src/hook/useRandomGif.ts
git commit -m "feat(hook): add configurable tag param to useRandomGif"
```

---

## Task 2 : Créer `ErrorLayout`

**Files:**
- Create: `src/components/error/ErrorLayout.tsx`

Composant Client partagé par les 3 pages d'erreur. Utilise `AuthLayout` (existant, `src/components/login/AuthLayout.tsx`) comme wrapper de page. Affiche dans le card : GIF, bouton ↺, bouton retour accueil, bouton secondaire optionnel.

- [ ] **Step 1 : Créer le fichier**

```typescript
"use client";

import {ReactNode} from "react";
import Image from "next/image";
import Link from "next/link";
import {Home, RefreshCw} from "lucide-react";
import AuthLayout from "@/components/login/AuthLayout";
import {Button} from "@/components/ui/button";
import useRandomGif from "@/hook/useRandomGif";

interface ErrorLayoutProps {
    code: string;
    description: string;
    gifTag: string;
    action?: ReactNode;
}

export default function ErrorLayout({code, description, gifTag, action}: ErrorLayoutProps) {
    const {gifUrl, loading, refetch} = useRandomGif(gifTag);

    return (
        <AuthLayout title={code} description={description}>
            <div className="flex flex-col gap-4">
                {/* GIF */}
                <div className="w-full h-48 rounded-xl overflow-hidden bg-bridge-200/40 dark:bg-bridge-700/40">
                    {loading && (
                        <div className="w-full h-full animate-pulse bg-bridge-300/50 dark:bg-bridge-600/50 rounded-xl"/>
                    )}
                    {!loading && gifUrl && (
                        <Image
                            src={gifUrl}
                            alt="GIF illustrant l'erreur"
                            width={480}
                            height={192}
                            unoptimized
                            className="w-full h-full object-cover rounded-xl"
                        />
                    )}
                </div>

                {/* Reload GIF */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={refetch}
                    className="self-center gap-1.5 text-brand-gray-500 hover:text-brand-accent-dark"
                >
                    <RefreshCw size={13}/>
                    Autre GIF
                </Button>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                        <Link href="/">
                            <Home size={15} className="mr-2"/>
                            Retour à l&apos;accueil
                        </Link>
                    </Button>
                    {action}
                </div>
            </div>
        </AuthLayout>
    );
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add src/components/error/ErrorLayout.tsx
git commit -m "feat(error): create shared ErrorLayout component"
```

---

## Task 3 : Remplacer `not-found.tsx` (404)

**Files:**
- Modify: `src/app/not-found.tsx`

- [ ] **Step 1 : Remplacer le fichier**

```typescript
import ErrorLayout from "@/components/error/ErrorLayout";

export default function NotFound() {
    return (
        <ErrorLayout
            code="404"
            description="Cette page n'existe pas ou a été déplacée."
            gifTag="404 not found"
        />
    );
}
```

Note : la page est un Server Component (pas de `"use client"`) — `ErrorLayout` est lui-même Client Component, c'est correct.

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 3 : Tester manuellement**

Naviguer vers une URL inexistante, ex. `http://localhost:3000/inexistant`. Vérifier :
- Le fond pont est présent
- `"404"` s'affiche en grand titre avec le point orange
- Le texte de description apparaît sous le trait
- Le GIF se charge dans le card
- Le bouton "Autre GIF" recharge un nouveau GIF
- Le bouton "Retour à l'accueil" redirige vers `/`

- [ ] **Step 4 : Commit**

```bash
git add src/app/not-found.tsx
git commit -m "feat(404): redesign not-found page with AuthLayout and random GIF"
```

---

## Task 4 : Créer `forbidden.tsx` (403)

**Files:**
- Create: `src/app/forbidden.tsx`

Next.js 16 rend automatiquement `forbidden.tsx` quand `forbidden()` est appelé depuis un Server Component ou Route Handler.

- [ ] **Step 1 : Créer le fichier**

```typescript
import ErrorLayout from "@/components/error/ErrorLayout";
import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function Forbidden() {
    return (
        <ErrorLayout
            code="403"
            description="Vous n'avez pas les droits pour accéder à cette ressource."
            gifTag="access denied"
            action={
                <Button asChild variant="outline" className="flex-1">
                    <Link href="/login">Se connecter</Link>
                </Button>
            }
        />
    );
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 3 : Tester manuellement**

Ajouter temporairement `import { forbidden } from "next/navigation"; forbidden();` dans n'importe quel Server Component accessible, recharger la page. Vérifier :
- Le fond pont est présent
- `"403"` s'affiche en grand titre
- Le GIF "access denied" se charge
- Les boutons "Retour à l'accueil" et "Se connecter" sont présents

Retirer le `forbidden()` temporaire après test.

- [ ] **Step 4 : Commit**

```bash
git add src/app/forbidden.tsx
git commit -m "feat(403): add forbidden page with AuthLayout and random GIF"
```

---

## Task 5 : Créer `error.tsx` (500)

**Files:**
- Create: `src/app/error.tsx`

`error.tsx` est une Error Boundary Next.js. Elle DOIT être un Client Component (`"use client"`). Elle reçoit `{ error: Error & { digest?: string }, reset: () => void }`.

- [ ] **Step 1 : Créer le fichier**

```typescript
"use client";

import ErrorLayout from "@/components/error/ErrorLayout";
import {Button} from "@/components/ui/button";
import {RotateCcw} from "lucide-react";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({reset}: ErrorPageProps) {
    return (
        <ErrorLayout
            code="500"
            description="Quelque chose s'est mal passé côté serveur. Réessayez dans quelques instants."
            gifTag="fail oops"
            action={
                <Button variant="outline" className="flex-1" onClick={reset}>
                    <RotateCcw size={15} className="mr-2"/>
                    Réessayer
                </Button>
            }
        />
    );
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Step 3 : Tester manuellement**

Ajouter temporairement `throw new Error("test")` dans un Server Component accessible, recharger la page (en mode `dev` — en `prod` il faudrait builder). Vérifier :
- Le fond pont est présent
- `"500"` s'affiche en grand titre
- Le GIF "fail oops" se charge
- Le bouton "Réessayer" déclenche `reset()` et retente le rendu

Retirer le `throw` temporaire après test.

- [ ] **Step 4 : Commit final**

```bash
git add src/app/error.tsx
git commit -m "feat(500): add error page with AuthLayout and random GIF"
```
