"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import AnswerForm from "@/components/quiz/play/AnswerForm";
import OptionResult from "@/components/quiz/OptionResult";
import {api} from "@/components/quiz/quizClient";
import {useQuizStream} from "@/components/quiz/useQuizStream";
import type {StudentState} from "@/lib/quiz/quizPublicState";

const fmt = (n: number) => (Math.round(n * 100) / 100).toString().replace(".", ",");

function Shell({title, children}: {title?: string; children: React.ReactNode}) {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 bg-background p-4 text-foreground">
            {title && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>}
            {children}
        </main>
    );
}

function Failure({message}: {message: string}) {
    return (
        <Shell>
            <h1 className="text-2xl font-bold">Impossible de rejoindre le quiz</h1>
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
    const status = connection === "reconnecting" && <p role="status" className="text-sm text-muted-foreground">Reconnexion en cours…</p>;

    if (state.phase === "lobby") {
        return (
            <Shell title={state.moduleTitle}>
                <h1 className="text-3xl font-extrabold">Vous êtes connecté</h1>
                <p className="text-lg text-muted-foreground" role="status">
                    En attente du démarrage par l&apos;enseignant. {state.participantCount} participant{state.participantCount > 1 ? "s" : ""} dans la salle.
                </p>
                {status}
            </Shell>
        );
    }

    if (state.phase === "question_open" && question) {
        return (
            <Shell title={`${state.moduleTitle} · Question ${question.index + 1} / ${question.total}`}>
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
            <Shell title={`Correction · Question ${question.index + 1} / ${question.total}`}>
                <h1 className="text-2xl font-bold" role="status">
                    {reveal.scoreObtained > 0 ? "+" : ""}{fmt(reveal.scoreObtained)} point{reveal.scoreObtained > 1 ? "s" : ""} sur {fmt(reveal.scoreMax)}
                </h1>
                <ul className="flex flex-col gap-3">
                    {question.options.map((option) => (
                        <OptionResult
                            key={option.id}
                            text={option.text}
                            correct={reveal.correctIds.includes(option.id)}
                            selected={reveal.selectedIds.includes(option.id)}
                        />
                    ))}
                </ul>
                <p className="mt-auto rounded-lg bg-muted p-4 text-lg font-semibold tabular-nums">
                    Score cumulé : {fmt(state.score)} / {fmt(state.scoreMax)}
                    {state.rank !== null && <span className="block text-sm font-medium text-muted-foreground">Rang actuel : {state.rank}</span>}
                </p>
                {status}
            </Shell>
        );
    }

    return (
        <Shell title={state.moduleTitle}>
            <h1 className="text-3xl font-extrabold">Quiz terminé</h1>
            <p className="text-5xl font-extrabold tabular-nums" role="status">
                {fmt(state.score)} <span className="text-2xl font-semibold text-muted-foreground">/ {fmt(state.scoreMax)}</span>
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
