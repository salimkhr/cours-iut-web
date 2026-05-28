"use client";

import {useState} from "react";
import type {CSSProperties} from "react";
import {Check, CheckCircle2, XCircle} from "lucide-react";
import {cn} from "@/lib/utils";
import {QuizAnswer, QuizQuestionClient} from "@/types/Quiz";

interface QuizQuestionProps {
    question: QuizQuestionClient;
    onAnswer: (answer: QuizAnswer) => void;
    disabled?: boolean;
    feedbackIsCorrect?: boolean;
    moduleColor: string;
    explanation?: string;
    correctAnswer?: QuizAnswer;
}

type ChoiceState = "neutral" | "selected" | "correct" | "wrong" | "dimmed";

export default function QuizQuestion({
    question, onAnswer, disabled, feedbackIsCorrect, moduleColor, explanation, correctAnswer
}: QuizQuestionProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [multiSelected, setMultiSelected] = useState<number[]>([]);

    const hasFeedback = feedbackIsCorrect !== undefined;

    const base = [
        "w-full text-left px-4 py-3 rounded-xl border-[1.5px] text-sm",
        "flex items-center gap-3 transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    ].join(" ");

    function stateClass(state: ChoiceState): string {
        switch (state) {
            case "correct": return "border-green-500 bg-green-50 dark:bg-green-950/25 text-green-900 dark:text-green-100";
            case "wrong":   return "border-red-500 bg-red-50 dark:bg-red-950/25 text-red-900 dark:text-red-100";
            case "dimmed":  return "border-border opacity-35 cursor-not-allowed";
            case "selected": return "border-2 bg-bridge-50 dark:bg-bridge-900/60";
            default:        return "border-border bg-white/65 dark:bg-bridge-800/30 hover:bg-bridge-50 dark:hover:bg-bridge-800/50 cursor-pointer";
        }
    }

    function stateStyle(state: ChoiceState): CSSProperties {
        if (state === "selected") return {borderColor: moduleColor};
        return {};
    }

    function stateIcon(state: ChoiceState) {
        if (state === "correct") return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/>;
        if (state === "wrong")   return <XCircle className="w-4 h-4 text-red-500 shrink-0"/>;
        return null;
    }

    // ── truefalse ────────────────────────────────────────────────
    if (question.type === "truefalse") {
        const opts = [{label: "Vrai", value: "true"}, {label: "Faux", value: "false"}];

        function tfState(value: string): ChoiceState {
            if (!hasFeedback) return selected === value ? "selected" : "neutral";
            const boolVal = value === "true";
            if (feedbackIsCorrect && selected === value) return "correct";
            if (!feedbackIsCorrect && correctAnswer === boolVal) return "correct";
            if (!feedbackIsCorrect && selected === value) return "wrong";
            return "dimmed";
        }

        return (
            <div role="radiogroup" aria-label="Choix de réponse" className="flex gap-2">
                {opts.map(({label, value}) => {
                    const s = tfState(value);
                    return (
                        <div key={value} className="flex-1 flex flex-col gap-1">
                            <button
                                type="button"
                                role="radio"
                                aria-checked={selected === value}
                                aria-disabled={s === "dimmed" ? true : undefined}
                                onClick={() => { if (disabled) return; setSelected(value); onAnswer(value === "true"); }}
                                className={cn(base, "justify-center", stateClass(s))}
                                style={stateStyle(s)}
                            >
                                {label}
                                {stateIcon(s)}
                            </button>
                            {s === "correct" && hasFeedback && explanation && (
                                <p className="text-xs px-2 pb-1 leading-relaxed text-green-800/80 dark:text-green-300/70">
                                    {explanation}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // ── mcq ──────────────────────────────────────────────────────
    if (question.type === "mcq") {
        function mcqState(idx: number): ChoiceState {
            if (!hasFeedback) return selected === String(idx) ? "selected" : "neutral";
            if (feedbackIsCorrect && selected === String(idx)) return "correct";
            if (!feedbackIsCorrect && correctAnswer === idx) return "correct";
            if (!feedbackIsCorrect && selected === String(idx)) return "wrong";
            return "dimmed";
        }

        return (
            <div role="radiogroup" aria-label="Choix de réponse" className="flex flex-col gap-1.5">
                {(question.choices ?? []).map((choice, idx) => {
                    const s = mcqState(idx);
                    return (
                        <div key={idx} className="flex flex-col">
                            <button
                                type="button"
                                role="radio"
                                aria-checked={selected === String(idx)}
                                aria-disabled={s === "dimmed" ? true : undefined}
                                onClick={() => { if (disabled) return; setSelected(String(idx)); onAnswer(idx); }}
                                className={cn(base, stateClass(s))}
                                style={stateStyle(s)}
                            >
                                <span className="flex-1">{choice}</span>
                                {stateIcon(s)}
                            </button>
                            {s === "correct" && hasFeedback && explanation && (
                                <p className="text-xs pl-5 py-1 leading-relaxed text-green-800/80 dark:text-green-300/70">
                                    {explanation}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // ── multi ─────────────────────────────────────────────────────
    function multiState(idx: number): ChoiceState {
        if (!hasFeedback) return multiSelected.includes(idx) ? "selected" : "neutral";
        const isInCorrect = Array.isArray(correctAnswer) && (correctAnswer as number[]).includes(idx);
        if (isInCorrect) return "correct";
        if (multiSelected.includes(idx)) return "wrong";
        return "dimmed";
    }

    return (
        <div aria-label="Choix de réponse (plusieurs réponses possibles)" className="flex flex-col gap-1.5">
            {(question.choices ?? []).map((choice, idx) => {
                const s = multiState(idx);
                const isSel = multiSelected.includes(idx);
                return (
                    <button
                        key={idx}
                        type="button"
                        aria-pressed={isSel}
                        aria-disabled={s === "dimmed" ? true : undefined}
                        onClick={() => {
                            if (disabled) return;
                            const next = isSel
                                ? multiSelected.filter(i => i !== idx)
                                : [...multiSelected, idx];
                            setMultiSelected(next);
                            onAnswer(next);
                        }}
                        className={cn(base, stateClass(s))}
                        style={stateStyle(s)}
                    >
                        <span className="flex items-center gap-2.5 flex-1">
                            <span
                                className={cn(
                                    "w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-colors",
                                    s === "correct" ? "border-green-500 bg-green-500"
                                    : s === "wrong" ? "border-red-500 bg-red-500"
                                    : isSel ? "border-current"
                                    : "border-border"
                                )}
                                style={s === "selected" ? {borderColor: moduleColor, backgroundColor: moduleColor} : {}}
                            >
                                {(isSel || s === "correct") && <Check className="w-2 h-2 text-white"/>}
                            </span>
                            {choice}
                        </span>
                        {stateIcon(s)}
                    </button>
                );
            })}
            {hasFeedback && explanation && (
                <p className="text-xs px-3 py-2 leading-relaxed text-green-800/80 dark:text-green-300/70 bg-green-50/50 dark:bg-green-950/20 rounded-lg mt-0.5">
                    {explanation}
                </p>
            )}
        </div>
    );
}
