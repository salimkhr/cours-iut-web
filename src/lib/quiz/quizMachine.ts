import type {QuizPhase, QuizSession} from "@/lib/quiz/quizTypes";

export class InvalidTransitionError extends Error {
    constructor(from: QuizPhase, action: string) {
        super(`Transition impossible : « ${action} » depuis l'état « ${from} »`);
        this.name = "InvalidTransitionError";
    }
}

type MachineState = Pick<QuizSession, "phase" | "questionIndex" | "questionStartedAt" | "deadline" | "endedAt"> & {
    quiz: {questions: {durationSeconds: number}[]};
};

function open<T extends MachineState>(session: T, index: number, now: number): T {
    const question = session.quiz.questions[index];
    return {
        ...session,
        phase: "question_open",
        questionIndex: index,
        questionStartedAt: now,
        deadline: now + question.durationSeconds * 1000,
    };
}

/** lobby → question_open (question 0). */
export function startQuiz<T extends MachineState>(session: T, now: number): T {
    if (session.phase !== "lobby") throw new InvalidTransitionError(session.phase, "démarrer");
    if (session.quiz.questions.length === 0) throw new Error("Le quiz ne contient aucune question");
    return open(session, 0, now);
}

/** question_open → reveal (échéance atteinte ou fermeture manuelle). */
export function closeQuestion<T extends MachineState>(session: T): T {
    if (session.phase !== "question_open") throw new InvalidTransitionError(session.phase, "fermer la question");
    return {...session, phase: "reveal", questionStartedAt: null, deadline: null};
}

/**
 * « Suivant » de l'enseignant :
 * - reveal → leaderboard : le classement s'intercale entre la correction et la question suivante ;
 * - reveal de la dernière question → finished : l'écran final porte déjà le podium ;
 * - leaderboard → question_open (index + 1).
 */
export function nextQuestion<T extends MachineState>(session: T, now: number): T {
    if (session.phase === "leaderboard") return open(session, session.questionIndex + 1, now);
    if (session.phase !== "reveal") throw new InvalidTransitionError(session.phase, "question suivante");
    if (session.questionIndex + 1 >= session.quiz.questions.length) {
        return {...session, phase: "finished", questionStartedAt: null, deadline: null, endedAt: now};
    }
    return {...session, phase: "leaderboard"};
}

/** Une réponse est acceptée tant que `now` est strictement avant l'échéance. */
export function isOpenAt(session: Pick<QuizSession, "phase" | "deadline">, now: number): boolean {
    return session.phase === "question_open" && session.deadline !== null && now < session.deadline;
}
