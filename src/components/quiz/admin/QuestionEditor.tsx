"use client";

import {useId, useState} from "react";
import {v4 as uuidv4} from "uuid";
import {Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import QuestionBlocksEditor, {newTextBlock} from "@/components/quiz/admin/QuestionBlocksEditor";
import type {ApiIssue} from "@/components/quiz/quizClient";
import type {QuizQuestion} from "@/lib/quiz/quizTypes";
import {quizQuestionSchema} from "@/lib/schemas/quiz.schema";

export type QuestionDraft = Omit<QuizQuestion, "id" | "position"> & {id?: string};

export function emptyDraft(): QuestionDraft {
    return {
        blocks: [newTextBlock()],
        options: [
            {id: uuidv4(), text: "", correct: true},
            {id: uuidv4(), text: "", correct: false},
        ],
        weight: 1,
        durationSeconds: 30,
    };
}

/** Erreurs Zod localisées, ramenées à des messages affichables. */
export function validateDraft(draft: QuestionDraft): ApiIssue[] {
    const parsed = quizQuestionSchema.safeParse({...draft, id: draft.id ?? "nouvelle", position: 0});
    if (parsed.success) return [];
    return parsed.error.issues.map((issue) => ({path: issue.path.join("."), message: issue.message}));
}

interface Props {
    initial: QuestionDraft;
    onSave: (draft: QuestionDraft) => Promise<ApiIssue[] | null>;
    onCancel: () => void;
}

export default function QuestionEditor({initial, onSave, onCancel}: Props) {
    const [draft, setDraft] = useState<QuestionDraft>(initial);
    const [issues, setIssues] = useState<ApiIssue[]>([]);
    const [saving, setSaving] = useState(false);
    const errorId = useId();

    const setOption = (id: string, patch: Partial<QuestionDraft["options"][number]>) =>
        setDraft((d) => ({...d, options: d.options.map((o) => (o.id === id ? {...o, ...patch} : o))}));

    async function submit() {
        const local = validateDraft(draft);
        setIssues(local);
        if (local.length > 0) return;
        setSaving(true);
        const remote = await onSave(draft);
        setSaving(false);
        if (remote) setIssues(remote);
    }

    const correctCount = draft.options.filter((o) => o.correct).length;

    return (
        <form
            className="flex flex-col gap-6 rounded-lg border bg-card p-4 md:p-6"
            onSubmit={(event) => {
                event.preventDefault();
                void submit();
            }}
            noValidate
        >
            <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 text-sm font-semibold">Énoncé</legend>
                <QuestionBlocksEditor blocks={draft.blocks} onChange={(blocks) => setDraft((d) => ({...d, blocks}))}/>
            </fieldset>

            <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 text-sm font-semibold">Propositions</legend>
                <p className="text-sm text-muted-foreground">
                    Cochez toutes les bonnes réponses. {correctCount} bonne{correctCount > 1 ? "s" : ""} réponse{correctCount > 1 ? "s" : ""} sur {draft.options.length}.
                </p>
                {draft.options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-3">
                        <Checkbox
                            id={`${errorId}-c-${option.id}`}
                            checked={option.correct}
                            onCheckedChange={(checked) => setOption(option.id, {correct: checked === true})}
                            aria-label={`Proposition ${index + 1} correcte`}
                        />
                        <Input
                            value={option.text}
                            maxLength={200}
                            placeholder={`Proposition ${index + 1}`}
                            aria-label={`Texte de la proposition ${index + 1}`}
                            onChange={(event) => setOption(option.id, {text: event.target.value})}
                        />
                        <Button
                            type="button" variant="ghost" size="icon"
                            aria-label={`Supprimer la proposition ${index + 1}`}
                            disabled={draft.options.length <= 2}
                            onClick={() => setDraft((d) => ({...d, options: d.options.filter((o) => o.id !== option.id)}))}
                        >
                            <Trash2 className="size-4" aria-hidden="true"/>
                        </Button>
                    </div>
                ))}
                <div>
                    <Button
                        type="button" variant="outline" size="sm"
                        disabled={draft.options.length >= 8}
                        onClick={() => setDraft((d) => ({...d, options: [...d.options, {id: uuidv4(), text: "", correct: false}]}))}
                    >
                        <Plus className="size-4" aria-hidden="true"/>
                        Ajouter une proposition
                    </Button>
                </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <Label htmlFor={`${errorId}-weight`}>Poids</Label>
                    <Input
                        id={`${errorId}-weight`} type="number" min={0.5} step={0.5}
                        value={draft.weight}
                        onChange={(event) => setDraft((d) => ({...d, weight: Number(event.target.value)}))}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor={`${errorId}-duration`}>Durée (secondes, de 5 à 300)</Label>
                    <Input
                        id={`${errorId}-duration`} type="number" min={5} max={300} step={1}
                        value={draft.durationSeconds}
                        onChange={(event) => setDraft((d) => ({...d, durationSeconds: Number(event.target.value)}))}
                    />
                </div>
            </div>

            {issues.length > 0 && (
                <div role="alert" id={errorId} className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
                    <p className="font-semibold">La question n&apos;est pas enregistrable :</p>
                    <ul className="mt-1 list-disc pl-5">
                        {issues.map((issue, i) => (
                            <li key={`${issue.path}-${i}`}>{issue.message}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer la question"}</Button>
                <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
            </div>
        </form>
    );
}
