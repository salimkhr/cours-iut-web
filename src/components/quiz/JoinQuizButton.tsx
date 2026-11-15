import Link from "next/link";
import {Play} from "lucide-react";
import {Button} from "@/components/ui/button";
import {QUIZ_BUTTON_CLASS} from "@/components/quiz/quizButtonClass";

interface Props {
    accentColor: string;
    accentColorDark: string;
}

/**
 * Pendant étudiant du menu « Quiz » de l'enseignant : sur ordinateur, ouvre la saisie du code
 * affiché au tableau (sur téléphone, le QR code mène directement à la session).
 */
export default function JoinQuizButton({accentColor, accentColorDark}: Props) {
    const style = {"--module-color": accentColor, "--module-color-dark": accentColorDark} as React.CSSProperties;
    return (
        <Button asChild variant="outline" style={style} className={QUIZ_BUTTON_CLASS}>
            <Link href="/quiz">
                Rejoindre le quiz
                <Play className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true"/>
            </Link>
        </Button>
    );
}
