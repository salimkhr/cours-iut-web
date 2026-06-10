# AboutSection Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer les citations aléatoires de `AboutSection` par deux blocs utiles : "Dernières mises à jour" (3 modules récents) et "Ma progression" (sections déverrouillées / total), sur l'image d'escalier existante.

**Architecture:** `AboutSection` devient un composant piloté par props (`modules`, `isAuthed`) fournis par `page.tsx` qui les possède déjà. Bloc 1 toujours visible, Bloc 2 conditionnel à `isAuthed`. Séparateur doré entre les deux blocs. Le tableau `QUOTES` et la `<blockquote>` sont supprimés.

**Tech Stack:** Next.js App Router, React 19, TypeScript strict, Tailwind CSS v4, `useIsDark` hook existant.

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `src/types/Module.ts` | Ajouter `updatedAt?: Date` |
| `src/components/page/AboutSection.tsx` | Réécriture complète |
| `src/app/page.tsx` | Passer `modules` et `isAuthed` à `AboutSection` |

> **Note :** Aucun framework de test n'est installé (`CLAUDE.md` §8). Pas de TDD — validation visuelle via `bun dev`.

---

## Task 1 : Ajouter `updatedAt` au type Module

**Files:**
- Modify: `src/types/Module.ts`

- [ ] **Step 1 : Ajouter le champ optionnel**

Ouvrir `src/types/Module.ts` et ajouter `updatedAt?: Date;` après `isExtra` :

```ts
export default interface Module {
    _id: string | ObjectId;
    title: string;
    path: string;
    iconName: string;
    description?: string;
    sections: Section[];
    coefficients?: Coefficient[];
    instructors?: Instructor[];
    manager?: Instructor;
    associatedSae: string[];
    isExtra?: boolean;
    updatedAt?: Date;
}
```

- [ ] **Step 2 : Vérifier qu'il n'y a pas d'erreur TypeScript**

```bash
bun run lint
```

Résultat attendu : aucune erreur liée à `Module`.

- [ ] **Step 3 : Commit**

```bash
git add src/types/Module.ts
git commit -m "feat(types): add optional updatedAt to Module"
```

---

## Task 2 : Réécrire AboutSection

**Files:**
- Modify: `src/components/page/AboutSection.tsx`

Ce fichier remplace entièrement le contenu actuel (suppression du tableau `QUOTES`, de la `blockquote` et de la logique de citation).

- [ ] **Step 1 : Remplacer le contenu du fichier**

