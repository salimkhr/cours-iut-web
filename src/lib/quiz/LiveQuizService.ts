import {randomBytes, randomUUID} from "node:crypto";
import type {Db} from "mongodb";
import {QuizService} from "@/lib/quiz/QuizService";
import {LiveQuizRegistry} from "@/lib/quiz/LiveQuizRegistry";
import {isOpenAt, nextReview, normalizedTime, progressAt, startQuiz, startReview} from "@/lib/quiz/quizMachine";
import {buildState, type QuizAudience, type QuizPublicState, type StateData} from "@/lib/quiz/quizPublicState";
import {participantSeed, questionsFor} from "@/lib/quiz/quizOptionOrder";
import {scoreQuestion} from "@/lib/quiz/quizScoring";
import type {QuizAnswer, QuizParticipant, QuizSession} from "@/lib/quiz/quizTypes";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
// Alphabet sans caractères ambigus (0/O, 1/I/L).
const SHORT_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export class QuizSessionError extends Error {
    constructor(readonly code:
        | "no_quiz" | "empty_quiz" | "session_not_found" | "session_ended" | "not_participant"
        | "question_closed" | "invalid_choice" | "empty_choice" | "too_many_choices", message: string) {
        super(message);
        this.name = "QuizSessionError";
    }
}

