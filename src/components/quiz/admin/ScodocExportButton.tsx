"use client";

import {useRef, useState, type ChangeEvent} from "react";
import {Button} from "@/components/ui/button";

export interface ScodocReport {
    filled: number;
    absent: number;
    unmatched: {firstName: string; lastName: string}[];
}

/** Lit l'en-tête `X-Scodoc-Report` ; null si absent ou mal formé. */
export function parseReport(header: string | null): ScodocReport | null {
    if (!header) return null;
    try {
        const value = JSON.parse(decodeURIComponent(header)) as Partial<ScodocReport> | null;
        if (!value || typeof value.filled !== "number" || typeof value.absent !== "number"
            || !Array.isArray(value.unmatched)) return null;
        const unmatched = value.unmatched.filter(
            (p) => p && typeof p.firstName === "string" && typeof p.lastName === "string");
        return {filled: value.filled, absent: value.absent, unmatched};
    } catch {
        return null;
    }
}

/** Gère l'envoi de la feuille et le téléchargement du fichier rempli pour une session. */
export function useScodocExport(sessionId: string | null) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<ScodocReport | null>(null);

    // Un rapport ne vaut que pour la session qui l'a produit.
    const [reportSession, setReportSession] = useState(sessionId);
    if (reportSession !== sessionId) {
        setReportSession(sessionId);
        setError(null);
        setReport(null);
    }

    const upload = async (file: File) => {
        if (!sessionId) return;
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
            // Le téléchargement passe avant le rapport : un en-tête illisible ne doit pas le bloquer.
            const url = URL.createObjectURL(await res.blob());
            const link = document.createElement("a");
            link.href = url;
            link.download = file.name;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 0);
            setReport(parseReport(res.headers.get("X-Scodoc-Report")));
        } catch {
            setError("L'export a échoué.");
        } finally {
            setPending(false);
        }
    };

    return {pending, error, report, upload};
}

/** Bouton de dépôt de la feuille ScoDoc, à placer dans la barre de filtres. */
export default function ScodocExportButton({sessionId, pending = false, onUpload}: {
    sessionId: string | null;
    pending?: boolean;
    onUpload?: (file: File) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const onFile = (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        const file = input.files?.[0];
        if (file) onUpload?.(file);
        // Permet de redéposer le même fichier au prochain essai.
        input.value = "";
    };

    return (
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
    );
}

/** Résumé de l'export ; la zone live reste montée pour que les lecteurs d'écran annoncent le changement. */
export function ScodocReportView({report}: {report: ScodocReport | null}) {
    return (
        <div role="status" aria-live="polite" className="text-sm">
            {report && (
                <>
                    <p>
                        {report.filled} notes, {report.absent} ABS, {report.unmatched.length} participant(s) non trouvé(s)
                    </p>
                    {report.filled === 0 && report.unmatched.length > 0 && (
                        <p className="font-medium text-destructive">
                            Aucun e-mail ne correspond : cette session date peut-être d&apos;avant l&apos;enregistrement des e-mails. Ne déposez pas cette feuille dans ScoDoc.
                        </p>
                    )}
                    {report.unmatched.length > 0 && (
                        <>
                            <p>Participants sans ligne dans la feuille :</p>
                            <ul className="list-disc pl-5">
                                {report.unmatched.map((p, i) => (
                                    <li key={i}>{p.lastName.toUpperCase()} {p.firstName}</li>
                                ))}
                            </ul>
                            <p className="text-muted-foreground">
                                Ces étudiants ont besoin d&apos;une note saisie à la main dans ScoDoc.
                            </p>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
