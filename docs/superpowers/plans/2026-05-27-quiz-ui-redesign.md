# Quiz UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesigner la card quiz avec un layout split sidebar/main, révélation complète des choix au feedback, et un écran de résultat récapitulatif — sans toucher à `QuizPageLayout`.

**Architecture:** `QuizGame` adopte un grid `[72px sidebar | flex-1 main]`. La sidebar (couleur module) contient arc de progression, étapes numérotées et score live. `QuizQuestion` reçoit `explanation` et `correctAnswer` pour afficher la révélation complète. La route `/check` retourne désormais `correctAnswer` pour permettre de révéler le bon choix côté client.

**Tech Stack:** Next.js App Router, React 19, TypeScript strict, Tailwind v4, Lucide React, Axios, shadcn/ui Button.

---

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `src/types/Quiz.ts` | Ajouter `correctAnswer: QuizAnswer` dans `QuizCheckResult` |
| `src/app/api/quiz/[moduleSlug]/[sectionSlug]/check/route.ts` | Retourner `correctAnswer: correct` |
| `src/components/quiz/QuizPageLayout.tsx` | `lg:max-w-[480px]` → `lg:max-w-[560px]` |
| `src/app/[moduleSlug]/[sectionSlug]/quiz/page.tsx` | Passer `moduleTitle={currentModule.title}` à `QuizGame` |
| `src/components/quiz/QuizQuestion.tsx` | Révélation complète + explication inline |
| `src/components/quiz/QuizGame.tsx` | Refactoring complet — split layout, sidebar, phases |

---

## Task 1 — Étendre `QuizCheckResult` et la route `/check`

**Files:**
- Modify: `src/types/Quiz.ts`
- Modify: `src/app/api/quiz/[moduleSlug]/[sectionSlug]/check/route.ts`

- [ ] **Ouvrir `src/types/Quiz.ts` et ajouter `correctAnswer` à `QuizCheckResult`**

```typescript
// Réponse du POST /check
export interface QuizCheckResult {
    isCorrect: boolean;
    explanation: string;
    correctAnswer: QuizAnswer;
}
```

- [ ] **Ouvrir `src/app/api/quiz/[moduleSlug]/[sectionSlug]/check/route.ts`, remplacer la ligne 46**

Avant :
```typescript
return NextResponse.json({ isCorrect, explanation: question.explanation });
```

Après :
```typescript
return NextResponse.json({ isCorrect, explanation: question.explanation, correctAnswer: correct });
```

- [ ] **Vérifier qu'il n'y a pas d'erreur TypeScript**

```powershell
bun run lint
```

Résultat attendu : aucune erreur dans les fichiers modifiés.

- [ ] **Commit**

```bash
git add src/types/Quiz.ts "src/app/api/quiz/[moduleSlug]/[sectionSlug]/check/route.ts"
git commit -m "feat: retourner correctAnswer dans la réponse de /check"
```

---

## Task 2 — Élargir la card dans `QuizPageLayout`

**Files:**
- Modify: `src/components/quiz/QuizPageLayout.tsx:86`

- [ ] **Dans `QuizPageLayout.tsx` ligne 86, changer la max-width**

Avant :
```tsx
"lg:max-w-[480px]",
```

Après :
```tsx
"lg:max-w-[560px]",
```

- [ ] **Démarrer le dev server et vérifier visuellement**

```powershell
bun dev
```

Ouvrir `http://localhost:3000/<moduleSlug>/<sectionSlug>/quiz` — la card doit être légèrement plus large sur desktop.

- [ ] **Commit**

```bash
git add src/components/quiz/QuizPageLayout.tsx
git commit -m "fix: élargir la card quiz lg:max-w-[480px] → lg:max-w-[560px]"
```

---

## Task 3 — Passer `moduleTitle` à `QuizGame`

**Files:**
- Modify: `src/app/[moduleSlug]/[sectionSlug]/quiz/page.tsx`
- Modify: `src/components/quiz/QuizGame.tsx` (interface uniquement)

- [ ] **Dans `QuizGame.tsx`, ajouter `moduleTitle` à l'interface et aux props**

