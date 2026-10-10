"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {ChevronRight, Maximize, Minimize, Play, Square} from "lucide-react";
import {BlockRenderer} from "@/components/builder/BlockRenderer";
import {Button} from "@/components/ui/button";
import Countdown from "@/components/quiz/Countdown";
import OptionCard, {optionLetter} from "@/components/quiz/projection/OptionCard";
import ProjectionFrame from "@/components/quiz/projection/ProjectionFrame";
import Podium from "@/components/quiz/projection/Podium";
import {QuizActionBar, QuizHeadband, QuizProgress, quizBarDivider} from "@/components/quiz/QuizChrome";
import QuizStage, {QuizTitle, moduleFill, quizCard, quizEyebrow} from "@/components/quiz/QuizStage";
import QrCode from "@/components/quiz/projection/QrCode";
import {api} from "@/components/quiz/quizClient";
import {useQuizStream} from "@/components/quiz/useQuizStream";
import {useFullscreen} from "@/components/Slides/hooks/useFullscreen";
import type {ProjectionState} from "@/lib/quiz/quizPublicState";
import {cn} from "@/lib/utils";
import type {Block} from "@/types/CourseContent";

const plural = (n: number) => (n > 1 ? "s" : "");

const hasCodeBlock = (blocks: Block[]): boolean =>
    blocks.some((block) => block.type === "code" || (block.children ? hasCodeBlock(block.children) : false));

