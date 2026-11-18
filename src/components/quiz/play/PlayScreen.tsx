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
import {BlockRenderer} from "@/components/builder/BlockRenderer";
import type {Block} from "@/types/CourseContent";

const fmt = (n: number) => (Math.round(n * 100) / 100).toString().replace(".", ",");

/** Même DA que la projection : garde de titre (attente, fin) ou slide de contenu (question, correction). */
function Shell({mode = "title", moduleSlug, children}: {mode?: "title" | "content"; moduleSlug?: string; children: React.ReactNode}) {
    return (
        // Le menu du site occupe le haut de l'écran : sans cette hauteur, la page dépasse d'autant et oblige à
        // faire défiler pour voir la question et le bouton « Valider » (même règle que la projection).
        <QuizStage mode={mode} moduleSlug={moduleSlug} className="min-h-[calc(100dvh-var(--navbar-h))]">
            {/* Chaque étudiant suit le quiz sur ordinateur : une colonne de lecture confortable. */}
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-8 pt-10 pb-10">{children}</div>
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

/**
 * Énoncé complet (texte et code) : chacun avance à son rythme, la projection ne l'affiche plus.
 * « Copier » est masqué : coller le code dans un éditeur pour l'exécuter donnerait la réponse.
 */
export function Statement({blocks}: {blocks: Block[]}) {
    return (
        <div className="flex flex-col gap-3 text-lg font-semibold leading-snug [&_*]:max-w-none [&_button]:hidden [&_:not(pre)>code]:!text-[1em]">
            <BlockRenderer blocks={blocks}/>
        </div>
    );
}

function Failure({message}: {message: string}) {
    return (
        <Shell>
            <QuizTitle className="text-4xl">Impossible de rejoindre le quiz</QuizTitle>
            <p role="alert" className="text-base">{message}</p>
            <Link href="/quiz" className="font-semibold underline underline-offset-4">Saisir un autre code</Link>
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

    if (state.phase === "running" && state.done) {
        return (
            <Shell moduleSlug={state.moduleSlug}>
                <TitleEyebrow moduleTitle={state.moduleTitle}/>
                <QuizTitle className="text-5xl">Vous avez terminé</QuizTitle>
                <p className="text-lg text-bridge-600 dark:text-bridge-300" role="status">
                    La correction commencera quand tout le monde aura fini, ou quand l&apos;enseignant la lancera.
                </p>
                {status}
            </Shell>
        );
    }

    if (state.phase === "running" && question) {
        return (
            <Shell mode="content" moduleSlug={state.moduleSlug}>
                <QuizHeadband
                    eyebrow={eyebrow}
                    badge={String(question.index + 1).padStart(2, "0")}
                    title={`Question ${question.index + 1} sur ${question.total}`}
                />
                <Statement blocks={question.blocks}/>
                <AnswerForm
                    key={question.id}
                    sessionId={sessionId}
                    question={question}
                    deadline={state.deadline}
                    serverNow={state.serverNow}
                />
                {status}
            </Shell>
        );
    }

    if (state.phase === "review" && question && state.reveal) {
        const {reveal} = state;
        return (
            <Shell mode="content" moduleSlug={state.moduleSlug}>
                <QuizHeadband
                    eyebrow={eyebrow}
                    badge={String(question.index + 1).padStart(2, "0")}
                    title={`Correction · question ${question.index + 1}`}
                />
                <Statement blocks={question.blocks}/>
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
                </p>
                {status}
            </Shell>
        );
    }

    if (state.phase !== "finished") {
        // Phase autonome, entre deux questions : la suivante arrive par le flux.
        return <Shell moduleSlug={state.moduleSlug}><p role="status">Question suivante…</p>{status}</Shell>;
    }

    return (
        <Shell moduleSlug={state.moduleSlug}>
            <TitleEyebrow moduleTitle={state.moduleTitle}/>
            <QuizTitle className="text-5xl">Quiz terminé</QuizTitle>
            <p className="text-5xl font-extrabold tabular-nums" role="status">
                {fmt(state.score)} <span className="text-2xl font-semibold text-bridge-600 dark:text-bridge-300">/ {fmt(state.scoreMax)}</span>
            </p>
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
