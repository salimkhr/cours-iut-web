"use client";

import {useEffect, useState} from "react";
import AdminDataTable, {type AdminColumn} from "@/components/admin/ui/AdminDataTable";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {api} from "@/components/quiz/quizClient";
import type {ResultRow, SessionSummary} from "@/lib/quiz/QuizResultsRepository";

const ALL = "__all__";

interface Payload {
    rows: ResultRow[];
    sessions: SessionSummary[];
    groups: string[];
}

const formatDate = (epoch: number) =>
    new Intl.DateTimeFormat("fr-FR", {dateStyle: "short", timeStyle: "short"}).format(new Date(epoch));

const formatPoints = (n: number) => (Math.round(n * 100) / 100).toString().replace(".", ",");

export default function QuizResultsTable({moduleId}: {moduleId: string}) {
    const [search, setSearch] = useState("");
    const [group, setGroup] = useState(ALL);
    const [sessionId, setSessionId] = useState(ALL);
    const [data, setData] = useState<Payload | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Anti-rebond : la recherche ne part qu'après une courte pause de frappe.
        const timer = setTimeout(async () => {
            const query = new URLSearchParams({moduleId});
            if (search.trim()) query.set("search", search.trim());
            if (group !== ALL) query.set("group", group);
            if (sessionId !== ALL) query.set("sessionId", sessionId);
            const res = await api<Payload>(`/api/quiz/results?${query}`);
            if (res.ok && res.data) {
                setData(res.data);
                setError(null);
            } else {
                setError(res.error);
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [moduleId, search, group, sessionId]);

    const columns: AdminColumn<ResultRow>[] = [
        {id: "student", header: "Étudiant", cell: (r) => `${r.lastName.toUpperCase()} ${r.firstName}`},
        {id: "group", header: "Groupe", cell: (r) => r.group ?? "—"},
        {id: "session", header: "Session", cell: (r) => formatDate(r.sessionDate)},
        {id: "score", header: "Note", cell: (r) => `${formatPoints(r.score)} / ${formatPoints(r.scoreMax)}`},
        {id: "percent", header: "%", cell: (r) => `${r.percent.toString().replace(".", ",")} %`},
    ];

    return (
        <section className="flex flex-col gap-4" aria-labelledby="quiz-results">
            <h2 id="quiz-results" className="text-lg font-bold">Résultats</h2>
            <div className="flex flex-wrap items-end gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="quiz-search">Nom ou prénom</Label>
                    <Input id="quiz-search" type="search" value={search} className="w-56"
                           onChange={(event) => setSearch(event.target.value)}/>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="quiz-group">Groupe</Label>
                    <Select value={group} onValueChange={setGroup}>
                        <SelectTrigger id="quiz-group" className="w-36"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Tous</SelectItem>
                            {(data?.groups ?? []).map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="quiz-session">Session</Label>
                    <Select value={sessionId} onValueChange={setSessionId}>
                        <SelectTrigger id="quiz-session" className="w-56"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Toutes les sessions</SelectItem>
                            {(data?.sessions ?? []).map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                    {formatDate(s.createdAt)} · {s.participantCount} participant(s)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

            <AdminDataTable
                columns={columns}
                data={data?.rows ?? []}
                emptyMessage="Aucun résultat pour ces filtres. Les notes apparaissent après une session de quiz."
                getRowKey={(r) => `${r.sessionId}:${r.userId}`}
                renderSubRow={(r) => (
                    <details className="px-4 pb-3 text-sm">
                        <summary className="cursor-pointer font-medium">
                            Détail des réponses ({r.answers.length})
                        </summary>
                        <ul className="mt-2 flex flex-col gap-2">
                            {r.answers.map((a) => (
                                <li key={a.questionId} className="whitespace-normal">
                                    <span className="font-semibold">Q{a.questionNumber}</span>
                                    {" · "}{formatPoints(a.scoreObtained)} / {formatPoints(a.scoreMax)} pt
                                    {" · "}{Math.round(a.timeMs / 100) / 10} s
                                    <br/>
                                    Réponse : {a.selectedTexts.length > 0 ? a.selectedTexts.join(", ") : "aucune"}
                                    {" — "}attendu : {a.correctTexts.join(", ")}
                                </li>
                            ))}
                        </ul>
                    </details>
                )}
            />
        </section>
    );
}
