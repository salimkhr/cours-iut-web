"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import AnswerForm from "@/components/quiz/play/AnswerForm";
import {optionLetter} from "@/components/quiz/projection/OptionCard";
import {QuizHeadband} from "@/components/quiz/QuizChrome";
import QuizStage, {QuizTitle, moduleFill, quizCard} from "@/components/quiz/QuizStage";
import OptionResult from "@/components/quiz/OptionResult";
import {api} from "@/components/quiz/quizClient";
import {useQuizStream} from "@/components/quiz/useQuizStream";
import type {StudentState} from "@/lib/quiz/quizPublicState";

const fmt = (n: number) => (Math.round(n * 100) / 100).toString().replace(".", ",");

/** Même DA que la projection : garde de titre (attente, fin) ou slide de contenu (question, correction). */
function Shell({mode = "title", moduleSlug, children}: {mode?: "title" | "content"; moduleSlug?: string; children: React.ReactNode}) {
    return (
        <QuizStage mode={mode} moduleSlug={moduleSlug}>
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pb-8 pt-8">{children}</div>
        </QuizStage>
    );
}

/** « PHP • Quiz » : l'eyebrow de la garde de section, avec la pastille du module. */
function TitleEyebrow({moduleTitle}: {moduleTitle: string}) {
    return (
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-dark/70 dark:text-bridge-100/75">
            <span>{moduleTitle}</span>
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${moduleFill}`}/>
            <span>Quiz</span>
        </div>
    );
}

function Failure({message}: {message: string}) {
    return (
        <Shell>
            <QuizTitle className="text-4xl">Impossible de rejoindre le quiz</QuizTitle>
            <p role="alert" className="text-base">{message}</p>
            <Link href="/" className="font-semibold underline underline-offset-4">Retour aux modules</Link>
        </Shell>
    );
}

function StudentView({sessionId}: {sessionId: string}) {
    const {state, connection, error} = useQuizStream<StudentState>(sessionId, "student");

    if (error) return <Failure message={error.message}/>;
    if (!state) return <Shell><p role="status">Connexion à la session…</p></Shell>;

    const question = state.question;
    const status = connection === "reconnecting" && <p role="status" className="text-sm text-bridge-600 dark:text-bridge-300">Reconnexion en cours…</p>;
    const eyebrow = `${state.moduleTitle} · Quiz`;

    if (state.phase === "lobby") {
        return (
            <Shell moduleSlug={state.moduleSlug}>
                <TitleEyebrow moduleTitle={state.moduleTitle}/>
                <QuizTitle className="text-5xl">Vous êtes connecté</QuizTitle>
                <p className="text-lg text-bridge-600 dark:text-bridge-300" role="status">
                    En attente du démarrage par l&apos;enseignant. {state.participantCount} participant{state.participantCount > 1 ? "s" : ""} dans la salle.
                </p>
                {status}
            </Shell>
        );
    }

    if (state.phase === "question_open" && question) {
        return (
            <Shell mode="content" moduleSlug={state.moduleSlug}>
                <QuizHeadband
                    eyebrow={eyebrow}
                    badge={String(question.index + 1).padStart(2, "0")}
                    title={`Question ${question.index + 1} sur ${question.total}`}
                />
                {/* L'énoncé reste sur l'écran projeté : le téléphone ne montre que les propositions. */}
                <AnswerForm
                    key={question.id}
                    sessionId={sessionId}
                    question={question}
                    deadline={state.deadline}
                    serverNow={state.serverNow}
                    lockedWith={state.answer?.selectedIds ?? null}
                />
                {status}
            </Shell>
        );
    }

    if (state.phase === "reveal" && question && state.reveal) {
        const {reveal} = state;
        return (
            <Shell mode="content" moduleSlug={state.moduleSlug}>
                <QuizHeadband
                    eyebrow={eyebrow}
                    badge={String(question.index + 1).padStart(2, "0")}
                    title={`Correction · question ${question.index + 1}`}
                />
                <p className="text-2xl font-bold" role="status">
                    {reveal.scoreObtained > 0 ? "+" : ""}{fmt(reveal.scoreObtained)} point{reveal.scoreObtained > 1 ? "s" : ""} sur {fmt(reveal.scoreMax)}
                </p>
                <ul className="flex flex-col gap-3">
                    {question.options.map((option, index) => (
                        <OptionResult
                            key={option.id}
                            letter={optionLetter(index)}
                            text={option.text}
                            correct={reveal.correctIds.includes(option.id)}
                            selected={reveal.selectedIds.includes(option.id)}
                        />
                    ))}
                </ul>
                <p className={`${quizCard} mt-auto p-4 text-lg font-semibold tabular-nums`}>
                    Score cumulé : {fmt(state.score)} / {fmt(state.scoreMax)}
                    {state.rank !== null && <span className="block text-sm font-medium text-bridge-600 dark:text-bridge-300">Rang actuel : {state.rank}</span>}
                </p>
                {status}
            </Shell>
        );
    }

    if (state.phase === "leaderboard") {
        return (
            <Shell moduleSlug={state.moduleSlug}>
                <TitleEyebrow moduleTitle={state.moduleTitle}/>
                <QuizTitle className="text-5xl">Classement</QuizTitle>
                {question && (
                    <p className="text-lg text-bridge-600 dark:text-bridge-300">Après la question {question.index + 1} sur {question.total}</p>
                )}
                {state.rank !== null && (
                    <p className="text-5xl font-extrabold tabular-nums" role="status">
                        {state.rank}<sup className="text-2xl">{state.rank === 1 ? "er" : "e"}</sup>
                    </p>
                )}
                <p className="text-lg font-semibold tabular-nums">Score cumulé : {fmt(state.score)} / {fmt(state.scoreMax)}</p>
                <p className="mt-auto text-sm text-bridge-600 dark:text-bridge-300">La question suivante arrive.</p>
                {status}
            </Shell>
        );
    }

    return (
        <Shell moduleSlug={state.moduleSlug}>
            <TitleEyebrow moduleTitle={state.moduleTitle}/>
            <QuizTitle className="text-5xl">Quiz terminé</QuizTitle>
            <p className="text-5xl font-extrabold tabular-nums" role="status">
                {fmt(state.score)} <span className="text-2xl font-semibold text-bridge-600 dark:text-bridge-300">/ {fmt(state.scoreMax)}</span>
            </p>
            {state.rank !== null && <p className="text-lg">Classement final : {state.rank}<sup>e</sup></p>}
            <Link href="/" className="mt-auto font-semibold underline underline-offset-4">Retour aux modules</Link>
        </Shell>
    );
}

export default function PlayScreen({code}: {code: string}) {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [failure, setFailure] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        void api<{sessionId: string}>("/api/quiz/join", {method: "POST", body: {code}}).then((res) => {
            if (cancelled) return;
            if (res.ok && res.data) setSessionId(res.data.sessionId);
            else if (res.status === 404) setFailure("Ce code est invalide ou la session a expiré.");
            else setFailure(res.error ?? "Une erreur est survenue.");
        });
        return () => {
            cancelled = true;
        };
    }, [code]);

    if (failure) return <Failure message={failure}/>;
    if (!sessionId) return <Shell><p role="status">Connexion à la session…</p></Shell>;
    return <StudentView sessionId={sessionId}/>;
}
