import {randomBytes, randomUUID} from "node:crypto";
import type {Db} from "mongodb";
import {QuizService} from "@/lib/quiz/QuizService";
import {LiveQuizRegistry} from "@/lib/quiz/LiveQuizRegistry";
import {closeQuestion, isOpenAt, nextQuestion, startQuiz} from "@/lib/quiz/quizMachine";
import {buildState, type QuizAudience, type QuizPublicState, type StateData} from "@/lib/quiz/quizPublicState";
import {scoreQuestion} from "@/lib/quiz/quizScoring";
import type {QuizAnswer, QuizParticipant, QuizSession} from "@/lib/quiz/quizTypes";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
// Alphabet sans caractères ambigus (0/O, 1/I/L).
const SHORT_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export class QuizSessionError extends Error {
    constructor(readonly code:
        | "no_quiz" | "empty_quiz" | "session_not_found" | "session_ended" | "not_participant"
        | "question_closed" | "invalid_choice" | "empty_choice", message: string) {
        super(message);
        this.name = "QuizSessionError";
    }
}

export interface Identity {
    userId: string;
    firstName: string;
    lastName: string;
    group: string | null;
}

interface SessionDoc extends Omit<QuizSession, "id"> {
    _id: string;
}

function toSession(doc: SessionDoc): QuizSession {
    const {_id, ...rest} = doc;
    return {id: _id, ...rest};
}

function shortCode(): string {
    const bytes = randomBytes(6);
    return Array.from(bytes, (b) => SHORT_CODE_ALPHABET[b % SHORT_CODE_ALPHABET.length]).join("");
}

function isDuplicate(error: unknown): boolean {
    return (error as {code?: number}).code === 11000;
}

/**
 * Cycle de vie d'une session : création (instantané du quiz), participation,
 * réponses, fermeture automatique des questions, publication SSE.
 * Toute transition sensible est décidée ici, côté serveur.
 */
export class LiveQuizService {
    private timers = new Map<string, ReturnType<typeof setTimeout>>();
    private readonly quizzes: QuizService;

    constructor(
        private readonly db: Db,
        private readonly registry: LiveQuizRegistry,
        private readonly clock: () => number = () => Date.now(),
    ) {
        this.quizzes = new QuizService(db);
    }

    private get sessions() {
        return this.db.collection<SessionDoc>("quiz_sessions");
    }

    private get participants() {
        return this.db.collection<QuizParticipant>("quiz_participants");
    }

    private get answers() {
        return this.db.collection<QuizAnswer>("quiz_answers");
    }

    // ── Création ────────────────────────────────────────────────────────────

    async createSession(input: {moduleId: string; moduleSlug: string; moduleTitle: string; teacherId: string}): Promise<QuizSession> {
        const quiz = await this.quizzes.get(input.moduleId);
        if (!quiz) throw new QuizSessionError("no_quiz", "Ce module n'a pas de quiz");
        if (quiz.questions.length === 0) throw new QuizSessionError("empty_quiz", "Le quiz ne contient aucune question");

        const now = this.clock();
        for (let attempt = 0; attempt < 5; attempt++) {
            const doc: SessionDoc = {
                _id: randomUUID(),
                ...input,
                joinCode: randomBytes(18).toString("base64url"),
                shortCode: shortCode(),
                // Instantané : une modification ultérieure du quiz n'affecte jamais la session.
                quiz: {negativeMarking: quiz.negativeMarking, questions: structuredClone(quiz.questions)},
                phase: "lobby",
                questionIndex: -1,
                questionStartedAt: null,
                deadline: null,
                createdAt: now,
                endedAt: null,
                expiresAt: new Date(now + SESSION_TTL_MS),
            };
            try {
                await this.sessions.insertOne(doc);
                return toSession(doc);
            } catch (error) {
                if (!isDuplicate(error)) throw error;
            }
        }
        throw new Error("Impossible de générer un code de session unique");
    }

    // ── Lecture ─────────────────────────────────────────────────────────────

    async getSession(sessionId: string): Promise<QuizSession | null> {
        const doc = await this.sessions.findOne({_id: sessionId});
        return doc ? toSession(doc) : null;
    }

    async findByCode(code: string): Promise<QuizSession | null> {
        const doc = await this.sessions.findOne({$or: [{joinCode: code}, {shortCode: code.toUpperCase()}]});
        return doc ? toSession(doc) : null;
    }

