# Quiz de clôture du TP — Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un quiz de clôture déclenché depuis le bas de chaque page TP. L'étudiant connecté répond question par question avec feedback immédiat. Les bonnes réponses ne quittent jamais le serveur. Les résultats sont persistés dans MongoDB.

**Architecture:** Questions stockées dans le document section MongoDB (champ `quiz`). Trois Route Handlers étudiants (GET, POST /check, POST /complete) + deux Route Handlers admin (GET+PUT). Un Dialog shadcn côté client avec machine d'états. Un QuizEditorSheet admin accessible depuis AdminSection.

**Contrainte de sécurité absolue:** Les champs `correct` et `explanation` ne sont jamais sérialisés vers le client. L'explication est renvoyée uniquement via la réponse de `POST /check`, après validation serveur. Le `POST /complete` revalide toutes les réponses côté serveur indépendamment des données client.

**Tech Stack:** Next.js App Router, MongoDB driver natif, shadcn/ui Dialog + RadioGroup + Checkbox, react-hook-form useFieldArray (QuizEditorSheet), Zod (`safeParse`) aux frontières API.

---

## Modèle de données

### Extension `Section` (MongoDB)

```ts
// src/types/Section.ts — nouveau champ
quiz?: {
    questions: QuizQuestion[]  // correct + explanation stockés, jamais envoyés au client
}
```

### `src/types/Quiz.ts`

```ts
export type QuizQuestionType = 'mcq' | 'multi' | 'truefalse';

// Stocké en DB — correct et explanation ne quittent jamais le serveur
export interface QuizQuestion {
    id: string;
    type: QuizQuestionType;
    text: string;
    choices?: string[];
    correct: number | number[] | boolean;
    explanation: string;
}

// Version sanitisée envoyée au client via GET /api/quiz
export interface QuizQuestionClient {
    id: string;
    type: QuizQuestionType;
    text: string;
    choices?: string[];
}

// Réponse du POST /check
export interface QuizCheckResult {
    isCorrect: boolean;
    explanation: string;
}

// Document dans la collection quiz_attempts
export interface QuizAttempt {
    _id?: string | ObjectId;
    userId: string;
    moduleSlug: string;
    sectionSlug: string;
    score: number;
    total: number;
    completedAt: Date;
    answers: {
        questionId: string;
        answer: number | number[] | boolean;
        isCorrect: boolean;
    }[];
}

export type QuizAnswer = number | number[] | boolean;
```

---

## Routes API étudiants

### `GET /api/quiz/[moduleSlug]/[sectionSlug]`

- Auth : `getServerSession()` → 401 si non connecté.
- Recherche le module par `path === moduleSlug`, puis la section par `path === sectionSlug`.
- Retourne `questions.map(({ id, type, text, choices }) => ...)` — `correct` et `explanation` exclus.
- 404 si section introuvable ou si `quiz` absent.

### `POST /api/quiz/[moduleSlug]/[sectionSlug]/check`

- Auth : session requise.
- Body validé par `quizCheckSchema` (`{ questionId, answer }`).
- Charge la question depuis MongoDB par `questionId`.
- Compare `answer` avec `correct` (égalité stricte pour mcq/truefalse, ensemble pour multi).
- Retourne `{ isCorrect: boolean, explanation: string }`.
- Ne sauvegarde rien.

### `POST /api/quiz/[moduleSlug]/[sectionSlug]/complete`

- Auth : session requise.
- Body validé par `quizCompleteSchema` (`{ answers: [{ questionId, answer }] }`).
- Revalide **toutes** les réponses côté serveur (les isCorrect du client sont ignorés).
- Insère un document dans la collection `quiz_attempts`.
- Retourne `{ score: number, total: number }`.

---

## Routes API admin

### `GET /api/admin/quiz/[moduleSlug]/[sectionSlug]`

- Protégé par `withAdmin()`.
- Retourne `section.quiz.questions` complet (avec `correct` et `explanation`) pour l'édition.

### `PUT /api/admin/quiz/[moduleSlug]/[sectionSlug]`

