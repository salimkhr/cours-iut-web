"use client";

import {useCallback, useEffect, useState} from "react";
import {ChevronRight, Play, Square} from "lucide-react";
import {BlockRenderer} from "@/components/builder/BlockRenderer";
import {Button} from "@/components/ui/button";
import Countdown from "@/components/quiz/Countdown";
import OptionResult from "@/components/quiz/OptionResult";
import Podium from "@/components/quiz/projection/Podium";
import QrCode from "@/components/quiz/projection/QrCode";
import {api} from "@/components/quiz/quizClient";
import {useQuizStream} from "@/components/quiz/useQuizStream";
import type {ProjectionState} from "@/lib/quiz/quizPublicState";

export default function ProjectionScreen({sessionId}: {sessionId: string}) {
    const {state, connection, error} = useQuizStream<ProjectionState>(sessionId, "projection");
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const act = useCallback(async (action: "start" | "reveal" | "next") => {
        setBusy(true);
        const res = await api(`/api/quiz/sessions/${sessionId}/${action}`, {method: "POST"});
        setBusy(false);
        setActionError(res.ok ? null : res.error);
    }, [sessionId]);

    // Mêmes principes que les slides : commandes visibles + raccourcis clavier.
    useEffect(() => {
        if (!state) return;
        const onKey = (event: KeyboardEvent) => {
            if ((event.target as HTMLElement)?.closest("input, textarea, select, button")) return;
            if (event.key !== "ArrowRight" && event.key !== " ") return;
            event.preventDefault();
            if (state.phase === "lobby") void act("start");
            else if (state.phase === "reveal") void act("next");
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [state, act]);

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center p-8">
                <p role="alert" className="text-2xl font-semibold">{error.message}</p>
            </main>
        );
    }
    if (!state) {
        return <main className="flex min-h-screen items-center justify-center p-8"><p role="status" className="text-xl">Chargement…</p></main>;
    }

    const joinUrl = typeof window === "undefined" ? "" : `${window.location.origin}/quiz/${state.joinCode}`;
    const question = state.question;
    const isLast = question !== null && question.index === question.total - 1;

    return (
        <main className="flex min-h-screen flex-col bg-background p-6 text-foreground md:p-10">
            <header className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{state.moduleTitle}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {connection === "reconnecting" && <span role="status">Reconnexion…</span>}
                    {question && <span className="tabular-nums">Question {question.index + 1} / {question.total}</span>}
                    <span className="tabular-nums">{state.participantCount} participant{state.participantCount > 1 ? "s" : ""}</span>
                </div>
            </header>

            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-8 py-8">
                {state.phase === "lobby" && (
                    <div className="grid items-center gap-10 md:grid-cols-2">
                        <div className="flex flex-col gap-6">
                            <h1 className="text-5xl font-extrabold leading-tight tracking-tight">Rejoignez le quiz</h1>
                            <p className="text-2xl text-muted-foreground">
                                Scannez le QR code avec votre téléphone et connectez-vous avec votre compte.
                            </p>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Code de secours</p>
                                <p className="text-6xl font-extrabold tracking-[0.15em] tabular-nums">{state.shortCode}</p>
                                <p className="mt-2 text-lg text-muted-foreground">
                                    {joinUrl && `${new URL(joinUrl).host}/quiz/`}<span className="font-semibold">{state.shortCode}</span>
                                </p>
                            </div>
                            <p className="text-3xl font-bold tabular-nums" role="status">
                                {state.participantCount} participant{state.participantCount > 1 ? "s" : ""} connecté{state.participantCount > 1 ? "s" : ""}
                            </p>
                        </div>
                        <div className="flex justify-center">
                            {joinUrl && <QrCode value={joinUrl} label="QR code pour rejoindre le quiz"/>}
                        </div>
                    </div>
                )}

                {state.phase === "question_open" && question && (
                    <div className="flex flex-col gap-12">
                        {/* L'énoncé est le héros de l'écran ; le chrono reste lisible mais discret. */}
                        <div className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl [&_*]:max-w-none">
                            <BlockRenderer blocks={question.blocks}/>
                        </div>
                        <div className="grid items-end gap-6 border-t pt-6 md:grid-cols-[minmax(12rem,20rem)_1fr]">
                            <Countdown deadline={state.deadline} serverNow={state.serverNow} total={question.durationSeconds} size="md"/>
                            <div className="flex flex-col gap-1 md:text-right">
                                <p className="text-xl font-semibold">
                                    {question.expectedCount} bonne{question.expectedCount > 1 ? "s" : ""} réponse{question.expectedCount > 1 ? "s" : ""} attendue{question.expectedCount > 1 ? "s" : ""}
                                </p>
                                <p className="text-lg tabular-nums text-muted-foreground" role="status">
                                    {state.answeredCount} / {state.participantCount} réponse{state.answeredCount > 1 ? "s" : ""} reçue{state.answeredCount > 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {state.phase === "reveal" && question && (
                    <div className="grid gap-10 md:grid-cols-[3fr_2fr]">
                        <div className="flex flex-col gap-6">
                            <h1 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Correction</h1>
                            <ul className="flex flex-col gap-3">
                                {question.options.map((option) => (
                                    <OptionResult key={option.id} text={option.text} large
                                                  correct={state.correctIds?.includes(option.id) ?? false}/>
                                ))}
                            </ul>
                        </div>
                        <Podium entries={state.podium} compact/>
                    </div>
                )}

                {state.phase === "finished" && (
                    <div className="flex flex-col gap-8">
                        <h1 className="text-5xl font-extrabold tracking-tight">Quiz terminé</h1>
                        <Podium entries={state.podium} final/>
                    </div>
                )}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                <p className="text-sm text-muted-foreground" role={actionError ? "alert" : undefined}>
                    {actionError ?? (state.phase === "lobby" || state.phase === "reveal" ? "Raccourci : flèche droite ou espace" : "")}
                </p>
                <div className="flex gap-2">
                    {state.phase === "lobby" && (
                        <Button size="lg" disabled={busy} onClick={() => void act("start")}>
                            <Play className="size-5" aria-hidden="true"/> Démarrer
                        </Button>
                    )}
                    {state.phase === "question_open" && (
                        <Button size="lg" variant="outline" disabled={busy} onClick={() => void act("reveal")}>
                            <Square className="size-5" aria-hidden="true"/> Clore maintenant
                        </Button>
                    )}
                    {state.phase === "reveal" && (
                        <Button size="lg" disabled={busy} onClick={() => void act("next")}>
                            {isLast ? "Terminer le quiz" : "Question suivante"}
                            <ChevronRight className="size-5" aria-hidden="true"/>
                        </Button>
                    )}
                </div>
            </footer>
        </main>
    );
}
