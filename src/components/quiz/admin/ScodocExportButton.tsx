"use client";

import {useRef, useState, type ChangeEvent} from "react";
import {Button} from "@/components/ui/button";

interface Report {
    filled: number;
    absent: number;
    unmatched: {firstName: string; lastName: string}[];
}

/** Dépose la feuille de saisie ScoDoc d'une session et télécharge la version remplie. */
export default function ScodocExportButton({sessionId}: {sessionId: string | null}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<Report | null>(null);

    const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        const file = input.files?.[0];
        if (!file || !sessionId) return;
        setPending(true);
        setError(null);
        setReport(null);
        try {
            const body = new FormData();
            body.set("sessionId", sessionId);
            body.set("file", file);
            const res = await fetch("/api/quiz/results/scodoc", {method: "POST", body});
            if (!res.ok) {
                const json = (await res.json().catch(() => null)) as {error?: string} | null;
                setError(json?.error ?? "L'export a échoué.");
                return;
            }
            const header = res.headers.get("X-Scodoc-Report");
            if (header) setReport(JSON.parse(decodeURIComponent(header)) as Report);
            const url = URL.createObjectURL(await res.blob());
            const link = document.createElement("a");
            link.href = url;
            link.download = file.name;
            link.click();
            URL.revokeObjectURL(url);
        } catch {
            setError("L'export a échoué.");
        } finally {
            setPending(false);
            // Permet de redéposer le même fichier au prochain essai.
            input.value = "";
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <Button type="button" variant="outline" disabled={!sessionId || pending}
                        onClick={() => inputRef.current?.click()}>
                    Remplir une feuille ScoDoc
                </Button>
                {!sessionId && (
                    <span className="text-sm text-muted-foreground">Choisissez une session</span>
                )}
                <input ref={inputRef} type="file" hidden onChange={onFile}
                       accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {report && (
                <div className="text-sm" role="status">
                    <p>{report.filled} notes, {report.absent} ABS</p>
                    {report.unmatched.length > 0 && (
                        <>
                            <p>Participants sans ligne dans la feuille :</p>
                            <ul className="list-disc pl-5">
                                {report.unmatched.map((p, i) => (
                                    <li key={i}>{p.lastName.toUpperCase()} {p.firstName}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
