"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import axios from "axios";
import {useRouter} from "next/navigation";
import {ArrowLeft, ClipboardCheck} from "lucide-react";
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

    // Barre de progression — toujours visible en haut du contenu
    const progressBar = questions.length > 0 ? (
        <div className="flex h-1.5 shrink-0" aria-hidden="true">
            {questions.map((_, i) => {
                const filledCount = state === "feedback" ? currentIndex + 1 : currentIndex;
                const isSummary = state === "summary";
                return (
                    <div
                        key={i}
                        className={cn(
                            "flex-1 transition-colors duration-300",
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

    // Sidebar pleine hauteur
    const sidebar = (
        <aside
            className="flex min-h-screen relative overflow-hidden shrink-0"
            style={{backgroundColor: moduleColor}}
            aria-label="Progression du quiz"
        >
            <div aria-hidden="true" className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"/>

            <div className="flex flex-col items-center w-full pt-(--navbar-h) pb-6 gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-5 h-5 text-white" aria-hidden="true"/>
                </div>

                <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/60 text-center px-2 leading-snug">
                    {moduleTitle}
                </p>

                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center relative shrink-0"
                    style={{background: `conic-gradient(rgba(255,255,255,0.85) 0deg ${arcDeg}deg, rgba(255,255,255,0.2) ${arcDeg}deg 360deg)`}}
                    aria-label={`Progression : ${arcLabel}`}
                >
                    <div className="absolute w-12 h-12 rounded-full" style={{backgroundColor: moduleColor}}/>
                    <span className="relative z-10 text-xs font-black text-white leading-none select-none">{arcLabel}</span>
                </div>

                {questions.length > 0 && (
                    <div className="flex flex-col gap-1.5" aria-hidden="true">
                        {questions.map((_, i) => {
                            const isDone = i < currentIndex || state === "summary" || state === "completing";
                            const isCurr = i === currentIndex && state !== "summary" && state !== "completing";
                            return (
                                <div
                                    key={i}
                                    style={isDone ? {color: moduleColor} : {}}
                                    className={cn(
                                        "w-14 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold select-none",
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

                <div
                    className="w-12 h-12 rounded-full border-2 border-white/25 bg-black/10 flex flex-col items-center justify-center"
                    aria-label={`${correctCount} bonne${correctCount > 1 ? "s" : ""} réponse${correctCount > 1 ? "s" : ""}`}
                >
                    <span className="text-base font-black text-white leading-none">{correctCount}</span>
                    <span className="text-[8px] text-white/55 uppercase tracking-wider">pts</span>
                </div>
            </div>
        </aside>
    );

    return (
        <div className="grid grid-cols-[112px_1fr] min-h-screen">
            {sidebar}

            <div className="flex flex-col pt-(--navbar-h)">
                {progressBar}

                {/* Lien retour — affiché dans toutes les phases */}
                <div className="px-10 lg:px-16 pt-6 pb-0">
                    <Link
                        href={tpHref}
                        className="inline-flex items-center gap-1.5 text-sm text-brand-gray-700 dark:text-brand-gray-300 hover:text-brand-dark dark:hover:text-brand-light transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4"/>
                        Retour au TP
                    </Link>
                </div>

                {/* LOADING */}
                {state === "loading" && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
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
                )}

                {/* ERROR */}
                {state === "error" && (
                    <div className="px-10 lg:px-16 py-10 flex flex-col gap-4">
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
                    <div className="flex flex-col gap-6 px-10 lg:px-16 pt-8 pb-12">
                        <div className="flex items-center justify-between">
                            <span
                                className="text-sm font-extrabold uppercase tracking-[0.16em]"
                                style={{color: moduleColor}}
                            >
                                Question
                            </span>
                            <span className="text-sm text-bridge-500 dark:text-bridge-400">
                                {currentIndex + 1} / {questions.length}
                            </span>
                        </div>

                        <h2 className="text-xl lg:text-2xl font-bold leading-snug text-brand-dark dark:text-bridge-100">
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
                )}

                {/* COMPLETING */}
                {state === "completing" && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
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
                )}

                {/* SUMMARY */}
                {state === "summary" && score && (
                    <div className="flex flex-col gap-5 px-10 lg:px-16 pt-8 pb-12">
                        <span
                            className="text-sm font-extrabold uppercase tracking-widest"
                            style={{color: moduleColor}}
                        >
                            Récapitulatif
                        </span>

                        <div className="flex flex-col gap-2">
                            {questions.map((q, i) => (
                                <div key={q.id} className="flex items-center gap-3">
                                    <span className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",
                                        questionResults[i]
                                            ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                                            : "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                                    )}>
                                        {questionResults[i] ? "✓" : "✗"}
                                    </span>
                                    <span className="text-sm text-brand-dark dark:text-bridge-200 truncate leading-snug">
                                        {q.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-bridge-700/15 dark:bg-bridge-500/15"/>

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
                )}
            </div>
        </div>
    );
}
