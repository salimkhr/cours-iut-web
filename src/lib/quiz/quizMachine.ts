import type {QuizPhase, QuizSession} from "@/lib/quiz/quizTypes";

/** Tiers-temps : un tiers de temps en plus sur chaque question. */
export const EXTRA_TIME_FACTOR = 4 / 3;

export class InvalidTransitionError extends Error {
    constructor(from: QuizPhase, action: string) {
        super(`Transition impossible : « ${action} » depuis l'état « ${from} »`);
        this.name = "InvalidTransitionError";
    }
}

type MachineState = Pick<QuizSession, "phase" | "questionIndex" | "startedAt" | "endedAt"> & {
    quiz: {questions: unknown[]};
};

/** lobby → running : chacun commence la question 0. */
export function startQuiz<T extends MachineState>(session: T, now: number): T {
    if (session.phase !== "lobby") throw new InvalidTransitionError(session.phase, "démarrer");
    if (session.quiz.questions.length === 0) throw new Error("Le quiz ne contient aucune question");
    return {...session, phase: "running", startedAt: now, questionIndex: -1};
}

/** running → review (question 0) : tout le monde a fini, ou l'enseignant passe à la correction. */
export function startReview<T extends MachineState>(session: T): T {
    if (session.phase !== "running") throw new InvalidTransitionError(session.phase, "passer à la correction");
    return {...session, phase: "review", questionIndex: 0};
}

/** « Suivant » pendant la correction ; après la dernière question, l'écran de fin. */
export function nextReview<T extends MachineState>(session: T, now: number): T {
    if (session.phase !== "review") throw new InvalidTransitionError(session.phase, "question suivante");
    if (session.questionIndex + 1 >= session.quiz.questions.length) {
        return {...session, phase: "finished", endedAt: now};
    }
    return {...session, questionIndex: session.questionIndex + 1};
}

// ── Progression d'un participant ────────────────────────────────────────────

export interface Progress {
    currentIndex: number;
    questionStartedAt: number | null;
    deadline: number | null;
}

/** Durée accordée à une question, en ms. */
export function windowMs(durationSeconds: number, extraTime: boolean): number {
    return Math.round(durationSeconds * 1000 * (extraTime ? EXTRA_TIME_FACTOR : 1));
}

/** Ouvre la question `index` à `at`, ou marque le participant comme ayant terminé. */
export function progressAt(questions: {durationSeconds: number}[], index: number, at: number, extraTime: boolean): Progress {
    const question = questions[index];
    if (!question) return {currentIndex: questions.length, questionStartedAt: null, deadline: null};
    return {currentIndex: index, questionStartedAt: at, deadline: at + windowMs(question.durationSeconds, extraTime)};
}

/** Une réponse est acceptée tant que `now` est strictement avant l'échéance du participant. */
export function isOpenAt(progress: Pick<Progress, "deadline">, now: number): boolean {
    return progress.deadline !== null && now < progress.deadline;
}

/** Temps ramené à la durée normale : le tiers-temps n'apparaît pas dans les temps relevés. */
export function normalizedTime(elapsedMs: number, extraTime: boolean): number {
    return Math.round(Math.max(0, elapsedMs) / (extraTime ? EXTRA_TIME_FACTOR : 1));
}