    private async requireSession(sessionId: string): Promise<QuizSession> {
        const session = await this.getSession(sessionId);
        if (!session) throw new QuizSessionError("session_not_found", "Session introuvable ou expirée");
        return session;
    }

    private async loadData(session: QuizSession): Promise<StateData> {
        const [participants, currentAnswers] = await Promise.all([
            this.participants.find({sessionId: session.id}).toArray(),
            session.questionIndex >= 0
                ? this.answers.find({
                    sessionId: session.id,
                    questionId: session.quiz.questions[session.questionIndex]?.id ?? "",
                }).toArray()
                : Promise.resolve([] as QuizAnswer[]),
        ]);
        return {session, participants, currentAnswers, now: this.clock()};
    }

    /** État persistant pour une audience (reconnexion, état initial du flux SSE). */
    async getState(sessionId: string, audience: QuizAudience): Promise<QuizPublicState> {
        const session = await this.requireSession(sessionId);
        if (audience !== "projection" && !(await this.participants.findOne({sessionId, userId: audience.userId}))) {
            // Un compte qui n'a pas rejoint ne doit pas lire les énoncés.
            throw new QuizSessionError("not_participant", "Vous ne participez pas à cette session");
        }
        await this.ensureTimer(session);
        return buildState(await this.loadData(session), audience);
    }

    private async publish(sessionId: string): Promise<void> {
        const session = await this.getSession(sessionId);
        if (!session) return;
        const data = await this.loadData(session);
        this.registry.publish(sessionId, (audience) => buildState(data, audience));
    }

    // ── Participation ───────────────────────────────────────────────────────

    /** Idempotent. Les nouveaux participants ne sont acceptés qu'en lobby. */
    async join(sessionId: string, identity: Identity): Promise<QuizParticipant> {
        const session = await this.requireSession(sessionId);
        const existing = await this.participants.findOne({sessionId, userId: identity.userId});
        if (existing) return existing;
        if (session.phase !== "lobby") {
            throw new QuizSessionError("session_ended", "La session a déjà démarré");
        }
        const participant: QuizParticipant = {
            sessionId,
            userId: identity.userId,
            firstName: identity.firstName,
            lastName: identity.lastName,
            group: identity.group,
            joinedAt: this.clock(),
            score: 0,
            timeMs: 0,
        };
        try {
            await this.participants.insertOne({...participant});
        } catch (error) {
            if (!isDuplicate(error)) throw error;
        }
        await this.publish(sessionId);
        return participant;
    }

    // ── Pilotage ────────────────────────────────────────────────────────────

    async start(sessionId: string): Promise<void> {
        const session = await this.requireSession(sessionId);
        const next = startQuiz(session, this.clock());
        const result = await this.sessions.updateOne(
            {_id: sessionId, phase: "lobby"},
            {$set: {
                phase: next.phase,
                questionIndex: next.questionIndex,
                questionStartedAt: next.questionStartedAt,
                deadline: next.deadline,
            }},
        );
        if (result.matchedCount === 0) return;
        this.schedule(sessionId, next.deadline);
        await this.publish(sessionId);
    }

    /** Appelé par le chronomètre à l'échéance et par l'enseignant. Idempotent. */
    async closeCurrentQuestion(sessionId: string): Promise<void> {
        const session = await this.getSession(sessionId);
        if (!session || session.phase !== "question_open") return;
        this.clearTimer(sessionId);
        const next = closeQuestion(session);

        // Garde atomique : un seul appelant (timer ou enseignant) fait la transition.
        const result = await this.sessions.updateOne(
            {_id: sessionId, phase: "question_open", questionIndex: session.questionIndex},
            {$set: {phase: next.phase, questionStartedAt: null, deadline: null}},
        );
        if (result.matchedCount === 0) return;

        await this.recordAbsences(session);
        await this.publish(sessionId);
    }

    async next(sessionId: string): Promise<void> {
        const session = await this.requireSession(sessionId);
        const now = this.clock();
        const next = nextQuestion(session, now);
        const result = await this.sessions.updateOne(
            {_id: sessionId, phase: "reveal", questionIndex: session.questionIndex},
            {$set: {
                phase: next.phase,
                questionIndex: next.questionIndex,
                questionStartedAt: next.questionStartedAt,
                deadline: next.deadline,
                endedAt: next.endedAt,
            }},
        );
        if (result.matchedCount === 0) return;
        if (next.phase === "question_open") this.schedule(sessionId, next.deadline);
        await this.publish(sessionId);
    }