Remplacer :
```typescript
interface QuizGameProps {
    moduleSlug: string;
    sectionSlug: string;
    modulePath: string;
}

export default function QuizGame({moduleSlug, sectionSlug, modulePath}: QuizGameProps) {
```

Par :
```typescript
interface QuizGameProps {
    moduleSlug: string;
    sectionSlug: string;
    modulePath: string;
    moduleTitle: string;
}

export default function QuizGame({moduleSlug, sectionSlug, modulePath, moduleTitle}: QuizGameProps) {
```

- [ ] **Dans `quiz/page.tsx`, passer `moduleTitle` au composant**

Remplacer :
```tsx
<QuizGame
    moduleSlug={moduleSlug}
    sectionSlug={sectionSlug}
    modulePath={currentModule.path}
/>
```

Par :
```tsx
<QuizGame
    moduleSlug={moduleSlug}
    sectionSlug={sectionSlug}
    modulePath={currentModule.path}
    moduleTitle={currentModule.title}
/>
```

- [ ] **Vérifier qu'il n'y a pas d'erreur TypeScript**

```powershell
bun run lint
```

- [ ] **Commit**

```bash
git add "src/app/[moduleSlug]/[sectionSlug]/quiz/page.tsx" src/components/quiz/QuizGame.tsx
git commit -m "feat: passer moduleTitle à QuizGame"
```

---

## Task 4 — Refactorer `QuizQuestion` — révélation complète

**Files:**
- Modify: `src/components/quiz/QuizQuestion.tsx`

La révélation complète affiche, après "Vérifier" :
- La **bonne réponse** en vert + icône ✓ + l'explication inline en dessous
- La **réponse sélectionnée si fausse** en rouge + icône ✗
- Les **autres choix** en opacité 35 %, non cliquables

Les props nouvelles à ajouter : `explanation?: string` et `correctAnswer?: QuizAnswer`.

- [ ] **Remplacer entièrement `src/components/quiz/QuizQuestion.tsx`**