export interface Identity {
    userId: string;
    firstName: string;
    lastName: string;
    group: string | null;
    email: string | null;
    /** Identifiant IUT (better-auth `username`). */
    username: string | null;
    /** Tiers-temps déclaré sur le compte. */
    extraTime: boolean;
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
 * Cycle de vie d'une session en deux temps :
 * 1. `running` : chaque participant enchaîne les questions avec son propre chrono (× 4/3 en tiers-temps) ;
 * 2. `review` : l'enseignant reparcourt les questions avec la correction, puis l'écran de fin.
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
                startedAt: null,
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
            session.phase === "review"
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
        let session = await this.requireSession(sessionId);
        if (audience !== "projection" && !(await this.participants.findOne({sessionId, userId: audience.userId}))) {
            // Un compte qui n'a pas rejoint ne doit pas lire les énoncés.
            throw new QuizSessionError("not_participant", "Vous ne participez pas à cette session");
        }
        if (session.phase === "running") {
            // Rattrape les échéances passées (chrono perdu au redémarrage, horloge client en avance).
            await this.sweep(sessionId);
            session = await this.requireSession(sessionId);
        }
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
            email: identity.email,
            username: identity.username,
            joinedAt: this.clock(),
            score: 0,
            timeMs: 0,
            // Figé ici : changer la case du compte en pleine séance ne modifie pas les durées.
            extraTime: identity.extraTime,
            currentIndex: -1,
            questionStartedAt: null,
            deadline: null,
        };
        // Deux `join` simultanés (double appel de l'effet React, deux onglets) ne doivent
        // jamais créer deux lignes. Un upsert sur (sessionId, userId) n'est atomique que
        // grâce à un index unique ; l'`_id` déterministe garantit l'unicité même s'il manque.
        const result = await this.db.collection<QuizParticipant & {_id: string}>("quiz_participants").updateOne(
            {_id: `${sessionId}:${identity.userId}`},
            {$setOnInsert: participant},
            {upsert: true},
        );
        if (result.upsertedCount > 0) await this.publish(sessionId);
        return (await this.participants.findOne({sessionId, userId: identity.userId})) ?? participant;
    }

    // ── Pilotage ────────────────────────────────────────────────────────────

    /** lobby → running : chaque participant ouvre la question 0 avec son propre chrono. */
    async start(sessionId: string): Promise<void> {
        const session = await this.requireSession(sessionId);
        const now = this.clock();
        const next = startQuiz(session, now);
        const result = await this.sessions.updateOne(
            {_id: sessionId, phase: "lobby"},
            {$set: {phase: next.phase, startedAt: next.startedAt, questionIndex: next.questionIndex}},
        );
        if (result.matchedCount === 0) return;
        await this.openFirst(session, now);
        await this.sweep(sessionId, true);
    }

    /**
     * Fin de la phase autonome, déclenchée par l'enseignant ou quand tout le monde a fini. Idempotent.
     * Les questions restantes comptent comme non répondues.
     */
    async endRunning(sessionId: string): Promise<void> {
        const session = await this.getSession(sessionId);
        if (!session || session.phase !== "running") return;
        this.clearTimer(sessionId);
        const next = startReview(session);
        // Garde atomique : un seul appelant (chrono, dernière réponse ou enseignant) fait la transition.
        const result = await this.sessions.updateOne(
            {_id: sessionId, phase: "running"},
            {$set: {phase: next.phase, questionIndex: next.questionIndex}},
        );
        if (result.matchedCount === 0) return;

        const questions = session.quiz.questions;
        for (const p of await this.participants.find({sessionId}).toArray()) {
            // Positions dans l'ordre propre au participant.
            for (let index = Math.max(0, p.currentIndex ?? 0); index < questions.length; index++) {
                await this.recordAbsence(session, p, index);
            }
            await this.participants.updateOne(
                {sessionId, userId: p.userId},
                {$set: progressAt(questions, questions.length, 0, false)},
            );
        }
        await this.publish(sessionId);
    }

    /** « Suivant » pendant la correction ; après la dernière question, l'écran de fin. */
    async next(sessionId: string): Promise<void> {
        const session = await this.requireSession(sessionId);
        const next = nextReview(session, this.clock());
        const result = await this.sessions.updateOne(
            // Garde atomique sur la question lue : un double clic n'avance qu'une fois.
            {_id: sessionId, phase: "review", questionIndex: session.questionIndex},
            {
                $set: {phase: next.phase, questionIndex: next.questionIndex, endedAt: next.endedAt},
                // Une session terminée est conservée (résultats, export ScoDoc) : on retire son expiration TTL.
                ...(next.phase === "finished" ? {$unset: {expiresAt: ""}} : {}),
            },
        );
        if (result.matchedCount === 0) return;
        await this.publish(sessionId);
    }

    // ── Progression des participants ────────────────────────────────────────

    /** Questions dans l'ordre propre au participant (échauffement en tête, le reste mélangé). */
    private orderOf(session: QuizSession, userId: string) {
        return questionsFor(session.quiz.questions, participantSeed(session.id, userId));
    }

    /**
     * Ouvre la première question de chaque participant encore à -1 : au démarrage, ou pour un
     * `join` qui a lu le lobby mais écrit après `start`. Vrai si quelqu'un a été lancé.
     */
    private async openFirst(session: QuizSession, now: number): Promise<boolean> {
        let opened = false;
        for (const p of await this.participants.find({sessionId: session.id, currentIndex: -1}).toArray()) {
            const result = await this.participants.updateOne(
                {sessionId: session.id, userId: p.userId, currentIndex: -1},
                {$set: progressAt(this.orderOf(session, p.userId), 0, now, p.extraTime === true)},
            );
            if (result.modifiedCount > 0) opened = true;
        }
        return opened;
    }

    /**
     * Enregistre une absence (0 point, durée normale complète). L'index unique
     * (session, question, participant) arbitre la course avec une réponse envoyée au même instant.
     */
    private async recordAbsence(session: QuizSession, p: QuizParticipant, index: number): Promise<void> {
        const question = this.orderOf(session, p.userId)[index];
        if (!question) return;
        const absent: QuizAnswer = {
            sessionId: session.id,
            questionId: question.id,
            userId: p.userId,
            selectedIds: [],
            submittedAt: this.clock(),
            timeMs: question.durationSeconds * 1000,
            scoreObtained: 0,
            scoreMax: question.weight,
        };
        try {
            await this.answers.insertOne({...absent});
            await this.participants.updateOne({sessionId: session.id, userId: p.userId}, {$inc: {timeMs: absent.timeMs}});
        } catch (error) {
            if (!isDuplicate(error)) throw error;
        }
    }

    /** Passe le participant de la question `from` à la suivante, ouverte à `at`. Faux si un autre appel l'a déjà fait. */
    private async advance(session: QuizSession, p: QuizParticipant, from: number, at: number): Promise<boolean> {
        const result = await this.participants.updateOne(
            {sessionId: session.id, userId: p.userId, currentIndex: from},
            {$set: progressAt(this.orderOf(session, p.userId), from + 1, at, p.extraTime === true)},
        );
        return result.modifiedCount > 0;
    }

    /**
     * Fait avancer les participants dont l'échéance est passée, ouvre la correction quand tout
     * le monde a fini, sinon reprogramme le chrono sur la prochaine échéance. Une question
     * expirée ouvre la suivante à son échéance, pas à l'heure du balayage : le calendrier de
     * chacun ne dérive pas.
     */
    private async sweep(sessionId: string, force = false): Promise<void> {
        const session = await this.getSession(sessionId);
        if (!session || session.phase !== "running") return;
        const now = this.clock();
        const questions = session.quiz.questions;
        let changed = force;

        // Un `join` qui a lu le lobby mais écrit après `start` laisse un participant sans question :
        // on lui ouvre la première à la volée (sa propre connexion au flux déclenche ce balayage).
        if (await this.openFirst(session, now)) changed = true;

        for (const p of await this.participants.find({sessionId, deadline: {$ne: null, $lte: now}}).toArray()) {
            let index = p.currentIndex ?? 0;
            let deadline = p.deadline ?? null;
            while (index < questions.length && deadline !== null && deadline <= now) {
                await this.recordAbsence(session, p, index);
                if (!(await this.advance(session, p, index, deadline))) break;
                changed = true;
                const next = progressAt(this.orderOf(session, p.userId), index + 1, deadline, p.extraTime === true);
                index = next.currentIndex;
                deadline = next.deadline;
            }
        }

        const participants = await this.participants.find({sessionId}).toArray();
        if (participants.length > 0 && participants.every((p) => (p.currentIndex ?? -1) >= questions.length)) {
            await this.endRunning(sessionId);
            return;
        }
        const pending = participants.map((p) => p.deadline).filter((d): d is number => d != null);
        this.schedule(sessionId, pending.length > 0 ? Math.min(...pending) : null);
        // Une simple reconnexion ne doit pas rediffuser l'état à toute la salle.
        if (changed) await this.publish(sessionId);
    }

    // ── Réponses ────────────────────────────────────────────────────────────

    /**
     * Réponse à la question en cours du participant, qui passe aussitôt à la suivante.
     * `questionId` empêche qu'une réponse destinée à une question expirée tombe sur la suivante.
     * Idempotent : un double envoi renvoie la réponse déjà enregistrée.
     */
    async submitAnswer(sessionId: string, userId: string, questionId: string, selectedIds: string[]): Promise<QuizAnswer> {
        const session = await this.requireSession(sessionId);
        const participant = await this.participants.findOne({sessionId, userId});
        if (!participant) throw new QuizSessionError("not_participant", "Vous ne participez pas à cette session");

        const existing = await this.answers.findOne({sessionId, questionId, userId});
        if (existing) return existing;

        const index = participant.currentIndex ?? -1;
        const question = this.orderOf(session, userId)[index];
        if (session.phase !== "running" || !question || question.id !== questionId) {
            throw new QuizSessionError("question_closed", "Temps écoulé");
        }
        const now = this.clock();
        if (!isOpenAt({deadline: participant.deadline ?? null}, now)) {
            await this.sweep(sessionId);
            throw new QuizSessionError("question_closed", "Temps écoulé");
        }

        const unique = [...new Set(selectedIds)];
        if (unique.length === 0) throw new QuizSessionError("empty_choice", "Sélectionnez au moins une proposition");
        const known = new Set(question.options.map((o) => o.id));
        if (!unique.every((id) => known.has(id))) {
            throw new QuizSessionError("invalid_choice", "Proposition inconnue");
        }
        // Sans ce plafond, tout cocher rapporte le poids entier quand les points négatifs sont coupés.
        const expected = question.options.filter((o) => o.correct).length;
        if (unique.length > expected) {
            throw new QuizSessionError("too_many_choices", `Sélectionnez au plus ${expected} proposition${expected > 1 ? "s" : ""}`);
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
            timeMs: normalizedTime(now - (participant.questionStartedAt ?? now), participant.extraTime === true),
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
        await this.advance(session, participant, index, now);
        await this.sweep(sessionId, true);
        return answer;
    }

    // ── Chronomètre et restauration ─────────────────────────────────────────

    private clearTimer(sessionId: string): void {
        const timer = this.timers.get(sessionId);
        if (timer) clearTimeout(timer);
        this.timers.delete(sessionId);
    }

    /** Un seul chrono par session, calé sur la prochaine échéance parmi les participants. */
    private schedule(sessionId: string, at: number | null): void {
        this.clearTimer(sessionId);
        if (at === null) return;
        const delay = Math.max(0, at - this.clock());
        const timer = setTimeout(() => {
            this.timers.delete(sessionId);
            void this.sweep(sessionId).catch((error) => console.error("[quiz] échéance", error));
        }, delay);
        // Ne retient pas le processus pour le chronomètre seul.
        timer.unref?.();
        this.timers.set(sessionId, timer);
    }

    /** À appeler après un redémarrage serveur : rattrape les échéances et reprogramme le chrono. */
    async restore(sessionId: string): Promise<void> {
        await this.sweep(sessionId);
    }

    /** Annule tous les chronomètres (tests, arrêt propre). */
    dispose(): void {
        for (const timer of this.timers.values()) clearTimeout(timer);
        this.timers.clear();
    }
}
