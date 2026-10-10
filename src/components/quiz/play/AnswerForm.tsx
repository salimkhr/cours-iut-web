"use client";

import {useState} from "react";
import {Lock} from "lucide-react";
import {Button} from "@/components/ui/button";
import Countdown from "@/components/quiz/Countdown";
import {api} from "@/components/quiz/quizClient";
import {inlineCodeFit, quizCard} from "@/components/quiz/QuizStage";
import {optionLetter} from "@/components/quiz/projection/OptionCard";
import {cn} from "@/lib/utils";
import type {PublicQuestion} from "@/lib/quiz/quizPublicState";
import {renderInline} from "@/lib/inlineMarkdown";

interface Props {
    sessionId: string;
    question: PublicQuestion;
    deadline: number | null;
    serverNow: number;
    /** Réponse déjà enregistrée côté serveur (reconnexion) : le formulaire démarre verrouillé. */
    lockedWith: string[] | null;
}

/** La sélection reste modifiable jusqu'à l'envoi, puis se verrouille. */
export default function AnswerForm({sessionId, question, deadline, serverNow, lockedWith}: Props) {
    const [selected, setSelected] = useState<string[]>(lockedWith ?? []);
    const [locked, setLocked] = useState(lockedWith !== null);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState<{text: string; tone: "error" | "info"} | null>(null);

    const isLocked = locked || lockedWith !== null;
    const shown = lockedWith ?? selected;

    const toggle = (id: string) =>
        setSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

    async function submit() {
        setSending(true);
        setMessage({text: "Envoi de votre réponse…", tone: "info"});
        const res = await api(`/api/quiz/sessions/${sessionId}/answer`, {method: "POST", body: {selectedIds: selected}});
        setSending(false);
        if (res.ok) {
            setLocked(true);
            setMessage({text: "Réponse envoyée. Elle ne peut plus être modifiée.", tone: "info"});
        } else if (res.status === 409) {
            setLocked(true);
            setMessage({text: "Temps écoulé : votre réponse n'a pas été prise en compte.", tone: "error"});
        } else {
            setMessage({text: `${res.error ?? "Envoi impossible"}. Vous pouvez réessayer tant que le temps n'est pas écoulé.`, tone: "error"});
        }
    }

    return (
        <form
            className="flex flex-1 flex-col gap-5"
            onSubmit={(event) => {
                event.preventDefault();
                if (!isLocked && selected.length > 0) void submit();
            }}
        >
            <Countdown deadline={deadline} serverNow={serverNow} total={question.durationSeconds} size="md"/>

            <fieldset disabled={isLocked || sending} className="flex flex-col gap-3">
                <legend className="mb-3 text-lg font-bold">
                    Choisissez {question.expectedCount} réponse{question.expectedCount > 1 ? "s" : ""}
                </legend>
                {question.options.map((option, index) => {
                    const checked = shown.includes(option.id);
                    return (
                        <label
                            key={option.id}
                            className={cn(
                                "flex min-h-14 cursor-pointer items-center gap-4 !rounded-xl border-2 px-4 py-3 text-lg font-medium", quizCard,
                                "has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/60",
                                checked ? "border-brand-primary dark:border-brand-accent" : "border-bridge-500/40",
                                isLocked && "cursor-default opacity-90",
                            )}
                        >
                            <input
                                type="checkbox"
                                className="size-6 shrink-0 accent-[var(--color-brand-primary)]"
                                checked={checked}
                                onChange={() => toggle(option.id)}
                            />
                            <span aria-hidden="true" className="shrink-0 font-extrabold text-(--module-color) dark:text-(--module-color-dark)">{optionLetter(index)}</span>
                            <span className={cn("flex-1", inlineCodeFit)}>{renderInline(option.text)}</span>
                        </label>
                    );
                })}
            </fieldset>

            <div className="mt-auto flex flex-col gap-3">
                <p
                    role="status"
                    className={cn("min-h-6 text-sm", message?.tone === "error" ? "font-semibold text-destructive" : "text-brand-gray-700 dark:text-brand-gray-300")}
                >
                    {message?.text ?? (isLocked ? "" : `${selected.length} proposition${selected.length > 1 ? "s" : ""} sélectionnée${selected.length > 1 ? "s" : ""}`)}
                </p>
                {isLocked ? (
                    <div className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-bridge-500/40 bg-bridge-100/80 px-4 text-base font-semibold dark:bg-bridge-700/60">
                        <Lock className="size-5" aria-hidden="true"/> Réponse verrouillée — en attente de la correction
                    </div>
                ) : (
                    <Button type="submit" size="lg" className="min-h-12 text-base" disabled={selected.length === 0 || sending}>
                        {sending ? "Envoi…" : "Valider ma réponse"}
                    </Button>
                )}
            </div>
        </form>
    );
}
