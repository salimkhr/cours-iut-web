import type {Block} from "@/types/CourseContent";

export interface QuizOption {
    id: string;
    text: string;
    correct: boolean;
}

export interface QuizQuestion {
    id: string;
    position: number;
    blocks: Block[];
    options: QuizOption[];
    weight: number;
    durationSeconds: number;
}

export interface Quiz {
    id: string;
    moduleId: string;
    negativeMarking: boolean;
    questions: QuizQuestion[];
    createdAt: string;
    updatedAt: string;
}

/**
 * - `running` : chaque participant enchaîne les questions seul, avec son propre chrono ;
 * - `review` : la classe reparcourt les questions, correction projetée (`questionIndex`) ;
 * - `finished` : écran de fin (score de chacun sur son écran).
 */
export type QuizPhase = "lobby" | "running" | "review" | "finished";

/** Instantané du quiz copié dans la session au lancement. */
export interface QuizSnapshot {
    negativeMarking: boolean;
    questions: QuizQuestion[];
}

export interface QuizSession {
    id: string;
    moduleId: string;
    moduleSlug: string;
    moduleTitle: string;
    teacherId: string;
    joinCode: string;
    shortCode: string;
    quiz: QuizSnapshot;
    phase: QuizPhase;
    /** Question corrigée en `review` ; -1 sinon. */
    questionIndex: number;
    /** epoch ms du démarrage (phase `running`) ; null en lobby. */
    startedAt: number | null;
    createdAt: number;
    endedAt: number | null;
    /** Absent une fois la session terminée : le TTL ne purge que les sessions abandonnées. */
    expiresAt?: Date;
}

export interface QuizParticipant {
    sessionId: string;
    userId: string;
    firstName: string;
    lastName: string;
    group: string | null;
    /** Absent des participants créés avant l'export ScoDoc. */
    email?: string | null;
    /** Identifiant IUT ; absent des participants créés avant l'appariement par identifiant. */
    username?: string | null;
    joinedAt: number;
    score: number;
    /** Temps cumulé ramené à la durée normale (divisé par 4/3 en tiers-temps), affiché dans les résultats. */
    timeMs: number;
    /** Tiers-temps, copié du compte au moment de rejoindre. Jamais diffusé hors de son propre état. */
    extraTime?: boolean;
    /** Question en cours (-1 avant le départ, `questions.length` une fois terminé). */
    currentIndex?: number;
    /** epoch ms ; null hors question en cours. */
    questionStartedAt?: number | null;
    deadline?: number | null;
}

export interface QuizAnswer {
    sessionId: string;
    questionId: string;
    userId: string;
    selectedIds: string[];
    submittedAt: number;
    timeMs: number;
    scoreObtained: number;
    scoreMax: number;
}
