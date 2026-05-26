import {CheckCircle2, XCircle} from "lucide-react";
import {cn} from "@/lib/utils";

interface QuizFeedbackProps {
    isCorrect: boolean;
    explanation: string;
}

export default function QuizFeedback({isCorrect, explanation}: QuizFeedbackProps) {
    return (
        <div
            className={cn(
                "flex gap-3 rounded-lg p-4 text-sm",
                isCorrect
                    ? "bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-200"
                    : "bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200"
            )}
        >
            {isCorrect
                ? <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600 dark:text-green-400 mt-0.5"/>
                : <XCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5"/>
            }
            <p>{explanation}</p>
        </div>
    );
}
