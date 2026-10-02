import {NextResponse} from "next/server";
import {ObjectId} from "bson";
import {connectToDB} from "@/lib/mongodb";
import {
    QuestionNotFoundError, QuizAlreadyExistsError, QuizNotFoundError, QuizService, QuizValidationError,
} from "@/lib/quiz/QuizService";

export async function getQuizService(): Promise<QuizService> {
    return new QuizService(await connectToDB());
}

/** Vérifie que le module existe ; renvoie une réponse d'erreur sinon. */
export async function assertModuleExists(moduleId: string): Promise<NextResponse | null> {
    if (!ObjectId.isValid(moduleId)) {
        return NextResponse.json({error: "Module introuvable"}, {status: 404});
    }
    const db = await connectToDB();
    const found = await db.collection("modules").findOne({_id: new ObjectId(moduleId)}, {projection: {_id: 1}});
    return found ? null : NextResponse.json({error: "Module introuvable"}, {status: 404});
}

/** Traduit les erreurs métier du quiz en réponses HTTP localisées. */
export function quizErrorResponse(error: unknown): NextResponse {
    if (error instanceof QuizValidationError) {
        return NextResponse.json({error: "Quiz invalide", issues: error.issues}, {status: 422});
    }
    if (error instanceof QuizAlreadyExistsError) {
        return NextResponse.json({error: error.message}, {status: 409});
    }
    if (error instanceof QuizNotFoundError || error instanceof QuestionNotFoundError) {
        return NextResponse.json({error: error.message}, {status: 404});
    }
    console.error(error);
    return NextResponse.json({error: "Erreur serveur"}, {status: 500});
}

/** Lit un corps JSON ; renvoie null s'il est absent ou invalide. */
export async function readJson(req: Request): Promise<unknown | null> {
    try {
        return await req.json();
    } catch {
        return null;
    }
}
