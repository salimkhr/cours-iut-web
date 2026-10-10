import {Check, X} from "lucide-react";
import {inlineCodeFit, quizCard} from "@/components/quiz/QuizStage";
import {cn} from "@/lib/utils";
import {renderInline} from "@/lib/inlineMarkdown";

interface Props {
    text: string;
    correct: boolean;
    /** Absent sur la projection : personne n'y est identifié. */
    selected?: boolean;
    large?: boolean;
    /** Repère A, B, C… commun à la projection et aux téléphones (l'ordre est mélangé). */
    letter?: string;
}

/** Correct / incorrect / choisi : toujours icône + libellé + couleur, jamais la couleur seule. */
export default function OptionResult({text, correct, selected, large = false, letter}: Props) {
    return (
        <li className={cn(
            "flex items-center gap-3 !rounded-xl border-2 px-4 py-3", quizCard,
            large ? "text-4xl" : "text-base",
            correct
                ? "border-emerald-700 bg-emerald-600/10 dark:border-emerald-400"
                : "border-bridge-500/40",
            selected && !correct && "border-destructive bg-destructive/10",
        )}>
            {correct
                ? <Check className="size-6 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true"/>
                : <X className={cn("size-6 shrink-0", selected ? "text-destructive" : "text-brand-gray-700 dark:text-brand-gray-300")} aria-hidden="true"/>}
            {letter && <span aria-hidden="true" className="shrink-0 font-extrabold text-(--module-color) dark:text-(--module-color-dark)">{letter}</span>}
            <span className={cn("flex-1 font-medium", inlineCodeFit)}>{renderInline(text)}</span>
            <span className="flex flex-col items-end text-xs font-semibold uppercase tracking-wider">
                <span className={correct ? "text-emerald-800 dark:text-emerald-300" : "text-brand-gray-700 dark:text-brand-gray-300"}>
                    {correct ? "Bonne réponse" : "Mauvaise réponse"}
                </span>
                {selected !== undefined && selected && <span>Votre choix</span>}
            </span>
        </li>
    );
}
