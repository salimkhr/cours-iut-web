import type {Block} from "@/types/CourseContent";
import {windowMs} from "@/lib/quiz/quizMachine";
import type {QuizAnswer, QuizParticipant, QuizPhase, QuizQuestion, QuizSession} from "@/lib/quiz/quizTypes";
import {participantSeed, questionsFor, shuffleOptions} from "@/lib/quiz/quizOptionOrder";

export type QuizAudience = "projection" | {userId: string};

export interface PublicQuestion {
    id: string;
    index: number;
    total: number;
    blocks: Block[];
    /** Propositions sans indicateur de justesse. */
    options: {id: string; text: string}[];
    expectedCount: number;
    /** Durée accordée à ce destinataire (tiers-temps compris), en secondes. */
    durationSeconds: number;
}

interface BaseState {
    sessionId: string;
    moduleTitle: string;
    /** Porte la couleur identitaire du module sur les écrans du quiz. */
    moduleSlug: string;
    phase: QuizPhase;
    participantCount: number;
    /** Phase `running` : la question du participant ; phase `review` : la question corrigée. */
    question: PublicQuestion | null;
    /** epoch ms : l'échéance fixée par le serveur pour ce destinataire. */
    deadline: number | null;
    serverNow: number;
}

export interface ProjectionState extends BaseState {
    audience: "projection";
    shortCode: string;
    /** Phase `running` : participants qui ont répondu ou laissé passer toutes les questions. */
    finishedCount: number;
    /** Phase `review` : réponses non vides reçues sur la question corrigée. */
    answeredCount: number;
    /** Renseigné uniquement en `review`. */
    correctIds: string[] | null;
    /** `review` : nombre d'étudiants ayant coché chaque proposition (id → effectif). */
    optionCounts: Record<string, number> | null;
}

export interface StudentReveal {
    correctIds: string[];
    selectedIds: string[];
    scoreObtained: number;
    scoreMax: number;
}

export interface StudentState extends BaseState {
    audience: "student";
    /** Phase `running` : le participant a traité toutes les questions. */
    done: boolean;
    reveal: StudentReveal | null;
    score: number;
    scoreMax: number;
}

export type QuizPublicState = ProjectionState | StudentState;

export interface StateData {
    session: QuizSession;
    participants: QuizParticipant[];
    /** Phase `review` : réponses de la question corrigée uniquement. */
    currentAnswers: QuizAnswer[];
    now: number;
}

function toPublic(session: QuizSession, question: QuizQuestion, index: number, durationSeconds: number): PublicQuestion {
    return {
        id: question.id,
        index,
        total: session.quiz.questions.length,
        blocks: question.blocks,
        // Mélangées, mais dans le même ordre pour la projection et chaque étudiant (graine session + question).
        options: shuffleOptions(question.options.map(({id, text}) => ({id, text})), `${session.id}:${question.id}`),
        expectedCount: question.options.filter((o) => o.correct).length,
        durationSeconds,
    };
}

function reviewQuestion(session: QuizSession): PublicQuestion | null {
    if (session.phase !== "review") return null;
    const question = session.quiz.questions[session.questionIndex];
    return question ? toPublic(session, question, session.questionIndex, question.durationSeconds) : null;
}

const isDone = (session: QuizSession, p: QuizParticipant) => (p.currentIndex ?? -1) >= session.quiz.questions.length;

function base(data: StateData): Omit<BaseState, "question" | "deadline"> {
    const {session, participants, now} = data;
    return {
        sessionId: session.id,
        moduleTitle: session.moduleTitle,
        moduleSlug: session.moduleSlug,
        phase: session.phase,
        participantCount: participants.length,
        serverNow: now,
    };
}

function correctIdsOf(session: QuizSession): string[] {
    const question = session.quiz.questions[session.questionIndex];
    return question ? question.options.filter((o) => o.correct).map((o) => o.id) : [];
}

function countChoices(session: QuizSession, answers: QuizAnswer[]): Record<string, number> {
    const question = session.quiz.questions[session.questionIndex];
    const counts: Record<string, number> = Object.fromEntries((question?.options ?? []).map((o) => [o.id, 0]));
    for (const a of answers) {
        for (const id of a.selectedIds) if (id in counts) counts[id]++;
    }
    return counts;
}

export function totalPossible(session: QuizSession): number {
    return session.quiz.questions.reduce((sum, q) => sum + q.weight, 0);
}

export function toProjectionState(data: StateData): ProjectionState {
    const {session, participants, currentAnswers} = data;
    return {
        ...base(data),
        // En phase `running`, chacun est sur sa propre question : la projection n'en montre aucune.
        question: reviewQuestion(session),
        deadline: null,
        audience: "projection",
        shortCode: session.shortCode,
        finishedCount: session.phase === "running" ? participants.filter((p) => isDone(session, p)).length : 0,
        // Les absents reçoivent une réponse vide : ce ne sont pas des réponses reçues.
        answeredCount: session.phase === "review" ? currentAnswers.filter((a) => a.selectedIds.length > 0).length : 0,
        correctIds: session.phase === "review" ? correctIdsOf(session) : null,
        optionCounts: session.phase === "review" ? countChoices(session, currentAnswers) : null,
    };
}

export function toStudentState(data: StateData, userId: string): StudentState {
    const {session, participants, currentAnswers} = data;
    const me = participants.find((p) => p.userId === userId);

    let question: PublicQuestion | null = null;
    let deadline: number | null = null;
    if (session.phase === "running" && me) {
        // Seule la question en cours du participant, dans son ordre à lui : jamais la suivante,
        // jamais la correction. `index` est sa position (« Question 3 sur 21 »).
        const index = me.currentIndex ?? -1;
        const current = questionsFor(session.quiz.questions, participantSeed(session.id, userId))[index];
        if (current && me.deadline != null) {
            question = toPublic(session, current, index, windowMs(current.durationSeconds, me.extraTime === true) / 1000);
            deadline = me.deadline;
        }
    } else {
        question = reviewQuestion(session);
    }

    const mine = currentAnswers.find((a) => a.userId === userId);
    const corrected = session.phase === "review" || session.phase === "finished";
    return {
        ...base(data),
        question,
        deadline,
        audience: "student",
        done: session.phase === "running" && me !== undefined && isDone(session, me),
        reveal: session.phase === "review"
            ? {
                correctIds: correctIdsOf(session),
                selectedIds: mine?.selectedIds ?? [],
                scoreObtained: mine?.scoreObtained ?? 0,
                scoreMax: session.quiz.questions[session.questionIndex]?.weight ?? 0,
            }
            : null,
        // Le score cumulé dirait, question après question, si la réponse était juste : rien avant la correction.
        score: corrected ? me?.score ?? 0 : 0,
        scoreMax: totalPossible(session),
    };
}

export function buildState(data: StateData, audience: QuizAudience): QuizPublicState {
    return audience === "projection" ? toProjectionState(data) : toStudentState(data, audience.userId);
}
