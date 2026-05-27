"use client";

import {useEffect, useState} from "react";
import type {CSSProperties} from "react";
import axios from "axios";
import {useRouter} from "next/navigation";
import {CheckCircle2, ClipboardCheck, XCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import {QuizAnswer, QuizCheckResult, QuizQuestionClient} from "@/types/Quiz";
import {cn} from "@/lib/utils";

type QuizState = "loading" | "answering" | "checking" | "feedback" | "completing" | "summary" | "error";

interface QuizGameProps {
    moduleSlug: string;
    sectionSlug: string;
    modulePath: string;
}

export default function QuizGame({moduleSlug, sectionSlug, modulePath}: QuizGameProps) {
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


    const headerSubtitle = inQuiz
        ? `Question ${currentIndex + 1} / ${questions.length}`
        : state === "summary" && score
            ? `${score.score} / ${score.total}`
            : state === "error" ? "Erreur" : null;

    const header = (
        <div className={cn("relative flex items-center gap-4 px-6 py-4 overflow-hidden", `bg-${modulePath}`)}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"/>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 shrink-0">
                <ClipboardCheck className="w-5 h-5 text-white" aria-hidden="true"/>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/60">Quiz</p>
                {headerSubtitle && (
                    <p className="text-white font-bold text-xl leading-tight">{headerSubtitle}</p>
                )}
            </div>
        </div>
    );

    const progressBar = (total: number, filledCount: number, results?: boolean[]) => (
        <div className="flex gap-1 px-6" aria-hidden="true">
            {Array.from({length: total}).map((_, i) => {
                let segColor: string | undefined;
                if (results && i < results.length) {
                    segColor = results[i] ? "#22c55e" : "#ef4444";
                } else if (i < filledCount) {
                    segColor = moduleColor;
                }
                return (
                    <div
                        key={i}
                        className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors duration-300",
                            segColor ? "" : "bg-bridge-700/20 dark:bg-bridge-500/20"
                        )}
                        style={segColor ? {backgroundColor: segColor} : {}}
                    />
                );
            })}
        </div>
    );

    return (
        <div style={{"--module-color": moduleColor} as CSSProperties}>
            {/* LOADING */}
            {state === "loading" && (
                <>
                    {header}
                    <div className="px-6 py-10 flex flex-col items-center gap-3">
                        <div className="flex gap-1.5">
                            {[0, 1, 2].map(i => (
                                <span key={i} className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: moduleColor, animationDelay: `${i * 150}ms`}}/>
                            ))}
                        </div>
                        <p className="text-sm text-bridge-600 dark:text-bridge-400">Chargement du quiz…</p>
                    </div>
                </>
            )}

            {/* ERROR */}
            {state === "error" && (
                <>
                    {header}
                    <div className="px-6 py-5 flex flex-col gap-4">
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
                </>
            )}

            {/* QUIZ — answering / checking / feedback */}
            {inQuiz && currentQuestion && (
                <>
                    {header}
                    {progressBar(questions.length, state === "feedback" ? currentIndex + 1 : currentIndex)}
                    <div className="px-6 pb-6 pt-4 flex flex-col gap-4">
                        <h2 className="text-base font-semibold leading-snug text-brand-dark dark:text-bridge-100">
                            {currentQuestion.text}
                        </h2>

                        <QuizQuestion
                            key={currentQuestion.id}
                            question={currentQuestion}
                            onAnswer={(answer) => setCurrentAnswer(answer)}
                            disabled={state === "checking" || state === "feedback"}
                            feedbackIsCorrect={state === "feedback" && feedback ? feedback.isCorrect : undefined}
                            moduleColor={moduleColor}
                        />

                        {state === "feedback" && feedback && (
                            <div className={cn(
                                "flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-sm",
                                feedback.isCorrect
                                    ? "bg-green-50 dark:bg-green-950/25 text-green-900 dark:text-green-100"
                                    : "bg-red-50 dark:bg-red-950/25 text-red-900 dark:text-red-100"
                            )}>
                                {feedback.isCorrect
                                    ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5"/>
                                    : <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5"/>
                                }
                                <p>{feedback.explanation}</p>
                            </div>
                        )}

                        <div className="flex justify-end pt-1">
                            {state === "feedback" ? (
                                <Button onClick={handleNext} style={{backgroundColor: moduleColor}} className="text-white dark:text-brand-dark">
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
                    {header}
                    <div className="px-6 py-10 flex flex-col items-center gap-3">
                        <div className="flex gap-1.5">
                            {[0, 1, 2].map(i => (
                                <span key={i} className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: moduleColor, animationDelay: `${i * 150}ms`}}/>
                            ))}
                        </div>
                        <p className="text-sm text-bridge-600 dark:text-bridge-400">Enregistrement des résultats…</p>
                    </div>
                </>
            )}

            {/* SUMMARY */}
            {state === "summary" && score && (
                <>
                    {header}
                    {progressBar(score.total, score.total, questionResults)}
                    <div className="px-6 py-5 flex flex-col gap-4">
                        <p className="text-sm text-bridge-600 dark:text-bridge-400 text-center py-1">
                            {score.score === score.total
                                ? "Parfait ! Toutes les réponses sont correctes."
                                : score.score >= score.total / 2
                                    ? "Bon travail, continuez à pratiquer."
                                    : "Revoyez le cours avant de réessayer."}
                        </p>
                        <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>
                        <div className="flex justify-between">
                            <Button variant="ghost" onClick={() => router.push(tpHref)}>
                                Retour au TP
                            </Button>
                            <Button onClick={handleRetry} style={{backgroundColor: moduleColor}} className="text-white dark:text-brand-dark">
                                Réessayer
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
