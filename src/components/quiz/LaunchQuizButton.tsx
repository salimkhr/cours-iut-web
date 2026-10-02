"use client";

import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Play, Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
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

/** Lance une session de quiz live depuis la page du module (enseignant uniquement). */
export default function LaunchQuizButton({moduleId, moduleSlug, accentColor, accentColorDark, questionCount}: Props) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const style = {"--module-color": accentColor, "--module-color-dark": accentColorDark} as React.CSSProperties;

    if (questionCount === 0) {
        return (
            <Button asChild variant="outline" style={style} className={BUTTON_CLASS}>
                <Link href={`/admin/modules/${moduleSlug}`}>
                    Préparer le quiz
                    <Plus className="size-4" aria-hidden="true"/>
                </Link>
            </Button>
        );
    }

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
            <Button type="button" variant="outline" style={style} className={BUTTON_CLASS} disabled={busy}
                    onClick={() => void launch()}>
                {busy ? "Création de la session…" : "Lancer le quiz"}
                <Play className="size-4" aria-hidden="true"/>
            </Button>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
