"use client";

import {useEffect, useState} from "react";
import type {CSSProperties} from "react";
import axios from "axios";
import {useRouter} from "next/navigation";
import {ClipboardCheck} from "lucide-react";
import {Button} from "@/components/ui/button";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import {QuizAnswer, QuizCheckResult, QuizQuestionClient} from "@/types/Quiz";
import {cn} from "@/lib/utils";

type QuizState = "loading" | "answering" | "checking" | "feedback" | "completing" | "summary" | "error";

interface QuizGameProps {
    moduleSlug: string;
    sectionSlug: string;
    modulePath: string;
    moduleTitle: string;
}

export default function QuizGame({moduleSlug, sectionSlug, modulePath, moduleTitle}: QuizGameProps) {
    const router = useRouter();
    const [state, setState] = useState<QuizState>("loading");
    const [questions, setQuestions] = useState<QuizQuestionClient[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState<QuizAnswer | null>(null);
    const [feedback, setFeedback] = useState<QuizCheckResult | null>(null);
    const [collectedAnswers, setCollectedAnswers] = useState<{questionId: string; answer: QuizAnswer}[]>([]);
    const [score, setScore] = useState<{score: number; total: number} | null>(null);
    const [questionResults, setQuestionResults] = useState<boolean[]>([]);
    const [errorMsg, setErrorMsg] = useState("");

    const moduleColor = `var(--color-${modulePath})`;
    const tpHref = `/${moduleSlug}/${sectionSlug}/TP`;

    function handleRetry() {
        setState("loading");
        axios.get<QuizQuestionClient[]>(`/api/quiz/${moduleSlug}/${sectionSlug}`)
            .then(({data}) => {
                setQuestions(data);
                setCurrentIndex(0);
                setCurrentAnswer(null);
                setFeedback(null);
                setCollectedAnswers([]);
                setScore(null);
                setQuestionResults([]);
                setState("answering");
            })
            .catch(() => {
                setErrorMsg("Impossible de charger le quiz. Réessayez plus tard.");
                setState("error");
            });
    }

    useEffect(() => {
        axios.get<QuizQuestionClient[]>(`/api/quiz/${moduleSlug}/${sectionSlug}`)
            .then(({data}) => {
                setQuestions(data);
                setCurrentIndex(0);
                setCurrentAnswer(null);
                setFeedback(null);
                setCollectedAnswers([]);
                setScore(null);
                setQuestionResults([]);
                setState("answering");
            })
            .catch(() => {
                setErrorMsg("Impossible de charger le quiz. Réessayez plus tard.");
                setState("error");
            });
    }, [moduleSlug, sectionSlug]);

    async function handleVerify() {
        if (currentAnswer === null) return;
        setState("checking");
        const question = questions[currentIndex];
        try {
            const {data} = await axios.post<QuizCheckResult>(
                `/api/quiz/${moduleSlug}/${sectionSlug}/check`,
                {questionId: question.id, answer: currentAnswer}
            );
            setFeedback(data);
            setCollectedAnswers(prev => [...prev, {questionId: question.id, answer: currentAnswer}]);
            setQuestionResults(prev => [...prev, data.isCorrect]);
            setState("feedback");
        } catch {
            setErrorMsg("Erreur lors de la vérification. Réessayez.");
            setState("error");
        }
    }

    async function handleNext() {
        const nextIndex = currentIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentIndex(nextIndex);
            setCurrentAnswer(null);
            setFeedback(null);
            setState("answering");
        } else {
            setState("completing");
            try {
                const {data} = await axios.post<{score: number; total: number}>(
                    `/api/quiz/${moduleSlug}/${sectionSlug}/complete`,
                    {answers: collectedAnswers}
                );
                setScore(data);
                setState("summary");
            } catch {
                setErrorMsg("Erreur lors de l'enregistrement. Réessayez.");
                setState("error");
            }
        }
    }

    const isLastQuestion = currentIndex === questions.length - 1;
    const currentQuestion = questions[currentIndex];
    const inQuiz = state === "answering" || state === "checking" || state === "feedback";
    const correctCount = questionResults.filter(Boolean).length;

    // Arc de progression — degré de remplissage du conic-gradient
    const arcDeg = (() => {
        if (questions.length === 0) return 0;
        switch (state) {
            case "feedback":   return Math.round(((currentIndex + 1) / questions.length) * 360);
            case "completing":
            case "summary":    return 360;
            default:           return Math.round((currentIndex / questions.length) * 360);
        }
    })();

    const arcLabel = (() => {
        if (questions.length === 0) return "—";
        if (state === "summary" || state === "completing") return `${questions.length}/${questions.length}`;
        if (state === "feedback") return `${currentIndex + 1}/${questions.length}`;
        return `${currentIndex}/${questions.length}`;
    })();

    // ── Sidebar (visible sm+) ─────────────────────────────────────
    const sidebar = (
        <aside
            className="hidden sm:flex flex-col items-center py-4 gap-2.5 relative overflow-hidden"
            style={{backgroundColor: moduleColor}}
            aria-label="Progression du quiz"
        >
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"/>

            {/* Icône */}
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-4 h-4 text-white" aria-hidden="true"/>
            </div>

            {/* Nom du module */}
            <p className="text-[8px] font-extrabold uppercase tracking-widest text-white/55 text-center px-1 leading-tight">
                {moduleTitle}
            </p>

            {/* Arc de progression */}
            <div
                className="w-11 h-11 rounded-full flex items-center justify-center relative shrink-0"
                style={{background: `conic-gradient(rgba(255,255,255,0.85) 0deg ${arcDeg}deg, rgba(255,255,255,0.2) ${arcDeg}deg 360deg)`}}
                aria-label={`Progression : ${arcLabel}`}
            >
                <div className="absolute w-8 h-8 rounded-full" style={{backgroundColor: moduleColor}}/>
                <span className="relative z-10 text-[8px] font-black text-white leading-none select-none">{arcLabel}</span>
            </div>

            {/* Étapes */}
            {questions.length > 0 && (
                <div className="flex flex-col gap-1" aria-hidden="true">
                    {questions.map((_, i) => {
                        const isDone = i < currentIndex || state === "summary" || state === "completing";
                        const isCurr = i === currentIndex && state !== "summary" && state !== "completing";
                        return (
                            <div
                                key={i}
                                style={isDone ? {color: moduleColor} : {}}
                                className={cn(
                                    "w-6 h-5 rounded-md flex items-center justify-center text-[8px] font-bold select-none",
                                    isDone ? "bg-white/85"
                                        : isCurr ? "bg-white/40 text-white"
                                        : "bg-white/20 text-white/50"
                                )}
                            >
                                {isDone ? "✓" : i + 1}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="flex-1"/>

            {/* Score live */}
            <div
                className="w-9 h-9 rounded-full border-2 border-white/25 bg-black/10 flex flex-col items-center justify-center"
                aria-label={`${correctCount} bonne${correctCount > 1 ? "s" : ""} réponse${correctCount > 1 ? "s" : ""}`}
            >
                <span className="text-sm font-black text-white leading-none">{correctCount}</span>
                <span className="text-[6px] text-white/55 uppercase tracking-wider">pts</span>
            </div>
        </aside>
    );

    // ── Barre de progression mobile (cachée sm+) ──────────────────
    const mobileProgress = questions.length > 0 ? (
        <div className="sm:hidden flex gap-1 px-4 pt-2" aria-hidden="true">
            {questions.map((_, i) => {
                const filledCount = state === "feedback" ? currentIndex + 1 : currentIndex;
                const isSummary = state === "summary";
                return (
                    <div
                        key={i}
                        className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors duration-300",
                            !isSummary && i >= filledCount ? "bg-bridge-700/20 dark:bg-bridge-500/20" : ""
                        )}
                        style={
                            isSummary
                                ? {backgroundColor: questionResults[i] ? "#22c55e" : "#ef4444"}
                                : i < filledCount ? {backgroundColor: moduleColor} : {}
                        }
                    />
                );
            })}
        </div>
    ) : null;

    return (
        <div
            style={{"--module-color": moduleColor} as CSSProperties}
            className="grid grid-cols-1 sm:grid-cols-[72px_1fr]"
        >
            {sidebar}

            <div className="flex flex-col">

                {/* LOADING */}
                {state === "loading" && (
                    <>
                        {mobileProgress}
                        <div className="px-4 py-10 flex flex-col items-center gap-3">
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map(i => (
                                    <span
                                        key={i}
                                        className="w-2 h-2 rounded-full animate-pulse"
                                        style={{backgroundColor: moduleColor, animationDelay: `${i * 150}ms`}}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-bridge-600 dark:text-bridge-400">Chargement du quiz…</p>
                        </div>
                    </>
                )}

                {/* ERROR */}
                {state === "error" && (
                    <div className="px-4 py-5 flex flex-col gap-4">
                        <h2 className="text-base font-semibold text-brand-dark dark:text-bridge-100">
                            Quelque chose s&apos;est mal passé
                        </h2>
                        <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
                        <div className="flex justify-end">
                            <Button onClick={handleRetry} style={{backgroundColor: moduleColor}} className="text-white dark:text-brand-dark">
                                Réessayer
                            </Button>
                        </div>
                    </div>
                )}

                {/* QUIZ — answering / checking / feedback */}
                {inQuiz && currentQuestion && (
                    <>
                        {mobileProgress}
                        <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span
                                    className="text-[9px] font-extrabold uppercase tracking-[0.16em]"
                                    style={{color: moduleColor}}
                                >
                                    Question
                                </span>
                                <span className="text-[9px] text-bridge-500 dark:text-bridge-400">
                                    {currentIndex + 1} / {questions.length}
                                </span>
                            </div>

                            <h2 className="text-sm font-bold leading-snug text-brand-dark dark:text-bridge-100">
                                {currentQuestion.text}
                            </h2>

                            <QuizQuestion
                                key={currentQuestion.id}
                                question={currentQuestion}
                                onAnswer={(answer) => setCurrentAnswer(answer)}
                                disabled={state === "checking" || state === "feedback"}
                                feedbackIsCorrect={state === "feedback" && feedback ? feedback.isCorrect : undefined}
                                moduleColor={moduleColor}
                                explanation={state === "feedback" && feedback ? feedback.explanation : undefined}
                                correctAnswer={state === "feedback" && feedback ? feedback.correctAnswer : undefined}
                            />

                            <div className="flex justify-end pt-1">
                                {state === "feedback" ? (
                                    <Button
                                        onClick={handleNext}
                                        style={{backgroundColor: moduleColor}}
                                        className="text-white dark:text-brand-dark"
                                    >
                                        {isLastQuestion ? "Terminer" : "Suivant →"}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleVerify}
                                        disabled={currentAnswer === null || state === "checking"}
                                        style={currentAnswer !== null ? {backgroundColor: moduleColor} : {}}
                                        className="text-white dark:text-brand-dark"
                                    >
                                        {state === "checking" ? "Vérification…" : "Vérifier"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* COMPLETING */}
                {state === "completing" && (
                    <>
                        {mobileProgress}
                        <div className="px-4 py-10 flex flex-col items-center gap-3">
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map(i => (
                                    <span
                                        key={i}
                                        className="w-2 h-2 rounded-full animate-pulse"
                                        style={{backgroundColor: moduleColor, animationDelay: `${i * 150}ms`}}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-bridge-600 dark:text-bridge-400">Enregistrement des résultats…</p>
                        </div>
                    </>
                )}

                {/* SUMMARY */}
                {state === "summary" && score && (
                    <>
                        {mobileProgress}
                        <div className="px-4 py-4 flex flex-col gap-3">
                            <span
                                className="text-[9px] font-extrabold uppercase tracking-widest"
                                style={{color: moduleColor}}
                            >
                                Récapitulatif
                            </span>

                            <div className="flex flex-col gap-1.5">
                                {questions.map((q, i) => (
                                    <div key={q.id} className="flex items-center gap-2">
                                        <span className={cn(
                                            "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0",
                                            questionResults[i]
                                                ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                                                : "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                                        )}>
                                            {questionResults[i] ? "✓" : "✗"}
                                        </span>
                                        <span className="text-[11px] text-brand-dark dark:text-bridge-200 truncate leading-snug">
                                            {q.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-bridge-700/15 dark:bg-bridge-500/15 -mx-4"/>

                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={() => router.push(tpHref)}>
                                    Retour au TP
                                </Button>
                                <Button
                                    onClick={handleRetry}
                                    style={{backgroundColor: moduleColor}}
                                    className="text-white dark:text-brand-dark"
                                >
                                    Réessayer
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
