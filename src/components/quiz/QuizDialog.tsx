"use client";

import {useState} from "react";
import axios from "axios";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import QuizProgress from "@/components/quiz/QuizProgress";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizFeedback from "@/components/quiz/QuizFeedback";
import {QuizAnswer, QuizCheckResult, QuizQuestionClient} from "@/types/Quiz";

type QuizState = "loading" | "answering" | "checking" | "feedback" | "completing" | "summary" | "error";

interface QuizDialogProps {
    moduleSlug: string;
    sectionSlug: string;
    modulePath: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function QuizDialog({
    moduleSlug,
    sectionSlug,
    modulePath,
    open,
    onOpenChange,
}: QuizDialogProps) {
    const [state, setState] = useState<QuizState>("loading");
    const [questions, setQuestions] = useState<QuizQuestionClient[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState<QuizAnswer | null>(null);
    const [feedback, setFeedback] = useState<QuizCheckResult | null>(null);
    const [collectedAnswers, setCollectedAnswers] = useState<{questionId: string; answer: QuizAnswer}[]>([]);
    const [score, setScore] = useState<{score: number; total: number} | null>(null);
    const [errorMsg, setErrorMsg] = useState("");

    async function loadQuestions() {
        setState("loading");
        try {
            const {data} = await axios.get<QuizQuestionClient[]>(
                `/api/quiz/${moduleSlug}/${sectionSlug}`
            );
            setQuestions(data);
            setCurrentIndex(0);
            setCurrentAnswer(null);
            setFeedback(null);
            setCollectedAnswers([]);
            setScore(null);
            setState("answering");
        } catch {
            setErrorMsg("Impossible de charger le quiz. Réessayez plus tard.");
            setState("error");
        }
    }

    function handleOpenChange(nextOpen: boolean) {
        onOpenChange(nextOpen);
        if (nextOpen && (state === "loading" || state === "summary" || questions.length === 0)) {
            loadQuestions();
        }
    }

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
            await handleComplete();
        }
    }

    async function handleComplete() {
        setState("completing");
        try {
            const {data} = await axios.post<{score: number; total: number}>(
                `/api/quiz/${moduleSlug}/${sectionSlug}/complete`,
                {answers: collectedAnswers}
            );
            setScore(data);
            setState("summary");
        } catch {
            setErrorMsg("Erreur lors de l&apos;enregistrement. Réessayez.");
            setState("error");
        }
    }

    function handleRetry() {
        loadQuestions();
    }

    const isLastQuestion = currentIndex === questions.length - 1;
    const moduleColor = `var(--color-${modulePath})`;
    const currentQuestion = questions[currentIndex];

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent showCloseButton className="flex flex-col gap-4 max-w-lg">
                {/* Loading */}
                {state === "loading" && (
                    <div className="py-8 text-center text-sm text-brand-dark/60 dark:text-bridge-300/60">
                        Chargement du quiz…
                    </div>
                )}

                {/* Error */}
                {state === "error" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Erreur</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
                        <DialogFooter>
                            <Button onClick={handleRetry} style={{backgroundColor: moduleColor}}>
                                Réessayer
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {/* Answering / Checking / Feedback */}
                {(state === "answering" || state === "checking" || state === "feedback") && currentQuestion && (
                    <>
                        <DialogHeader>
                            <div className="flex flex-col gap-2">
                                <QuizProgress
                                    current={currentIndex}
                                    total={questions.length}
                                    modulePath={modulePath}
                                />
                                <p className="text-xs text-brand-dark/50 dark:text-bridge-300/50">
                                    Question {currentIndex + 1} / {questions.length}
                                </p>
                            </div>
                            <DialogTitle className="text-base leading-snug mt-1">
                                {currentQuestion.text}
                            </DialogTitle>
                        </DialogHeader>

                        <QuizQuestion
                            key={currentQuestion.id}
                            question={currentQuestion}
                            onAnswer={(answer) => setCurrentAnswer(answer)}
                            disabled={state === "checking" || state === "feedback"}
                        />

                        {state === "feedback" && feedback && (
                            <QuizFeedback isCorrect={feedback.isCorrect} explanation={feedback.explanation}/>
                        )}

                        <DialogFooter>
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
                        </DialogFooter>
                    </>
                )}

                {/* Completing */}
                {state === "completing" && (
                    <div className="py-8 text-center text-sm text-brand-dark/60 dark:text-bridge-300/60">
                        Enregistrement des résultats…
                    </div>
                )}

                {/* Summary */}
                {state === "summary" && score && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Résultats</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-3 py-4">
                            <QuizProgress current={score.score} total={score.total} modulePath={modulePath}/>
                            <p className="text-2xl font-bold" style={{color: moduleColor}}>
                                {score.score} / {score.total}
                            </p>
                            <p className="text-sm text-brand-dark/60 dark:text-bridge-300/60">
                                {score.score === score.total
                                    ? "Parfait ! Toutes les réponses sont correctes."
                                    : score.score >= score.total / 2
                                        ? "Bon travail, continuez à pratiquer."
                                        : "Revoyez le cours avant de réessayer."}
                            </p>
                        </div>
                        <DialogFooter className="flex gap-2 sm:justify-between">
                            <Button variant="ghost" onClick={() => onOpenChange(false)}>
                                Fermer
                            </Button>
                            <Button
                                onClick={handleRetry}
                                style={{backgroundColor: moduleColor}}
                                className="text-white dark:text-brand-dark"
                            >
                                Réessayer
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