- Protégé par `withAdmin()`.
- Body validé par `quizQuestionsSchema` (tableau de questions complètes).
- `updateOne` sur le module : `$set: { 'sections.N.quiz.questions': questions }` où N est l'index de la section.
- Retourne `{ ok: true }`.

---

## Schémas Zod (`src/lib/schemas/quiz.schema.ts`)

```ts
// POST /check
export const quizCheckSchema = z.object({
    questionId: z.string(),
    answer: z.union([z.number(), z.array(z.number()), z.boolean()]),
});

// POST /complete
export const quizCompleteSchema = z.object({
    answers: z.array(z.object({
        questionId: z.string(),
        answer: z.union([z.number(), z.array(z.number()), z.boolean()]),
    })),
});

// PUT /api/admin/quiz
export const quizQuestionsSchema = z.array(z.object({
    id: z.string(),
    type: z.enum(['mcq', 'multi', 'truefalse']),
    text: z.string().min(1),
    choices: z.array(z.string()).optional(),
    correct: z.union([z.number(), z.array(z.number()), z.boolean()]),
    explanation: z.string().min(1),
}));
```

---

## Composants client

### `src/components/quiz/QuizProgress.tsx`

Barre de progression step-based (N questions sur total).

- Visuellement : `h-1.5 rounded-full`, couleur module via `style={{ backgroundColor: moduleColor }}`.
- Props : `current: number`, `total: number`, `modulePath: string`.
- Reproduit le style de `ReadingProgress.tsx` (fin barre, module color).

### `src/components/quiz/QuizQuestion.tsx`

Affiche une question et ses choix selon le type.

- `mcq` → `RadioGroup` + `RadioGroupItem` (shadcn).
- `multi` → groupe de `Checkbox` (shadcn).
- `truefalse` → deux `RadioGroupItem` "Vrai" / "Faux".
- Props : `question: QuizQuestionClient`, `onAnswer: (answer: QuizAnswer) => void`, `disabled?: boolean`.
- Désactivé après vérification (`disabled` = true pendant feedback).

### `src/components/quiz/QuizFeedback.tsx`

Affiché après `POST /check`.

- Surface colorée : warm green si correct, warm red si incorrect.
- Icône ✓ ou ✗ + message d'explication.
- Ne révèle pas la bonne réponse, explique le concept.
- Props : `isCorrect: boolean`, `explanation: string`.

### `src/components/quiz/QuizDialog.tsx` (`'use client'`)

Machine d'états orchestrant le flux complet.

```
'idle'
  → clic bouton → fetch questions → 'answering' (question[0])
  → sélection réponse → clic "Vérifier" → POST /check → 'checking'
  → réponse reçue → 'feedback' (isCorrect + explanation)
  → clic "Suivant" → 'answering' (question[i+1])
  → (dernière question) clic "Terminer" → POST /complete → 'completing'
  → réponse reçue → 'summary' (score final)
  → clic "Réessayer" → retour 'answering' (question[0]) avec réinitialisation
  → clic "Fermer" → 'idle'
```

- Accumule les réponses localement `{ questionId, answer }[]` pour le POST /complete.
- Utilise `Dialog` + `DialogContent` de `src/components/ui/dialog.tsx`.
- En-tête : `QuizProgress` + "Question N / total".
- Bouton déclencheur affiché directement dans `page.tsx` (pas géré dans QuizDialog).
- Props : `moduleSlug: string`, `sectionSlug: string`, `modulePath: string`, `questionCount: number`, `open: boolean`, `onOpenChange: (open: boolean) => void`.

### `src/components/admin/QuizEditorSheet.tsx` (`'use client'`)

Éditeur de questions pour l'admin.

