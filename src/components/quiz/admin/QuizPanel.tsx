"use client";

import {useEffect, useState} from "react";
import {ArrowDown, ArrowUp, Pencil, Play, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import QuestionEditor, {emptyDraft, type QuestionDraft} from "@/components/quiz/admin/QuestionEditor";
import QuizResultsTable from "@/components/quiz/admin/QuizResultsTable";
import {api, quizUrl, type ApiIssue, type QuizEnvelope} from "@/components/quiz/quizClient";
import type {Quiz, QuizQuestion} from "@/lib/quiz/quizTypes";
import {renderInline} from "@/lib/inlineMarkdown";
import {inlineCodeFit} from "@/components/quiz/QuizStage";

function summary(question: QuizQuestion): string {
    for (const block of question.blocks) {
        const content = block.props.content;
        if (typeof content === "string" && content.trim()) return content.trim();
    }
    return "Question sans texte";
}

type Editing = {mode: "new"} | {mode: "edit"; id: string} | null;

export default function QuizPanel({moduleId}: {moduleId: string}) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<Editing>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [launching, setLaunching] = useState(false);

    const base = quizUrl(moduleId);

    useEffect(() => {
        let cancelled = false;
        void api<QuizEnvelope>(base).then((res) => {
            if (cancelled) return;
            if (res.ok) setQuiz(res.data?.quiz ?? null);
            else setError(res.error);
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [base]);

    /** Applique la réponse d'une écriture ; renvoie les erreurs localisées éventuelles. */
    async function write(url: string, method: string, body?: unknown): Promise<ApiIssue[] | null> {
        const res = await api<QuizEnvelope>(url, {method, body});
        if (res.ok) {
            setQuiz(res.data?.quiz ?? null);
            setError(null);
            return null;
        }
        if (res.issues.length === 0) setError(res.error);
        return res.issues.length > 0 ? res.issues : [{path: "", message: res.error ?? "Erreur"}];
    }

    async function launch() {
        setLaunching(true);
        const res = await api<{sessionId: string}>("/api/quiz/sessions", {method: "POST", body: {moduleId}});
        setLaunching(false);
        if (res.ok && res.data) window.open(`/quiz/live/${res.data.sessionId}`, "_blank", "noopener");
        else setError(res.error);
    }

    // Lien « Voir les résultats » (#resultats) : le tableau n'existe qu'une fois le quiz chargé,
    // le navigateur ne peut donc pas y défiler seul.
    useEffect(() => {
        if (!loading && window.location.hash === "#resultats") {
            document.getElementById("resultats")?.scrollIntoView({block: "start"});
        }
    }, [loading]);

    if (loading) return <p className="text-sm text-muted-foreground" role="status">Chargement du quiz…</p>;

    if (!quiz) {
        return (
            <div className="flex flex-col items-start gap-4 rounded-lg border bg-card p-6">
                <div>
                    <h2 className="text-lg font-bold">Pas encore de quiz pour ce module</h2>
                    <p className="text-sm text-muted-foreground">
                        Un quiz par module, joué en direct depuis les téléphones des étudiants.
                    </p>
                </div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <Button onClick={() => void write(base, "POST", {})}>
                    <Plus className="size-4" aria-hidden="true"/>
                    Créer le quiz
                </Button>
            </div>
        );
    }

    const questions = [...quiz.questions].sort((a, b) => a.position - b.position);
    const editingQuestion = editing?.mode === "edit" ? questions.find((q) => q.id === editing.id) : undefined;

    const reorder = (index: number, delta: number) => {
        const ids = questions.map((q) => q.id);
        const target = index + delta;
        if (target < 0 || target >= ids.length) return;
        [ids[index], ids[target]] = [ids[target], ids[index]];
        void write(`${base}/questions/reorder`, "PUT", {orderedIds: ids});
    };

    return (
        <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:p-6" aria-labelledby="quiz-config">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 id="quiz-config" className="text-lg font-bold">Quiz du module</h2>
                        <p className="text-sm text-muted-foreground">
                            {questions.length} question{questions.length > 1 ? "s" : ""}, toutes jouées dans l&apos;ordre.
                            La rapidité ne change jamais la note : elle départage seulement le podium.
                        </p>
                    </div>
                    <Button onClick={() => void launch()} disabled={launching || questions.length === 0}>
                        <Play className="size-4" aria-hidden="true"/>
                        {launching ? "Création de la session…" : "Lancer le quiz"}
                    </Button>
                </div>
                <div className="flex items-center gap-3">
                    <Switch
                        id="quiz-negative"
                        checked={quiz.negativeMarking}
                        onCheckedChange={(checked) => void write(base, "PATCH", {negativeMarking: checked})}
                    />
                    <Label htmlFor="quiz-negative">Points négatifs (une mauvaise réponse annule une bonne)</Label>
                </div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            </section>

            <section className="flex flex-col gap-4" aria-labelledby="quiz-questions">
                <div className="flex items-center justify-between">
                    <h2 id="quiz-questions" className="text-lg font-bold">Questions</h2>
                    {editing === null && (
                        <Button variant="outline" onClick={() => setEditing({mode: "new"})}>
                            <Plus className="size-4" aria-hidden="true"/>
                            Ajouter une question
                        </Button>
                    )}
                </div>

                {editing?.mode === "new" && (
                    <QuestionEditor
                        initial={emptyDraft()}
                        onCancel={() => setEditing(null)}
                        onSave={async (draft: QuestionDraft) => {
                            const issues = await write(`${base}/questions`, "POST", draft);
                            if (!issues) setEditing(null);
                            return issues;
                        }}
                    />
                )}

                {questions.length === 0 && editing === null && (
                    <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                        Aucune question. Ajoutez-en une pour pouvoir lancer le quiz.
                    </p>
                )}

                <ol className="flex flex-col gap-3">
                    {questions.map((question, index) => (
                        <li key={question.id}>
                            {editing?.mode === "edit" && editingQuestion?.id === question.id ? (
                                <QuestionEditor
                                    initial={editingQuestion}
                                    onCancel={() => setEditing(null)}
                                    onSave={async (draft: QuestionDraft) => {
                                        const issues = await write(`${base}/questions/${question.id}`, "PUT", draft);
                                        if (!issues) setEditing(null);
                                        return issues;
                                    }}
                                />
                            ) : (
                                <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className={`truncate font-medium ${inlineCodeFit}`}>{renderInline(summary(question))}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {question.options.length} propositions · {question.options.filter((o) => o.correct).length} correcte(s) · poids {question.weight} · {question.durationSeconds} s
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" aria-label={`Monter la question ${index + 1}`}
                                                disabled={index === 0} onClick={() => reorder(index, -1)}>
                                            <ArrowUp className="size-4" aria-hidden="true"/>
                                        </Button>
                                        <Button variant="ghost" size="icon" aria-label={`Descendre la question ${index + 1}`}
                                                disabled={index === questions.length - 1} onClick={() => reorder(index, 1)}>
                                            <ArrowDown className="size-4" aria-hidden="true"/>
                                        </Button>
                                        <Button variant="outline" size="sm" disabled={editing !== null}
                                                onClick={() => setEditing({mode: "edit", id: question.id})}>
                                            <Pencil className="size-4" aria-hidden="true"/>
                                            Modifier
                                        </Button>
                                        {confirmDelete === question.id ? (
                                            <Button variant="destructive" size="sm" onClick={() => {
                                                setConfirmDelete(null);
                                                void write(`${base}/questions/${question.id}`, "DELETE");
                                            }}>
                                                Confirmer la suppression
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="icon" aria-label={`Supprimer la question ${index + 1}`}
                                                    onClick={() => setConfirmDelete(question.id)}>
                                                <Trash2 className="size-4" aria-hidden="true"/>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ol>
            </section>

            <QuizResultsTable moduleId={moduleId}/>
        </div>
    );
}
