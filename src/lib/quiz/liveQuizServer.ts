import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongodb";
import {getServerSession} from "@/lib/auth";
import {LiveQuizRegistry} from "@/lib/quiz/LiveQuizRegistry";
import {LiveQuizService, QuizSessionError, type Identity} from "@/lib/quiz/LiveQuizService";
import {InvalidTransitionError} from "@/lib/quiz/quizMachine";
import {canManageQuiz} from "@/lib/quiz/permissions";
import type {QuizAudience, QuizPublicState} from "@/lib/quiz/quizPublicState";

interface QuizGlobals {
    registry: LiveQuizRegistry;
    service: LiveQuizService | null;
}

declare global {
    var _liveQuiz: QuizGlobals | undefined;
}

/** Registre et chronomètres survivent au hot-reload en dev (même principe que mongodb.ts). */
function globals(): QuizGlobals {
    globalThis._liveQuiz ??= {registry: new LiveQuizRegistry(), service: null};
    return globalThis._liveQuiz;
}

export function getRegistry(): LiveQuizRegistry {
    return globals().registry;
}

export async function getLiveQuiz(): Promise<LiveQuizService> {
    const g = globals();
    g.service ??= new LiveQuizService(await connectToDB(), g.registry);
    return g.service;
}

type SessionUser = {id: string; name?: string | null; role?: string | null; group?: string | null};

/** Le compte stocke « Prénom Nom » dans `name` ; on sépare au premier espace. */
export function identityFromUser(user: SessionUser): Identity {
    const name = (user.name ?? "").trim().replace(/\s+/g, " ");
    const space = name.indexOf(" ");
    return {
        userId: user.id,
        firstName: space === -1 ? name : name.slice(0, space),
        lastName: space === -1 ? "" : name.slice(space + 1),
        group: user.group ?? null,
    };
}

export type AuthResult =
    | {ok: true; user: SessionUser; manager: boolean}
    | {ok: false; response: NextResponse};

export async function authenticate(options: {manager?: boolean} = {}): Promise<AuthResult> {
    const session = await getServerSession();
    if (!session) return {ok: false, response: NextResponse.json({error: "Non authentifié"}, {status: 401})};
    const manager = canManageQuiz(session);
    if (options.manager && !manager) {
        return {ok: false, response: NextResponse.json({error: "Non autorisé"}, {status: 403})};
    }
    return {ok: true, user: session.user as SessionUser, manager};
}

const STATUS: Record<QuizSessionError["code"], number> = {
    no_quiz: 404,
    empty_quiz: 422,
    session_not_found: 404,
    session_ended: 409,
    not_participant: 403,
    question_closed: 409,
    invalid_choice: 422,
    empty_choice: 422,
};

export function liveErrorResponse(error: unknown): NextResponse {
    if (error instanceof QuizSessionError) {
        return NextResponse.json({error: error.message, code: error.code}, {status: STATUS[error.code]});
    }
    if (error instanceof InvalidTransitionError) {
        return NextResponse.json({error: error.message, code: "invalid_transition"}, {status: 409});
    }
    console.error(error);
    return NextResponse.json({error: "Erreur serveur"}, {status: 500});
}

/** Flux SSE d'une session : état persistant d'abord, puis diffusions du registre. */
export async function sseResponse(req: Request, sessionId: string, audience: QuizAudience): Promise<Response> {
    const live = await getLiveQuiz();
    const initial = await live.getState(sessionId, audience);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            const send = (state: QuizPublicState) =>
                controller.enqueue(encoder.encode(`event: state\ndata: ${JSON.stringify(state)}\n\n`));
            send(initial);
            const unsubscribe = getRegistry().subscribe(sessionId, audience, send);
            const ping = setInterval(() => controller.enqueue(encoder.encode(": ping\n\n")), 20_000);
            req.signal.addEventListener("abort", () => {
                clearInterval(ping);
                unsubscribe();
                try {
                    controller.close();
                } catch { /* déjà fermé */ }
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    });
}
