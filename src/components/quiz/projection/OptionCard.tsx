import {Check, X} from "lucide-react";
import {inlineCodeFit, moduleFill, quizCard} from "@/components/quiz/QuizStage";
import {cn} from "@/lib/utils";
import {renderInline} from "@/lib/inlineMarkdown";

export type OptionState = "idle" | "correct" | "wrong";

/** A, B, C… : repère commun à la projection et aux téléphones, l'ordre étant mélangé. */
export const optionLetter = (index: number) => String.fromCharCode(65 + index);

/**
 * Proposition de réponse sur la projection. Elle ne bouge pas entre la question et la correction :
 * seul son état change, et il se lit par l'icône et le libellé autant que par la couleur.
 */
export default function OptionCard({letter, text, state, compact = false}: {letter: string; text: string; state: OptionState; compact?: boolean}) {
    return (
        <li className={cn(
            "flex items-center gap-5 !rounded-2xl border-2 px-6 font-semibold leading-tight",
            compact ? "py-3 text-3xl" : "py-4 text-4xl",
            state === "idle" && quizCard,
            state === "correct" && "border-emerald-700 bg-emerald-600/10 text-brand-dark dark:border-emerald-400 dark:text-brand-light",
            state === "wrong" && "border-bridge-500/30 bg-bridge-50/85 text-brand-dark/70 dark:bg-bridge-900/85 dark:text-brand-light/70",
        )}>
            <span aria-hidden="true" className={cn(
                "flex shrink-0 items-center justify-center rounded-xl font-extrabold text-white dark:text-brand-dark",
                compact ? "size-12 text-2xl" : "size-14 text-3xl",
                moduleFill, state === "wrong" && "opacity-60",
            )}>
                {letter}
            </span>
            <span className={cn("min-w-0 flex-1", inlineCodeFit)}>{renderInline(text)}</span>
            {/* Place réservée dès la question : le texte se replie de la même façon à la correction,
                la carte ne change donc pas de hauteur. */}
            {state === "idle" && (
                <span aria-hidden="true" className="invisible flex shrink-0 items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                    <X className="size-9"/> Mauvaise réponse
                </span>
            )}
            {state === "correct" && (
                <span className="flex shrink-0 items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    <Check className="size-9" aria-hidden="true"/> Bonne réponse
                </span>
            )}
            {state === "wrong" && (
                <span className="flex shrink-0 items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-gray-700 dark:text-brand-gray-300">
                    <X className="size-9" aria-hidden="true"/> Mauvaise réponse
                </span>
            )}
        </li>
    );
}
