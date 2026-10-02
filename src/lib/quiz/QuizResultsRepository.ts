import type {Db} from "mongodb";
import {totalPossible} from "@/lib/quiz/quizPublicState";
import type {QuizAnswer, QuizParticipant, QuizSession} from "@/lib/quiz/quizTypes";

export interface ResultFilters {
    moduleId?: string;
    sessionId?: string;
    group?: string;
    /** Recherche sur nom ou prénom, insensible à la casse. */
    search?: string;
}

export interface ResultAnswerDetail {
    questionId: string;
    questionNumber: number;
    selectedIds: string[];
    selectedTexts: string[];
    correctTexts: string[];
    scoreObtained: number;
    scoreMax: number;
    timeMs: number;
}

export interface ResultRow {
    sessionId: string;
    sessionDate: number;
    userId: string;
    firstName: string;
    lastName: string;
    group: string | null;
    score: number;
    scoreMax: number;
    percent: number;
    answers: ResultAnswerDetail[];
}

export interface SessionSummary {
    id: string;
    createdAt: number;
    participantCount: number;
}

type SessionDoc = Omit<QuizSession, "id"> & {_id: string};

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Vues agrégées du tableau enseignant : jamais exposées à l'étudiant ni au MCP. */
export class QuizResultsRepository {
    constructor(private readonly db: Db) {}

    async listSessions(moduleId: string): Promise<SessionSummary[]> {
        const sessions = await this.db.collection<SessionDoc>("quiz_sessions")
            .find({moduleId}, {projection: {createdAt: 1}})
            .sort({createdAt: -1})
            .toArray();
        const counts = await this.db.collection<QuizParticipant>("quiz_participants")
            .aggregate<{_id: string; n: number}>([
                {$match: {sessionId: {$in: sessions.map((s) => s._id)}}},
                {$group: {_id: "$sessionId", n: {$sum: 1}}},
            ]).toArray();
        const byId = new Map(counts.map((c) => [c._id, c.n]));
        return sessions.map((s) => ({id: s._id, createdAt: s.createdAt, participantCount: byId.get(s._id) ?? 0}));
    }

    async listGroups(moduleId: string): Promise<string[]> {
        const sessions = await this.db.collection<SessionDoc>("quiz_sessions")
            .find({moduleId}, {projection: {_id: 1}}).toArray();
        const groups = await this.db.collection<QuizParticipant>("quiz_participants")
            .distinct("group", {sessionId: {$in: sessions.map((s) => s._id)}});
        return groups.filter((g): g is string => typeof g === "string" && g.length > 0).sort();
    }

    async list(filters: ResultFilters): Promise<ResultRow[]> {
        const sessionQuery: Record<string, unknown> = {};
        if (filters.moduleId) sessionQuery.moduleId = filters.moduleId;
        if (filters.sessionId) sessionQuery._id = filters.sessionId;
        const sessions = await this.db.collection<SessionDoc>("quiz_sessions").find(sessionQuery).toArray();
        if (sessions.length === 0) return [];
        const sessionById = new Map(sessions.map((s) => [s._id, s]));

        const participantQuery: Record<string, unknown> = {sessionId: {$in: [...sessionById.keys()]}};
        if (filters.group) participantQuery.group = filters.group;
        if (filters.search?.trim()) {
            const pattern = new RegExp(escapeRegex(filters.search.trim()), "i");
            participantQuery.$or = [{firstName: pattern}, {lastName: pattern}];
        }
        const participants = await this.db.collection<QuizParticipant>("quiz_participants")
            .find(participantQuery).toArray();
        if (participants.length === 0) return [];

        const answers = await this.db.collection<QuizAnswer>("quiz_answers")
            .find({sessionId: {$in: [...sessionById.keys()]}, userId: {$in: participants.map((p) => p.userId)}})
            .toArray();
        const answersByKey = new Map<string, QuizAnswer[]>();
        for (const answer of answers) {
            const key = `${answer.sessionId}:${answer.userId}`;
            answersByKey.set(key, [...(answersByKey.get(key) ?? []), answer]);
        }

        return participants
            .map((p): ResultRow => {
                const doc = sessionById.get(p.sessionId) as SessionDoc;
                const session: QuizSession = {id: doc._id, ...doc};
                const mine = answersByKey.get(`${p.sessionId}:${p.userId}`) ?? [];
                const max = totalPossible(session);
                const details = session.quiz.questions.flatMap((question, index): ResultAnswerDetail[] => {
                    const answer = mine.find((a) => a.questionId === question.id);
                    if (!answer) return [];
                    const text = (id: string) => question.options.find((o) => o.id === id)?.text ?? id;
                    return [{
                        questionId: question.id,
                        questionNumber: index + 1,
                        selectedIds: answer.selectedIds,
                        selectedTexts: answer.selectedIds.map(text),
                        correctTexts: question.options.filter((o) => o.correct).map((o) => o.text),
                        scoreObtained: answer.scoreObtained,
                        scoreMax: answer.scoreMax,
                        timeMs: answer.timeMs,
                    }];
                });
                return {
                    sessionId: p.sessionId,
                    sessionDate: session.createdAt,
                    userId: p.userId,
                    firstName: p.firstName,
                    lastName: p.lastName,
                    group: p.group,
                    score: Math.round(p.score * 100) / 100,
                    scoreMax: max,
                    percent: max > 0 ? Math.round((p.score / max) * 1000) / 10 : 0,
                    answers: details,
                };
            })
            .sort((a, b) => b.sessionDate - a.sessionDate
                || a.lastName.localeCompare(b.lastName, "fr")
                || a.firstName.localeCompare(b.firstName, "fr"));
    }
}
