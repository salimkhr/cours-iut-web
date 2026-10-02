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

export type QuizPhase = "lobby" | "question_open" | "reveal" | "finished";

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
    /** Index de la question courante (-1 en lobby). */
    questionIndex: number;
    /** epoch ms ; null hors question ouverte. */
    questionStartedAt: number | null;
    deadline: number | null;
    createdAt: number;
    endedAt: number | null;
    expiresAt: Date;
}

export interface QuizParticipant {
    sessionId: string;
    userId: string;
    firstName: string;
    lastName: string;
    group: string | null;
    joinedAt: number;
    score: number;
    timeMs: number;
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
