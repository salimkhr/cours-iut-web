import {Check, X} from "lucide-react";
import {cn} from "@/lib/utils";

interface Props {
    text: string;
    correct: boolean;
    /** Absent sur la projection : personne n'y est identifié. */
    selected?: boolean;
    large?: boolean;
}

/** Correct / incorrect / choisi : toujours icône + libellé + couleur, jamais la couleur seule. */
export default function OptionResult({text, correct, selected, large = false}: Props) {
    return (
        <li className={cn(
            "flex items-center gap-3 rounded-lg border-2 px-4 py-3",
            large ? "text-3xl md:text-4xl" : "text-base",
            correct
                ? "border-emerald-700 bg-emerald-600/10 dark:border-emerald-400"
                : "border-border bg-card",
            selected && !correct && "border-destructive bg-destructive/10",
        )}>
            {correct
                ? <Check className="size-6 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true"/>
                : <X className={cn("size-6 shrink-0", selected ? "text-destructive" : "text-muted-foreground")} aria-hidden="true"/>}
            <span className="flex-1 font-medium">{text}</span>
            <span className="flex flex-col items-end text-xs font-semibold uppercase tracking-wider">
                <span className={correct ? "text-emerald-800 dark:text-emerald-300" : "text-muted-foreground"}>
                    {correct ? "Bonne réponse" : "Mauvaise réponse"}
                </span>
                {selected !== undefined && selected && <span>Votre choix</span>}
            </span>
        </li>
    );
}
