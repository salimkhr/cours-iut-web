import type {Block} from "@/types/CourseContent";
import {formatPublicName, rankParticipants, topOfPodium} from "@/lib/quiz/quizPodium";
import type {QuizAnswer, QuizParticipant, QuizPhase, QuizSession} from "@/lib/quiz/quizTypes";
import {shuffleOptions} from "@/lib/quiz/quizOptionOrder";

export type QuizAudience = "projection" | {userId: string};

export interface PublicQuestion {
    id: string;
    index: number;
    total: number;
    blocks: Block[];
    /** Propositions sans indicateur de justesse. */
    options: {id: string; text: string}[];
    expectedCount: number;
    durationSeconds: number;
}

export interface PodiumEntry {
    rank: number;
    name: string;
    score: number;
}

interface BaseState {
    sessionId: string;
    moduleTitle: string;
    /** Porte la couleur identitaire du module sur les écrans du quiz. */
    moduleSlug: string;
    phase: QuizPhase;
    participantCount: number;
    question: PublicQuestion | null;
    /** epoch ms : l'échéance fixée par le serveur. */
    deadline: number | null;
    serverNow: number;
}

export interface ProjectionState extends BaseState {
    audience: "projection";
    joinCode: string;
    shortCode: string;
    answeredCount: number;
    /** Renseigné uniquement à partir de `reveal`. */
    correctIds: string[] | null;
    /** Renseigné en `leaderboard` et `finished` seulement. Jamais plus que le haut du classement. */
    podium: PodiumEntry[];
}

export interface StudentReveal {
    correctIds: string[];
    selectedIds: string[];
    scoreObtained: number;
    scoreMax: number;
}

export interface StudentState extends BaseState {
    audience: "student";
    /** Réponse déjà envoyée pour la question courante (verrouillée). */
    answer: {selectedIds: string[]} | null;
    reveal: StudentReveal | null;
    score: number;
    scoreMax: number;
    rank: number | null;
}

export type QuizPublicState = ProjectionState | StudentState;

export interface StateData {
    session: QuizSession;
    participants: QuizParticipant[];
    /** Réponses de la question courante uniquement. */
    currentAnswers: QuizAnswer[];
    now: number;
}

function publicQuestion(session: QuizSession): PublicQuestion | null {
    if (session.questionIndex < 0 || session.phase === "lobby" || session.phase === "finished") return null;
    const question = session.quiz.questions[session.questionIndex];
    if (!question) return null;
    return {
        id: question.id,
        index: session.questionIndex,
        total: session.quiz.questions.length,
        blocks: question.blocks,
        // Mélangées, mais dans le même ordre pour la projection et les téléphones (graine session + question).
        options: shuffleOptions(question.options.map(({id, text}) => ({id, text})), `${session.id}:${question.id}`),
        expectedCount: question.options.filter((o) => o.correct).length,
        durationSeconds: question.durationSeconds,
    };
}

function base(data: StateData): BaseState {
    const {session, participants, now} = data;
    return {
        sessionId: session.id,
        moduleTitle: session.moduleTitle,
        moduleSlug: session.moduleSlug,
        phase: session.phase,
        participantCount: participants.length,
        question: publicQuestion(session),
        deadline: session.deadline,
        serverNow: now,
    };
}

function correctIdsOf(session: QuizSession): string[] {
    const question = session.quiz.questions[session.questionIndex];
    return question ? question.options.filter((o) => o.correct).map((o) => o.id) : [];
}

export function totalPossible(session: QuizSession): number {
    return session.quiz.questions.reduce((sum, q) => sum + q.weight, 0);
}

export function toProjectionState(data: StateData): ProjectionState {
    const {session, participants, currentAnswers} = data;
    // Le podium a son propre écran (leaderboard) : la correction reste centrée sur la question.
    const ranked = session.phase === "leaderboard" || session.phase === "finished";
    const podium = ranked
        ? topOfPodium(rankParticipants(participants)).map((p) => ({
            rank: p.rank,
            name: formatPublicName(p.firstName, p.lastName),
            score: p.score,
        }))
        : [];
    return {
        ...base(data),
        audience: "projection",
        joinCode: session.joinCode,
        shortCode: session.shortCode,
        // Les absents reçoivent une réponse vide à la clôture (départage) : ce ne sont pas des réponses reçues.
        answeredCount: currentAnswers.filter((a) => a.selectedIds.length > 0).length,
        correctIds: session.phase === "reveal" ? correctIdsOf(session) : null,
        podium,
    };
}

export function toStudentState(data: StateData, userId: string): StudentState {
    const {session, participants, currentAnswers} = data;
    const me = participants.find((p) => p.userId === userId);
    const mine = currentAnswers.find((a) => a.userId === userId);
    const ranked = rankParticipants(participants);
    const myRank = ranked.find((p) => p.userId === userId)?.rank ?? null;
    return {
        ...base(data),
        audience: "student",
        answer: mine && session.phase === "question_open" ? {selectedIds: mine.selectedIds} : null,
        reveal: session.phase === "reveal"
            ? {
                correctIds: correctIdsOf(session),
                selectedIds: mine?.selectedIds ?? [],
                scoreObtained: mine?.scoreObtained ?? 0,
                scoreMax: session.quiz.questions[session.questionIndex]?.weight ?? 0,
            }
            : null,
        score: me?.score ?? 0,
        scoreMax: totalPossible(session),
        rank: session.phase === "reveal" || session.phase === "leaderboard" || session.phase === "finished" ? myRank : null,
    };
}

export function buildState(data: StateData, audience: QuizAudience): QuizPublicState {
    return audience === "projection" ? toProjectionState(data) : toStudentState(data, audience.userId);
}