```tsx
"use client";

import {useState} from "react";
import type {CSSProperties} from "react";
import {Check, CheckCircle2, XCircle} from "lucide-react";
import {cn} from "@/lib/utils";
import {QuizAnswer, QuizQuestionClient} from "@/types/Quiz";

interface QuizQuestionProps {
    question: QuizQuestionClient;
    onAnswer: (answer: QuizAnswer) => void;
    disabled?: boolean;
    feedbackIsCorrect?: boolean;
    moduleColor: string;
    explanation?: string;
    correctAnswer?: QuizAnswer;
}

type ChoiceState = "neutral" | "selected" | "correct" | "wrong" | "dimmed";

export default function QuizQuestion({
    question, onAnswer, disabled, feedbackIsCorrect, moduleColor, explanation, correctAnswer
}: QuizQuestionProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [multiSelected, setMultiSelected] = useState<number[]>([]);

    const hasFeedback = feedbackIsCorrect !== undefined;

    const base = [
        "w-full text-left px-3 py-2 rounded-lg border-[1.5px] text-xs",
        "flex items-center gap-2 transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    ].join(" ");

    function stateClass(state: ChoiceState): string {
        switch (state) {
            case "correct": return "border-green-500 bg-green-50 dark:bg-green-950/25 text-green-900 dark:text-green-100";
            case "wrong":   return "border-red-500 bg-red-50 dark:bg-red-950/25 text-red-900 dark:text-red-100";
            case "dimmed":  return "border-border opacity-35 cursor-not-allowed";
            case "selected": return "border-2 bg-bridge-50 dark:bg-bridge-900/60";
            default:        return "border-border bg-white/65 dark:bg-bridge-800/30 hover:bg-bridge-50 dark:hover:bg-bridge-800/50 cursor-pointer";
        }
    }

    function stateStyle(state: ChoiceState): CSSProperties {
        if (state === "selected") return {borderColor: moduleColor};
        return {};
    }

    function stateIcon(state: ChoiceState) {
        if (state === "correct") return <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0"/>;
        if (state === "wrong")   return <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0"/>;
        return null;
    }

    // ── truefalse ────────────────────────────────────────────────
    if (question.type === "truefalse") {
        const opts = [{label: "Vrai", value: "true"}, {label: "Faux", value: "false"}];

        function tfState(value: string): ChoiceState {
            if (!hasFeedback) return selected === value ? "selected" : "neutral";
            const boolVal = value === "true";
            if (feedbackIsCorrect && selected === value) return "correct";
            if (!feedbackIsCorrect && correctAnswer === boolVal) return "correct";
            if (!feedbackIsCorrect && selected === value) return "wrong";
            return "dimmed";
        }

        return (
            <div role="radiogroup" aria-label="Choix de réponse" className="flex gap-2">
                {opts.map(({label, value}) => {
                    const s = tfState(value);
                    return (
                        <div key={value} className="flex-1 flex flex-col gap-1">
                            <button
                                type="button"
                                role="radio"
                                aria-checked={selected === value}
                                aria-disabled={s === "dimmed" ? true : undefined}
                                onClick={() => { if (disabled) return; setSelected(value); onAnswer(value === "true"); }}
                                className={cn(base, "justify-center", stateClass(s))}
                                style={stateStyle(s)}
                            >
                                {label}
                                {stateIcon(s)}
                            </button>
                            {s === "correct" && hasFeedback && explanation && (
                                <p className="text-[10px] px-2 pb-1 leading-relaxed text-green-800/80 dark:text-green-300/70">
                                    {explanation}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // ── mcq ──────────────────────────────────────────────────────
    if (question.type === "mcq") {
        function mcqState(idx: number): ChoiceState {
            if (!hasFeedback) return selected === String(idx) ? "selected" : "neutral";
            if (feedbackIsCorrect && selected === String(idx)) return "correct";
            if (!feedbackIsCorrect && correctAnswer === idx) return "correct";
            if (!feedbackIsCorrect && selected === String(idx)) return "wrong";
            return "dimmed";
        }

        return (
            <div role="radiogroup" aria-label="Choix de réponse" className="flex flex-col gap-1.5">
                {(question.choices ?? []).map((choice, idx) => {
                    const s = mcqState(idx);
                    return (
                        <div key={idx} className="flex flex-col">
                            <button
                                type="button"
                                role="radio"
                                aria-checked={selected === String(idx)}
                                aria-disabled={s === "dimmed" ? true : undefined}
                                onClick={() => { if (disabled) return; setSelected(String(idx)); onAnswer(idx); }}
                                className={cn(base, stateClass(s))}
                                style={stateStyle(s)}
                            >
                                <span className="flex-1">{choice}</span>
                                {stateIcon(s)}
                            </button>
                            {s === "correct" && hasFeedback && explanation && (
                                <p className="text-[10px] pl-5 py-1 leading-relaxed text-green-800/80 dark:text-green-300/70">
                                    {explanation}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // ── multi ─────────────────────────────────────────────────────
    function multiState(idx: number): ChoiceState {
        if (!hasFeedback) return multiSelected.includes(idx) ? "selected" : "neutral";
        const isInCorrect = Array.isArray(correctAnswer) && (correctAnswer as number[]).includes(idx);
        if (isInCorrect) return "correct";
        if (multiSelected.includes(idx)) return "wrong";
        return "dimmed";
    }

    return (
        <div aria-label="Choix de réponse (plusieurs réponses possibles)" className="flex flex-col gap-1.5">
            {(question.choices ?? []).map((choice, idx) => {
                const s = multiState(idx);
                const isSel = multiSelected.includes(idx);
                return (
                    <button
                        key={idx}
                        type="button"
                        aria-pressed={isSel}
                        aria-disabled={s === "dimmed" ? true : undefined}
                        onClick={() => {
                            if (disabled) return;
                            const next = isSel
                                ? multiSelected.filter(i => i !== idx)
                                : [...multiSelected, idx];
                            setMultiSelected(next);
                            onAnswer(next);
                        }}
                        className={cn(base, stateClass(s))}
                        style={stateStyle(s)}
                    >
                        <span className="flex items-center gap-2.5 flex-1">
                            <span
                                className={cn(
                                    "w-3.5 h-3.5 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-colors",
                                    s === "correct" ? "border-green-500 bg-green-500"
                                    : s === "wrong" ? "border-red-500 bg-red-500"
                                    : isSel ? "border-current"
                                    : "border-border"
                                )}
                                style={s === "selected" ? {borderColor: moduleColor, backgroundColor: moduleColor} : {}}
                            >
                                {(isSel || s === "correct") && <Check className="w-2 h-2 text-white"/>}
                            </span>
                            {choice}
                        </span>
                        {stateIcon(s)}
                    </button>
                );
            })}
            {hasFeedback && explanation && (
                <p className="text-[10px] px-2 py-1 leading-relaxed text-green-800/80 dark:text-green-300/70 bg-green-50/50 dark:bg-green-950/20 rounded-lg mt-0.5">
                    {explanation}
                </p>
            )}
        </div>
    );
}
```