- Pattern `Sheet` + `AdminSheetHeader` (icon=`ClipboardList`, eyebrow="Quiz", title="Éditeur de quiz").
- `useFieldArray` (react-hook-form) pour la liste des questions.
- Par question : select type / textarea texte / champs choices dynamiques / correct / textarea explication.
  - `correct` MCQ : radio parmi les choices (index).
  - `correct` Multi : checkboxes (tableau d'index).
  - `correct` Vrai/Faux : toggle (boolean).
- Footer sticky : "Enregistrer" → PUT `/api/admin/quiz/[mod]/[sec]`.
- Props : `section: Section`, `modData: Module`, `open: boolean`, `onOpenChange: (open: boolean) => void`.

---

## Modifications de fichiers existants

### `src/types/Section.ts`

Ajouter l'import de `QuizQuestion` et le champ `quiz`.

### `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`

Après `</main>`, avant `<TableOfContents>`, insérer le bouton quiz conditionnel :

```tsx
{currentContent === 'TP' && (currentSection.quiz?.questions?.length ?? 0) > 0 && session && (
    <div className="w-full max-w-7xl mx-auto px-3 lg:px-4 pb-8 flex justify-center">
        <QuizTrigger
            moduleSlug={moduleSlug}
            sectionSlug={sectionSlug}
            modulePath={currentModule.path}
            questionCount={currentSection.quiz!.questions.length}
        />
    </div>
)}
```

`QuizTrigger` est un petit composant client qui gère l'état `open` et rend le bouton + le `QuizDialog`.

### `src/hook/admin/useAdminApi.ts`

Ajouter :

```ts
async function saveQuiz(moduleSlug: string, sectionSlug: string, questions: QuizQuestion[]) {
    const res = await axios.put(`/api/admin/quiz/${moduleSlug}/${sectionSlug}`, questions);
    return res.data;
}
```

### `src/components/admin/AdminSection.tsx`

Dans le header (flex justify-between), ajouter un bouton "Quiz" à côté du bouton d'édition de section :

```tsx
<div className="flex items-center gap-2">
    <QuizEditorButton section={currentSection} modData={modData} />
    <EditSectionButton ... />
</div>
```

`QuizEditorButton` = composant client stateful gérant l'`open` du `QuizEditorSheet`.

---

## Checklist d'implémentation

- [ ] `src/types/Quiz.ts` — types complets (QuizQuestion, QuizQuestionClient, QuizCheckResult, QuizAttempt, QuizAnswer)
- [ ] `src/types/Section.ts` — ajouter `quiz?: { questions: QuizQuestion[] }`
- [ ] `src/lib/schemas/quiz.schema.ts` — quizCheckSchema, quizCompleteSchema, quizQuestionsSchema
- [ ] `src/app/api/quiz/[moduleSlug]/[sectionSlug]/route.ts` — GET questions sanitisées
- [ ] `src/app/api/quiz/[moduleSlug]/[sectionSlug]/check/route.ts` — POST /check
- [ ] `src/app/api/quiz/[moduleSlug]/[sectionSlug]/complete/route.ts` — POST /complete
- [ ] `src/app/api/admin/quiz/[moduleSlug]/[sectionSlug]/route.ts` — GET+PUT admin
- [ ] `src/components/quiz/QuizProgress.tsx`
- [ ] `src/components/quiz/QuizQuestion.tsx`
- [ ] `src/components/quiz/QuizFeedback.tsx`
- [ ] `src/components/quiz/QuizDialog.tsx` — machine d'états complète
- [ ] `src/components/quiz/QuizTrigger.tsx` — bouton + dialog wrapper stateful
- [ ] Intégration dans `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx`
- [ ] `src/components/admin/QuizEditorSheet.tsx`
- [ ] `src/hook/admin/useAdminApi.ts` — ajouter saveQuiz
- [ ] `src/components/admin/QuizEditorButton.tsx` — wrapper stateful pour AdminSection
- [ ] Intégration dans `src/components/admin/AdminSection.tsx`

---

## Vérification

1. Insérer manuellement un quiz via MongoDB Compass dans `sections[N].quiz.questions`.
2. Aller sur `/[mod]/[sec]/TP` en tant qu'étudiant connecté → bouton visible en bas.
3. Ouvrir le Dialog → onglet Network : les questions ne contiennent pas `correct` ni `explanation`.
4. Répondre → `/check` retourne `{ isCorrect, explanation }`, pas de `correct`.
5. Terminer → `/complete` insère dans `quiz_attempts`, les isCorrect client sont ignorés (revalidation serveur).
6. Admin : bouton "Quiz" dans `AdminSection` → créer questions → "Enregistrer" → vérifier dans Compass.
7. Réessayer le quiz → nouvel attempt distinct en DB.