    /** Les absents consomment la durée complète pour le départage, avec 0 point. */
    private async recordAbsences(session: QuizSession): Promise<void> {
        const question = session.quiz.questions[session.questionIndex];
        const participants = await this.participants.find({sessionId: session.id}).toArray();
        const now = this.clock();
        for (const p of participants) {
            const absent: QuizAnswer = {
                sessionId: session.id,
                questionId: question.id,
                userId: p.userId,
                selectedIds: [],
                submittedAt: now,
                timeMs: question.durationSeconds * 1000,
                scoreObtained: 0,
                scoreMax: question.weight,
            };
            try {
                await this.answers.insertOne({...absent});
                await this.participants.updateOne(
                    {sessionId: session.id, userId: p.userId},
                    {$inc: {timeMs: absent.timeMs}},
                );
            } catch (error) {
                if (!isDuplicate(error)) throw error;
            }
        }
    }

    // ── Réponses ────────────────────────────────────────────────────────────

    /** Idempotent : un double envoi renvoie la réponse déjà enregistrée. */
    async submitAnswer(sessionId: string, userId: string, selectedIds: string[]): Promise<QuizAnswer> {
        const session = await this.requireSession(sessionId);
        const participant = await this.participants.findOne({sessionId, userId});
        if (!participant) throw new QuizSessionError("not_participant", "Vous ne participez pas à cette session");

        const question = session.quiz.questions[session.questionIndex];
        if (session.phase !== "question_open" || !question) {
            throw new QuizSessionError("question_closed", "Temps écoulé");
        }

        const existing = await this.answers.findOne({sessionId, questionId: question.id, userId});
        if (existing) return existing;

        const now = this.clock();
        if (!isOpenAt(session, now)) throw new QuizSessionError("question_closed", "Temps écoulé");

        const unique = [...new Set(selectedIds)];
        if (unique.length === 0) throw new QuizSessionError("empty_choice", "Sélectionnez au moins une proposition");
        const known = new Set(question.options.map((o) => o.id));
        if (!unique.every((id) => known.has(id))) {
            throw new QuizSessionError("invalid_choice", "Proposition inconnue");
        }

        const scoreObtained = scoreQuestion({
            weight: question.weight,
            correctIds: question.options.filter((o) => o.correct).map((o) => o.id),
            incorrectIds: question.options.filter((o) => !o.correct).map((o) => o.id),
            selectedIds: unique,
            negativeMarking: session.quiz.negativeMarking,
        });
        const answer: QuizAnswer = {
            sessionId,
            questionId: question.id,
            userId,
            selectedIds: unique,
            submittedAt: now,
            timeMs: Math.max(0, now - (session.questionStartedAt ?? now)),
            scoreObtained,
            scoreMax: question.weight,
        };
        try {
            await this.answers.insertOne({...answer});
        } catch (error) {
            if (isDuplicate(error)) {
                return (await this.answers.findOne({sessionId, questionId: question.id, userId})) ?? answer;
            }
            throw error;
        }
        await this.participants.updateOne({sessionId, userId}, {$inc: {score: scoreObtained, timeMs: answer.timeMs}});
        await this.publish(sessionId);
        return answer;
    }

    // ── Chronomètre et restauration ─────────────────────────────────────────

    private clearTimer(sessionId: string): void {
        const timer = this.timers.get(sessionId);
        if (timer) clearTimeout(timer);
        this.timers.delete(sessionId);
    }

    private schedule(sessionId: string, deadline: number | null): void {
        this.clearTimer(sessionId);
        if (deadline === null) return;
        const delay = Math.max(0, deadline - this.clock());
        const timer = setTimeout(() => {
            this.timers.delete(sessionId);
            void this.closeCurrentQuestion(sessionId).catch((error) => console.error("[quiz] fermeture", error));
        }, delay);
        // Ne retient pas le processus pour le chronomètre seul.
        timer.unref?.();
        this.timers.set(sessionId, timer);
    }

    private async ensureTimer(session: QuizSession): Promise<void> {
        if (session.phase === "question_open" && !this.timers.has(session.id)) {
            this.schedule(session.id, session.deadline);
        }
    }

    /** À appeler après un redémarrage serveur : reprogramme ou ferme immédiatement. */
    async restore(sessionId: string): Promise<void> {
        const session = await this.getSession(sessionId);
        if (session) await this.ensureTimer(session);
    }

    /** Annule tous les chronomètres (tests, arrêt propre). */
    dispose(): void {
        for (const timer of this.timers.values()) clearTimeout(timer);
        this.timers.clear();
    }
}