- [ ] **Vérifier le lint**

```powershell
bun run lint
```

- [ ] **Tester visuellement** — dans le navigateur, répondre à une question et cliquer "Vérifier". Vérifier :
  - Bonne réponse → vert + ✓ + texte d'explication sous le choix
  - Mauvaise réponse → rouge + ✗ + bonne réponse révélée en vert
  - Autres → grisés

- [ ] **Commit**

```bash
git add src/components/quiz/QuizQuestion.tsx
git commit -m "feat: QuizQuestion — révélation complète des choix + explication inline"
```

---

## Task 5 — Refactorer `QuizGame` — split layout + sidebar

**Files:**
- Modify: `src/components/quiz/QuizGame.tsx`

Ce fichier est un remplacement complet. La nouvelle version :
- Supprime l'ancien header coloré (`bg-${modulePath}` bugué)
- Ajoute la sidebar (arc, steps, score) visible à partir de `sm:`
- Ajoute une barre de progression mobile (cachée à partir de `sm:`)
- Refactorise toutes les phases dans une structure `grid grid-cols-1 sm:grid-cols-[72px_1fr]`

- [ ] **Remplacer entièrement `src/components/quiz/QuizGame.tsx`**

```tsx
"use client";

import {useEffect, useState} from "react";
import type {CSSProperties} from "react";
import axios from "axios";
import {useRouter} from "next/navigation";
import {ClipboardCheck} from "lucide-react";
import {Button} from "@/components/ui/button";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import {QuizAnswer, QuizCheckResult, QuizQuestionClient} from "@/types/Quiz";
import {cn} from "@/lib/utils";

type QuizState = "loading" | "answering" | "checking" | "feedback" | "completing" | "summary" | "error";

interface QuizGameProps {
    moduleSlug: string;
    sectionSlug: string;
    modulePath: string;
    moduleTitle: string;
}

export default function QuizGame({moduleSlug, sectionSlug, modulePath, moduleTitle}: QuizGameProps) {
    const router = useRouter();
    const [state, setState] = useState<QuizState>("loading");
    const [questions, setQuestions] = useState<QuizQuestionClient[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState<QuizAnswer | null>(null);
    const [feedback, setFeedback] = useState<QuizCheckResult | null>(null);
    const [collectedAnswers, setCollectedAnswers] = useState<{questionId: string; answer: QuizAnswer}[]>([]);
    const [score, setScore] = useState<{score: number; total: number} | null>(null);
    const [questionResults, setQuestionResults] = useState<boolean[]>([]);
    const [errorMsg, setErrorMsg] = useState("");

    const moduleColor = `var(--color-${modulePath})`;
    const tpHref = `/${moduleSlug}/${sectionSlug}/TP`;

    function handleRetry() {
        setState("loading");
        axios.get<QuizQuestionClient[]>(`/api/quiz/${moduleSlug}/${sectionSlug}`)
            .then(({data}) => {
                setQuestions(data);
                setCurrentIndex(0);
                setCurrentAnswer(null);
                setFeedback(null);
                setCollectedAnswers([]);
                setScore(null);
                setQuestionResults([]);
                setState("answering");
            })
            .catch(() => {
                setErrorMsg("Impossible de charger le quiz. Réessayez plus tard.");
                setState("error");
            });
    }

    useEffect(() => {
        axios.get<QuizQuestionClient[]>(`/api/quiz/${moduleSlug}/${sectionSlug}`)
            .then(({data}) => {
                setQuestions(data);
                setCurrentIndex(0);
                setCurrentAnswer(null);
                setFeedback(null);
                setCollectedAnswers([]);
                setScore(null);
                setQuestionResults([]);
                setState("answering");
            })
            .catch(() => {
                setErrorMsg("Impossible de charger le quiz. Réessayez plus tard.");
                setState("error");
            });
    }, [moduleSlug, sectionSlug]);

    async function handleVerify() {
        if (currentAnswer === null) return;
        setState("checking");
        const question = questions[currentIndex];
        try {
            const {data} = await axios.post<QuizCheckResult>(
                `/api/quiz/${moduleSlug}/${sectionSlug}/check`,
                {questionId: question.id, answer: currentAnswer}
            );
            setFeedback(data);
            setCollectedAnswers(prev => [...prev, {questionId: question.id, answer: currentAnswer}]);
            setQuestionResults(prev => [...prev, data.isCorrect]);
            setState("feedback");
        } catch {
            setErrorMsg("Erreur lors de la vérification. Réessayez.");
            setState("error");
        }
    }

    async function handleNext() {
        const nextIndex = currentIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentIndex(nextIndex);
            setCurrentAnswer(null);
            setFeedback(null);
            setState("answering");
        } else {
            setState("completing");
            try {
                const {data} = await axios.post<{score: number; total: number}>(
                    `/api/quiz/${moduleSlug}/${sectionSlug}/complete`,
                    {answers: collectedAnswers}
                );
                setScore(data);
                setState("summary");
            } catch {
                setErrorMsg("Erreur lors de l'enregistrement. Réessayez.");
                setState("error");
            }
        }
    }

    const isLastQuestion = currentIndex === questions.length - 1;
    const currentQuestion = questions[currentIndex];
    const inQuiz = state === "answering" || state === "checking" || state === "feedback";
    const correctCount = questionResults.filter(Boolean).length;

    // Arc de progression — degré de remplissage du conic-gradient
    const arcDeg = (() => {
        if (questions.length === 0) return 0;
        switch (state) {
            case "feedback":   return Math.round(((currentIndex + 1) / questions.length) * 360);
            case "completing":
            case "summary":    return 360;
            default:           return Math.round((currentIndex / questions.length) * 360);
        }
    })();

    const arcLabel = (() => {
        if (questions.length === 0) return "—";
        if (state === "summary" || state === "completing") return `${questions.length}/${questions.length}`;
        if (state === "feedback") return `${currentIndex + 1}/${questions.length}`;
        return `${currentIndex}/${questions.length}`;
    })();

    // ── Sidebar (visible sm+) ─────────────────────────────────────
    const sidebar = (
        <aside
            className="hidden sm:flex flex-col items-center py-4 gap-2.5 relative overflow-hidden"
            style={{backgroundColor: moduleColor}}
            aria-label="Progression du quiz"
        >
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"/>

            {/* Icône */}
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-4 h-4 text-white" aria-hidden="true"/>
            </div>

            {/* Nom du module */}
            <p className="text-[8px] font-extrabold uppercase tracking-widest text-white/55 text-center px-1 leading-tight">
                {moduleTitle}
            </p>

            {/* Arc de progression */}
            <div
                className="w-11 h-11 rounded-full flex items-center justify-center relative shrink-0"
                style={{background: `conic-gradient(rgba(255,255,255,0.85) 0deg ${arcDeg}deg, rgba(255,255,255,0.2) ${arcDeg}deg 360deg)`}}
                aria-label={`Progression : ${arcLabel}`}
            >
                <div className="absolute w-8 h-8 rounded-full" style={{backgroundColor: moduleColor}}/>
                <span className="relative z-10 text-[8px] font-black text-white leading-none select-none">{arcLabel}</span>
            </div>

            {/* Étapes */}
            {questions.length > 0 && (
                <div className="flex flex-col gap-1" aria-hidden="true">
                    {questions.map((_, i) => {
                        const isDone = i < currentIndex || state === "summary" || state === "completing";
                        const isCurr = i === currentIndex && state !== "summary" && state !== "completing";
                        return (
                            <div
                                key={i}
                                style={isDone ? {color: moduleColor} : {}}
                                className={cn(
                                    "w-6 h-5 rounded-md flex items-center justify-center text-[8px] font-bold select-none",
                                    isDone ? "bg-white/85"
                                        : isCurr ? "bg-white/40 text-white"
                                        : "bg-white/20 text-white/50"
                                )}
                            >
                                {isDone ? "✓" : i + 1}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="flex-1"/>

            {/* Score live */}
            <div
                className="w-9 h-9 rounded-full border-2 border-white/25 bg-black/10 flex flex-col items-center justify-center"
                aria-label={`${correctCount} bonne${correctCount > 1 ? "s" : ""} réponse${correctCount > 1 ? "s" : ""}`}
            >
                <span className="text-sm font-black text-white leading-none">{correctCount}</span>
                <span className="text-[6px] text-white/55 uppercase tracking-wider">pts</span>
            </div>
        </aside>
    );

    // ── Barre de progression mobile (cachée sm+) ──────────────────
    const mobileProgress = questions.length > 0 ? (
        <div className="sm:hidden flex gap-1 px-4 pt-2" aria-hidden="true">
            {questions.map((_, i) => {
                const filledCount = state === "feedback" ? currentIndex + 1 : currentIndex;
                const isSummary = state === "summary";
                return (
                    <div
                        key={i}
                        className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors duration-300",
                            !isSummary && i >= filledCount ? "bg-bridge-700/20 dark:bg-bridge-500/20" : ""
                        )}
                        style={
                            isSummary
                                ? {backgroundColor: questionResults[i] ? "#22c55e" : "#ef4444"}
                                : i < filledCount ? {backgroundColor: moduleColor} : {}
                        }
                    />
                );
            })}
        </div>
    ) : null;

    return (
        <div
            style={{"--module-color": moduleColor} as CSSProperties}
            className="grid grid-cols-1 sm:grid-cols-[72px_1fr]"
        >
            {sidebar}

            <div className="flex flex-col">

                {/* LOADING */}
                {state === "loading" && (
                    <>
                        {mobileProgress}
                        <div className="px-4 py-10 flex flex-col items-center gap-3">
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map(i => (
                                    <span
                                        key={i}
                                        className="w-2 h-2 rounded-full animate-pulse"
                                        style={{backgroundColor: moduleColor, animationDelay: `${i * 150}ms`}}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-bridge-600 dark:text-bridge-400">Chargement du quiz…</p>
                        </div>
                    </>
                )}

                {/* ERROR */}
                {state === "error" && (
                    <div className="px-4 py-5 flex flex-col gap-4">
                        <h2 className="text-base font-semibold text-brand-dark dark:text-bridge-100">
                            Quelque chose s&apos;est mal passé
                        </h2>
                        <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
                        <div className="flex justify-end">
                            <Button onClick={handleRetry} style={{backgroundColor: moduleColor}} className="text-white dark:text-brand-dark">
                                Réessayer
                            </Button>
                        </div>
                    </div>
                )}

                {/* QUIZ — answering / checking / feedback */}
                {inQuiz && currentQuestion && (
                    <>
                        {mobileProgress}
                        <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span
                                    className="text-[9px] font-extrabold uppercase tracking-[0.16em]"
                                    style={{color: moduleColor}}
                                >
                                    Question
                                </span>
                                <span className="text-[9px] text-bridge-500 dark:text-bridge-400">
                                    {currentIndex + 1} / {questions.length}
                                </span>
                            </div>

                            <h2 className="text-sm font-bold leading-snug text-brand-dark dark:text-bridge-100">
                                {currentQuestion.text}
                            </h2>

                            <QuizQuestion
                                key={currentQuestion.id}
                                question={currentQuestion}
                                onAnswer={(answer) => setCurrentAnswer(answer)}
                                disabled={state === "checking" || state === "feedback"}
                                feedbackIsCorrect={state === "feedback" && feedback ? feedback.isCorrect : undefined}
                                moduleColor={moduleColor}
                                explanation={state === "feedback" && feedback ? feedback.explanation : undefined}
                                correctAnswer={state === "feedback" && feedback ? feedback.correctAnswer : undefined}
                            />

                            <div className="flex justify-end pt-1">
                                {state === "feedback" ? (
                                    <Button
                                        onClick={handleNext}
                                        style={{backgroundColor: moduleColor}}
                                        className="text-white dark:text-brand-dark"
                                    >
                                        {isLastQuestion ? "Terminer" : "Suivant →"}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleVerify}
                                        disabled={currentAnswer === null || state === "checking"}
                                        style={currentAnswer !== null ? {backgroundColor: moduleColor} : {}}
                                        className="text-white dark:text-brand-dark"
                                    >
                                        {state === "checking" ? "Vérification…" : "Vérifier"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* COMPLETING */}
                {state === "completing" && (
                    <>
                        {mobileProgress}
                        <div className="px-4 py-10 flex flex-col items-center gap-3">
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map(i => (
                                    <span
                                        key={i}
                                        className="w-2 h-2 rounded-full animate-pulse"
                                        style={{backgroundColor: moduleColor, animationDelay: `${i * 150}ms`}}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-bridge-600 dark:text-bridge-400">Enregistrement des résultats…</p>
                        </div>
                    </>
                )}

                {/* SUMMARY */}
                {state === "summary" && score && (
                    <>
                        {mobileProgress}
                        <div className="px-4 py-4 flex flex-col gap-3">
                            <span
                                className="text-[9px] font-extrabold uppercase tracking-widest"
                                style={{color: moduleColor}}
                            >
                                Récapitulatif
                            </span>

                            <div className="flex flex-col gap-1.5">
                                {questions.map((q, i) => (
                                    <div key={q.id} className="flex items-center gap-2">
                                        <span className={cn(
                                            "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0",
                                            questionResults[i]
                                                ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                                                : "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                                        )}>
                                            {questionResults[i] ? "✓" : "✗"}
                                        </span>
                                        <span className="text-[11px] text-brand-dark dark:text-bridge-200 truncate leading-snug">
                                            {q.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-bridge-700/15 dark:bg-bridge-500/15 -mx-4"/>

                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={() => router.push(tpHref)}>
                                    Retour au TP
                                </Button>
                                <Button
                                    onClick={handleRetry}
                                    style={{backgroundColor: moduleColor}}
                                    className="text-white dark:text-brand-dark"
                                >
                                    Réessayer
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Vérifier le lint**

```powershell
bun run lint
```

- [ ] **Tester visuellement — phase question**

Ouvrir le quiz dans le navigateur. Sur desktop (> 640px) : vérifier que la sidebar apparaît (fond couleur module, icône, arc 0/N, étapes numérotées, score 0). Sur mobile (< 640px) : vérifier que la sidebar est cachée et la barre de progression mobile apparaît.

- [ ] **Tester visuellement — phase feedback**

Répondre à une question et cliquer "Vérifier". Vérifier :
- L'arc de progression monte d'un cran
- L'étape courante passe à ✓ dans la sidebar
- La révélation complète s'affiche dans le main

- [ ] **Tester visuellement — écran résultat**

Terminer toutes les questions. Vérifier :
- Sidebar : arc plein, toutes les étapes ✓, score final
- Main : label "RÉCAPITULATIF" + liste des questions avec ✓/✗ + boutons

- [ ] **Commit**

```bash
git add src/components/quiz/QuizGame.tsx
git commit -m "feat: QuizGame — split sidebar, arc progression, révélation, récap résultat"
```

---

## Checklist finale

- [ ] `bun run build` passe sans erreur
- [ ] La page quiz s'affiche correctement sur desktop et mobile
- [ ] Mode dark vérifié (fond sidebar, textes, feedback)
- [ ] Aucune classe Tailwind dynamique (`bg-${...}`) dans le code modifié — toutes remplacées par inline styles
