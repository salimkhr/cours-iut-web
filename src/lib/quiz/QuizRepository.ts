import type {Db} from "mongodb";
import type {Quiz, QuizQuestion} from "@/lib/quiz/quizTypes";

/** Document stocké : `_id` est l'identifiant du quiz, jamais exposé tel quel. */
interface QuizDoc {
    _id: string;
    moduleId: string;
    negativeMarking: boolean;
    questions: QuizQuestion[];
    createdAt: Date;
    updatedAt: Date;
}

const COLLECTION = "module_quizzes";

function toQuiz(doc: QuizDoc): Quiz {
    return {
        id: doc._id,
        moduleId: doc.moduleId,
        negativeMarking: doc.negativeMarking,
        questions: doc.questions,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    };
}

/** Lit et écrit le quiz unique d'un module. Aucune logique métier ici. */
export class QuizRepository {
    constructor(private readonly db: Db) {}

    private get col() {
        return this.db.collection<QuizDoc>(COLLECTION);
    }

    async findByModule(moduleId: string): Promise<Quiz | null> {
        const doc = await this.col.findOne({moduleId});
        return doc ? toQuiz(doc) : null;
    }

    /** Lève une erreur de clé dupliquée (code 11000) si le module a déjà un quiz. */
    async insert(quiz: Omit<Quiz, "createdAt" | "updatedAt">, now: Date): Promise<Quiz> {
        const doc: QuizDoc = {
            _id: quiz.id,
            moduleId: quiz.moduleId,
            negativeMarking: quiz.negativeMarking,
            questions: quiz.questions,
            createdAt: now,
            updatedAt: now,
        };
        await this.col.insertOne(doc);
        return toQuiz(doc);
    }

    async update(
        moduleId: string,
        patch: {negativeMarking?: boolean; questions?: QuizQuestion[]},
        now: Date,
    ): Promise<Quiz | null> {
        const doc = await this.col.findOneAndUpdate(
            {moduleId},
            {$set: {...patch, updatedAt: now}},
            {returnDocument: "after"},
        );
        return doc ? toQuiz(doc) : null;
    }

    async deleteByModule(moduleId: string): Promise<boolean> {
        const result = await this.col.deleteOne({moduleId});
        return result.deletedCount > 0;
    }
}