```tsx
'use client'
import { useIsDark } from "@/hook/useIsDark";
import Module from "@/types/Module";

interface AboutSectionProps {
    modules: (Module & { _id: string })[];
    isAuthed: boolean;
}

function relativeDate(date: Date): string {
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "aujourd'hui";
    if (days === 1) return "hier";
    if (days < 7) return `il y a ${days} j`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `il y a ${weeks} sem.`;
    return `il y a ${Math.floor(days / 30)} mois`;
}

export default function AboutSection({ modules, isAuthed }: AboutSectionProps) {
    const isDark = useIsDark();

    const recentModules = [...modules]
        .filter(m => !m.isExtra)
        .sort((a, b) => {
            const aT = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const bT = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return bT - aT;
        })
        .slice(0, 3);

    const allSections = modules.flatMap(m => m.sections);
    const totalSections = allSections.length;
    const availableSections = allSections.filter(s => s.isAvailable).length;
    const progressPct = totalSections > 0
        ? Math.round((availableSections / totalSections) * 100)
        : 0;

    const heroImage = isDark
        ? "/images/header/escalier-dark.png"
        : "/images/header/escalier-light.png";

    const imageFade = isDark
        ? `linear-gradient(to right, #171512 0%, #171512 45%, rgba(23,21,18,0.6) 65%, transparent 100%)`
        : `linear-gradient(to right, #faf8f5 0%, #faf8f5 45%, rgba(250,248,245,0.6) 65%, transparent 100%)`;

    const textColor = isDark ? "#faf8f5" : "#1a1916";

    return (
        <>
            <style>{`
        .about-section {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-top: 1px solid var(--color-brand-gray-300, #e2ddd6);
          min-height: clamp(260px, 40vw, 560px);
        }
        .about-image-wrap {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .about-image-wrap img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: right center;
        }
        .about-image-fade {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .about-text {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3.5rem);
          width: 100%;
          box-sizing: border-box;
          max-width: 560px;
        }
        .about-rule {
          display: block;
          width: 2.5rem;
          height: 2px;
          background: var(--color-brand-primary, #c8a96e);
          border-radius: 2px;
          margin-bottom: 1.5rem;
        }
        .about-label {
          font-size: 0.7rem;
          font-family: var(--font-mono, monospace);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-brand-primary, #c8a96e);
          margin: 0 0 1rem;
        }
        .update-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .update-item {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          font-size: 0.85rem;
        }
        .update-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--color-brand-primary, #c8a96e);
          flex-shrink: 0;
          margin-top: 0.35rem;
        }
        .update-name {
          flex: 1;
          font-weight: 500;
        }
        .update-date {
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          color: var(--color-brand-gray-500, #9b9189);
          white-space: nowrap;
        }
        .block-separator {
          border: none;
          border-top: 1px solid rgba(200, 169, 110, 0.2);
          margin: 1.75rem 0;
          width: 100%;
        }
        .progress-text {
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .progress-bar-bg {
          height: 4px;
          background: rgba(128, 128, 128, 0.15);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.4rem;
        }
        .progress-bar-fill {
          height: 100%;
          background: var(--color-brand-primary, #c8a96e);
          border-radius: 4px;
          transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .progress-sub {
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          color: var(--color-brand-gray-500, #9b9189);
        }
      `}</style>

            <section
                className="about-section"
                aria-label="Dernières mises à jour du programme"
            >
                <div className="about-image-wrap" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroImage} alt="" />
                    <div className="about-image-fade" style={{ background: imageFade }} />
                </div>

                <div className="about-text" style={{ color: textColor }}>
                    {/* Bloc 1 — Dernières mises à jour */}
                    <span className="about-rule" aria-hidden="true" />
                    <p className="about-label" aria-hidden="true">Dernières mises à jour</p>
                    <ul className="update-list">
                        {recentModules.map(mod => (
                            <li key={mod._id} className="update-item">
                                <span className="update-dot" aria-hidden="true" />
                                <span className="update-name">{mod.title}</span>
                                {mod.updatedAt && (
                                    <span className="update-date">
                                        {relativeDate(new Date(mod.updatedAt))}
                                    </span>
                                )}
                            </li>
                        ))}
                        {recentModules.length === 0 && (
                            <li className="update-item" style={{ opacity: 0.5 }}>
                                <span className="update-dot" aria-hidden="true" />
                                <span className="update-name">Aucun module disponible</span>
                            </li>
                        )}
                    </ul>

                    {/* Séparateur + Bloc 2 — Ma progression (connecté uniquement) */}
                    {isAuthed && totalSections > 0 && (
                        <>
                            <hr className="block-separator" aria-hidden="true" />
                            <p className="about-label" aria-hidden="true">Ma progression</p>
                            <p className="progress-text">
                                {availableSections} / {totalSections} sections déverrouillées
                            </p>
                            <div
                                className="progress-bar-bg"
                                role="progressbar"
                                aria-valuenow={progressPct}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`${progressPct}% du programme déverrouillé`}
                            >
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                            <p className="progress-sub">
                                {totalSections - availableSections} section
                                {totalSections - availableSections !== 1 ? 's' : ''} en attente
                            </p>
                        </>
                    )}
                </div>
            </section>
        </>
    );
}
```

- [ ] **Step 2 : Vérifier le lint**

```bash
bun run lint
```

Résultat attendu : aucune erreur dans `AboutSection.tsx`.

- [ ] **Step 3 : Commit**

```bash
git add src/components/page/AboutSection.tsx
git commit -m "feat(about): replace quotes with updates + progress blocks"
```

---

## Task 3 : Câbler les props depuis page.tsx

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1 : Passer `modules` et `isAuthed` à AboutSection**

Dans `src/app/page.tsx`, localiser la ligne `<AboutSection/>` et la remplacer par :

```tsx
<AboutSection modules={allModules} isAuthed={isAuthed} />
```

La variable `allModules` est déjà déclarée ligne 26, `isAuthed` ligne 24 — aucun import supplémentaire.

- [ ] **Step 2 : Vérifier le lint**

```bash
bun run lint
```

Résultat attendu : aucune erreur TypeScript (les props matchent l'interface définie en Task 2).

- [ ] **Step 3 : Lancer le serveur de dev et valider visuellement**

```bash
bun dev
```

Ouvrir `http://localhost:3000` et vérifier :

1. **Non connecté** : la section affiche uniquement "Dernières mises à jour" avec 3 modules (ou moins si la base en contient moins) — le bloc "Ma progression" est absent.
2. **Connecté** : les deux blocs s'affichent, séparateur doré visible, barre de progression proportionnelle aux sections `isAvailable`.
3. **Dark/light mode** : basculer le thème — l'image d'escalier change, les couleurs de texte s'adaptent.

- [ ] **Step 4 : Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): wire modules + isAuthed props to AboutSection"
```

---

## Vérification finale

- [ ] `bun run build` passe sans erreur (validation du build standalone)
- [ ] Les images `escalier-dark.png` et `escalier-light.png` se chargent correctement en production
- [ ] Si aucun module n'a `updatedAt` en base : les noms s'affichent sans date relative (pas d'erreur JS)
