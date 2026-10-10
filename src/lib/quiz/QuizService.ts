import {randomUUID} from "node:crypto";
import type {Db} from "mongodb";
import {QuizRepository} from "@/lib/quiz/QuizRepository";
import type {Quiz, QuizQuestion} from "@/lib/quiz/quizTypes";
import {quizQuestionSchema, type QuizQuestionInput} from "@/lib/schemas/quiz.schema";

export class QuizAlreadyExistsError extends Error {
    constructor() {
        super("Ce module possède déjà un quiz");
        this.name = "QuizAlreadyExistsError";
    }
}

export class QuizNotFoundError extends Error {
    constructor() {
        super("Aucun quiz pour ce module");
        this.name = "QuizNotFoundError";
    }
}

export class QuestionNotFoundError extends Error {
    constructor() {
        super("Question introuvable");
        this.name = "QuestionNotFoundError";
    }
}

export interface QuizValidationIssue {
    path: string;
    message: string;
}

export class QuizValidationError extends Error {
    constructor(readonly issues: QuizValidationIssue[]) {
        super(issues.map((i) => `${i.path} : ${i.message}`).join(" ; "));
        this.name = "QuizValidationError";
    }
}

/** Les ids de propositions sont générés si absents afin de rester stables. */
type QuestionDraft = Omit<QuizQuestionInput, "id" | "position" | "options"> & {
    id?: string;
    options: (Omit<QuizQuestionInput["options"][number], "id"> & {id?: string})[];
};

function parseQuestion(draft: QuestionDraft, position: number, index?: number): QuizQuestion {
    const candidate = {
        ...draft,
        id: draft.id ?? randomUUID(),
        position,
        options: draft.options.map((option) => ({...option, id: option.id ?? randomUUID()})),
    };
    const parsed = quizQuestionSchema.safeParse(candidate);
    if (!parsed.success) {
        const prefix = index === undefined ? "question" : `questions.${index}`;
        throw new QuizValidationError(parsed.error.issues.map((issue) => ({
            path: [prefix, ...issue.path].join("."),
            message: issue.message,
        })));
    }
    return parsed.data as QuizQuestion;
}

function renumber(questions: QuizQuestion[]): QuizQuestion[] {
    return questions.map((question, position) => ({...question, position}));
}

/**
 * Seul point d'écriture du quiz : utilisé par l'admin et par le MCP.
 * Applique les schémas Zod, l'unicité par module et la numérotation.
 */
export class QuizService {
    private readonly repo: QuizRepository;

    constructor(db: Db, private readonly clock: () => Date = () => new Date()) {
        this.repo = new QuizRepository(db);
    }

    get(moduleId: string): Promise<Quiz | null> {
        return this.repo.findByModule(moduleId);
    }

    private async require(moduleId: string): Promise<Quiz> {
        const quiz = await this.repo.findByModule(moduleId);
        if (!quiz) throw new QuizNotFoundError();
        return quiz;
    }

    async create(moduleId: string, options: {negativeMarking?: boolean} = {}): Promise<Quiz> {
        try {
            return await this.repo.insert({
                id: randomUUID(),
                moduleId,
                negativeMarking: options.negativeMarking ?? false,
                questions: [],
            }, this.clock());
        } catch (error) {
            if ((error as {code?: number}).code === 11000) throw new QuizAlreadyExistsError();
            throw error;
        }
    }

    async updateConfig(moduleId: string, config: {negativeMarking: boolean}): Promise<Quiz> {
        const quiz = await this.repo.update(moduleId, {negativeMarking: config.negativeMarking}, this.clock());
        if (!quiz) throw new QuizNotFoundError();
        return quiz;
    }

    async addQuestion(moduleId: string, draft: QuestionDraft): Promise<Quiz> {
        const quiz = await this.require(moduleId);
        const question = parseQuestion(draft, quiz.questions.length);
        return this.save(moduleId, [...quiz.questions, question]);
    }

    async updateQuestion(moduleId: string, questionId: string, draft: QuestionDraft): Promise<Quiz> {
        const quiz = await this.require(moduleId);
        const index = quiz.questions.findIndex((q) => q.id === questionId);
        if (index === -1) throw new QuestionNotFoundError();
        const next = [...quiz.questions];
        next[index] = parseQuestion({...draft, id: questionId}, index);
        return this.save(moduleId, next);
    }

    async deleteQuestion(moduleId: string, questionId: string): Promise<Quiz> {
        const quiz = await this.require(moduleId);
        if (!quiz.questions.some((q) => q.id === questionId)) throw new QuestionNotFoundError();
        return this.save(moduleId, quiz.questions.filter((q) => q.id !== questionId));
    }

    /** `orderedIds` doit contenir exactement les ids existants. */
    async reorderQuestions(moduleId: string, orderedIds: string[]): Promise<Quiz> {
        const quiz = await this.require(moduleId);
        const byId = new Map(quiz.questions.map((q) => [q.id, q]));
        const sameSet = orderedIds.length === byId.size
            && new Set(orderedIds).size === orderedIds.length
            && orderedIds.every((id) => byId.has(id));
        if (!sameSet) {
            throw new QuizValidationError([{path: "orderedIds", message: "La liste doit contenir exactement les questions existantes"}]);
        }
        return this.save(moduleId, orderedIds.map((id) => byId.get(id) as QuizQuestion));
    }

    private async save(moduleId: string, questions: QuizQuestion[]): Promise<Quiz> {
        const quiz = await this.repo.update(moduleId, {questions: renumber(questions)}, this.clock());
        if (!quiz) throw new QuizNotFoundError();
        return quiz;
    }
}
