"use client";

import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {ChartColumn, ListChecks, Play} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {api} from "@/components/quiz/quizClient";

interface Props {
    moduleId: string;
    moduleSlug: string;
    accentColor: string;
    accentColorDark: string;
    /** Nombre de questions du quiz ; 0 = quiz absent ou vide. */
    questionCount: number;
}

const BUTTON_CLASS =
    "group h-auto gap-2 rounded-lg border-[3px] border-(--module-color) bg-transparent px-6 py-3 text-sm font-semibold tracking-wide text-brand-dark shadow-none transition-all duration-300 hover:border-(--module-color) hover:bg-(--module-color) hover:text-white dark:text-brand-light dark:hover:text-brand-dark";

/**
 * Menu « Quiz » de la page du module (enseignant uniquement) : lancer une session live, gérer les
 * questions, consulter les résultats. Ces deux dernières entrées ouvrent l'onglet Quiz de l'admin du
 * module, qui n'était sinon accessible que par l'administration.
 */
export default function LaunchQuizButton({moduleId, moduleSlug, accentColor, accentColorDark, questionCount}: Props) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const style = {"--module-color": accentColor, "--module-color-dark": accentColorDark} as React.CSSProperties;
    const adminQuiz = `/admin/modules/${moduleSlug}?onglet=quiz`;
    const empty = questionCount === 0;

    async function launch() {
        setBusy(true);
        setError(null);
        const res = await api<{sessionId: string}>("/api/quiz/sessions", {method: "POST", body: {moduleId}});
        if (res.ok && res.data) {
            router.push(`/quiz/live/${res.data.sessionId}`);
            return;
        }
        setBusy(false);
        setError(res.error);
    }

    return (
        <div className="flex flex-col gap-1">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" style={style} className={BUTTON_CLASS} disabled={busy}>
                        {busy ? "Création de la session…" : "Quiz"}
                        <Play className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-52">
                    <DropdownMenuItem disabled={empty} onSelect={() => void launch()}>
                        <Play aria-hidden="true"/>
                        {empty ? "Lancer le quiz (aucune question)" : "Lancer le quiz"}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={adminQuiz}>
                            <ListChecks aria-hidden="true"/>
                            {empty ? "Préparer les questions" : `Gérer les questions (${questionCount})`}
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/modules/${moduleSlug}/resultats`}>
                            <ChartColumn aria-hidden="true"/>
                            Voir les résultats
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