export default function ProjectionScreen({sessionId}: {sessionId: string}) {
    const {state, connection, error} = useQuizStream<ProjectionState>(sessionId, "projection");
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    // Plein écran du seul conteneur : le menu du site disparaît, comme pour les slides.
    const stageRef = useRef<HTMLElement>(null);
    const {isFullscreen, toggleFullscreen} = useFullscreen(stageRef);

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
            if (event.key === "f" || event.key === "F" || event.key === "F11") {
                event.preventDefault();
                toggleFullscreen();
                return;
            }
            if (event.key !== "ArrowRight" && event.key !== " ") return;
            event.preventDefault();
            if (state.phase === "lobby") void act("start");
            else if (state.phase === "reveal" || state.phase === "leaderboard") void act("next");
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [state, act, toggleFullscreen]);

    if (error) {
        return (
            <QuizStage mode="title" className="items-center justify-center p-8">
                <p role="alert" className={`${quizCard} px-8 py-6 text-2xl font-semibold`}>{error.message}</p>
            </QuizStage>
        );
    }
    if (!state) {
        return <QuizStage mode="title" className="items-center justify-center p-8"><p role="status" className="text-xl">Chargement…</p></QuizStage>;
    }

    const joinUrl = typeof window === "undefined" ? "" : `${window.location.origin}/quiz/${state.joinCode}`;
    const question = state.question;
    const isLast = question !== null && question.index === question.total - 1;
    const onTitle = state.phase === "lobby" || state.phase === "leaderboard" || state.phase === "finished";
    const eyebrow = `${state.moduleTitle} · Quiz`;
    const withCode = question !== null && hasCodeBlock(question.blocks);

    return (
        <QuizStage
            ref={stageRef}
            mode={onTitle ? "title" : "content"}
            moduleSlug={state.moduleSlug}
            // Hors plein écran, le menu du site occupe le haut ; en plein écran le cadre prend tout.
            className="h-[calc(100dvh-var(--navbar-h))] min-h-0 [&:fullscreen]:h-dvh"
        >
            <ProjectionFrame>
                {/* Garde de section : lobby et écran final reprennent la première slide d'un deck. */}
                {onTitle && (
                    <div className="flex h-full items-center pl-44 pr-14">
                        <div className="w-full max-w-[920px]">
                            <div className="mb-5 flex items-center gap-2 text-[0.9rem] font-semibold uppercase tracking-[0.18em] text-brand-dark/70 dark:text-bridge-100/75">
                                <span>{state.moduleTitle}</span>
                                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${moduleFill}`}/>
                                <span>Quiz</span>
                            </div>

                            {state.phase === "lobby" && (
                                <>
                                    <QuizTitle className="text-[6.4rem]">Rejoignez le quiz</QuizTitle>
                                    <p className="mt-6 max-w-3xl text-[1.5rem] leading-relaxed text-bridge-600 dark:text-bridge-300">
                                        Scannez le QR code avec votre téléphone et connectez-vous avec votre compte.
                                    </p>
                                    <div className="mt-10 flex max-w-4xl items-center gap-10 border-t border-bridge-500/35 pt-8 dark:border-bridge-400/30">
                                        <div className="w-[22rem] shrink-0">
                                            {joinUrl && <QrCode value={joinUrl} label="QR code pour rejoindre le quiz"/>}
                                        </div>
                                        <div className="flex flex-col gap-5">
                                            <div>
                                                <p className={quizEyebrow}>Code de secours</p>
                                                <p className="text-6xl font-extrabold tracking-[0.15em] tabular-nums">{state.shortCode}</p>
                                                <p className="mt-1 text-lg text-bridge-600 dark:text-bridge-300">
                                                    {joinUrl && `${new URL(joinUrl).host}/quiz/`}<span className="font-semibold">{state.shortCode}</span>
                                                </p>
                                            </div>
                                            <p className="text-3xl font-bold tabular-nums" role="status">
                                                {state.participantCount} participant{plural(state.participantCount)} connecté{plural(state.participantCount)}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {state.phase === "leaderboard" && question && (
                                <>
                                    <QuizTitle className="text-[6.4rem]">Classement</QuizTitle>
                                    <p className="mt-6 text-[1.5rem] text-bridge-600 dark:text-bridge-300">
                                        Après la question {question.index + 1} sur {question.total}
                                    </p>
                                    <div className="mt-14 max-w-3xl"><Podium entries={state.podium} size="lg"/></div>
                                </>
                            )}

                            {state.phase === "finished" && (
                                <>
                                    <QuizTitle className="text-[6.4rem]">Quiz terminé</QuizTitle>
                                    <div className="mt-14 max-w-3xl"><Podium entries={state.podium} size="lg"/></div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Une seule page pour la question et la correction : les propositions restent en place,
                    seuls leur état et le contenu du pied de page changent. */}
                {!onTitle && question && (
                    <div className="flex h-full flex-col px-16 pb-24 pt-10">
                        <QuizHeadband
                            eyebrow={eyebrow}
                            badge={String(question.index + 1).padStart(2, "0")}
                            title={`Question ${question.index + 1} sur ${question.total}`}
                            aside={(
                                // Anneau à droite du bandeau : il déborde vers le haut, dans la rangée de l'eyebrow,
                                // pour ne pas allonger le bandeau. Même emplacement à la correction (coche).
                                <div className="relative h-12 w-28 shrink-0">
                                    <div className="absolute bottom-0 right-0 size-28">
                                        <Countdown variant="ring" deadline={state.deadline} serverNow={state.serverNow} total={question.durationSeconds}
                                                   ended={state.phase === "reveal"}/>
                                    </div>
                                </div>
                            )}
                        />

                        <div className="slide-body min-h-0 flex-1 overflow-hidden !pt-8">
                            {/* Propositions toujours sous l'énoncé, en grille de deux colonnes. Avec du code,
                                l'énoncé et les cartes passent en taille compacte pour tenir dans l'écran. */}
                            <div className={cn("flex min-h-0 flex-1 flex-col justify-center", withCode ? "gap-6" : "gap-12")}>
                                {/* Le bloc de code impose 14 px : illisible projeté, d'où la surcharge (1,375 rem : 9 lignes tiennent avec
                                    les propositions dessous) ; « Copier » n'a pas de sens ici.
                                    Le code en ligne suit la taille de l'énoncé au lieu de sa taille de base. */}
                                <div className={cn("min-h-0 overflow-hidden font-semibold leading-tight tracking-tight [&_*]:max-w-none [&_button]:hidden [&_pre]:!text-[1.375rem] [&_pre]:!leading-snug [&_pre_*]:!text-[1.375rem] [&_:not(pre)>code]:!text-[1em] [&_:not(pre)>code]:!leading-[inherit]", withCode ? "text-4xl" : "text-6xl")}>
                                    <BlockRenderer blocks={question.blocks}/>
                                </div>

                                <ul className="grid shrink-0 grid-cols-2 gap-4">
                                    {question.options.map((option, index) => (
                                        <OptionCard
                                            key={option.id}
                                            letter={optionLetter(index)}
                                            text={option.text}
                                            compact={withCode}
                                            state={state.phase === "reveal"
                                                ? (state.correctIds?.includes(option.id) ? "correct" : "wrong")
                                                : "idle"}
                                        />
                                    ))}
                                </ul>
                            </div>

                            {/* Mêmes compteurs dans les deux phases : la page ne saute pas à la correction.
                                Le podium a son propre écran : le pied de page n'a plus à lui réserver de hauteur. */}
                            <div className="flex shrink-0 items-start border-t border-bridge-500/35 pt-4 dark:border-bridge-400/30">
                                <div className="flex w-full items-baseline gap-12">
                                    <p className="text-2xl font-semibold">
                                        {question.expectedCount} bonne{plural(question.expectedCount)} réponse{plural(question.expectedCount)} attendue{plural(question.expectedCount)}
                                    </p>
                                    <p className="text-xl tabular-nums text-bridge-600 dark:text-bridge-300" role="status">
                                        {state.answeredCount} / {state.participantCount} réponse{plural(state.answeredCount)} reçue{plural(state.answeredCount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <QuizProgress total={question.total} current={question.index}/>
                    </div>
                )}

                <QuizActionBar>
                    {connection === "reconnecting" && (
                        <span role="status" className="px-2 text-sm font-medium text-bridge-600 dark:text-bridge-300">Reconnexion…</span>
                    )}
                    {actionError && <span role="alert" className="px-2 text-sm font-semibold text-destructive">{actionError}</span>}
                    <Button size="icon" variant="ghost" className="cursor-pointer" onClick={toggleFullscreen}
                            aria-label={isFullscreen ? "Quitter le plein écran" : "Passer en plein écran"}>
                        {isFullscreen ? <Minimize aria-hidden="true"/> : <Maximize aria-hidden="true"/>}
                    </Button>
                    {state.phase !== "finished" && quizBarDivider}
                    {state.phase === "lobby" && (
                        <Button className="cursor-pointer" disabled={busy} onClick={() => void act("start")}>
                            <Play className="size-4" aria-hidden="true"/> Démarrer
                        </Button>
                    )}
                    {state.phase === "question_open" && (
                        <Button variant="outline" className="cursor-pointer" disabled={busy} onClick={() => void act("reveal")}>
                            <Square className="size-4" aria-hidden="true"/> Clore maintenant
                        </Button>
                    )}
                    {(state.phase === "reveal" || state.phase === "leaderboard") && (
                        <Button className="cursor-pointer" disabled={busy} onClick={() => void act("next")}>
                            {state.phase === "leaderboard" ? "Question suivante" : isLast ? "Terminer le quiz" : "Classement"}
                            <ChevronRight className="size-4" aria-hidden="true"/>
                        </Button>
                    )}
                </QuizActionBar>
            </ProjectionFrame>
        </QuizStage>
    );
}
