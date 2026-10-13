"use client";

import {useRef, useState} from "react";
import {Loader2, PenLine, Trash2, Upload} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Eyebrow from "@/components/admin/ui/Eyebrow";
import {ADMIN_CARD} from "@/components/admin/ui/adminStyles";
import {SIGNATURE_MAX_BYTES} from "@/lib/vacation/signatureConfig";
import {cn} from "@/lib/utils";

const ENDPOINT = "/api/admin/vacations/signature";
const ACCEPT = "image/png,image/jpeg,image/webp";

type Status = "loading" | "present" | "empty";

/** Signature téléversée une fois, stockée en base, apposée sur chaque fiche générée. */
export default function VacationSignatureCard() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<Status>("loading");
    const [version, setVersion] = useState(() => Date.now());
    const [busy, setBusy] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const present = status === "present";

    async function handleFile(file: File) {
        if (file.size > SIGNATURE_MAX_BYTES) {
            toast.error(`Fichier trop volumineux (max ${SIGNATURE_MAX_BYTES / 1024 / 1024} Mo).`);
            return;
        }
        setBusy(true);
        try {
            const body = new FormData();
            body.append("file", file);
            const res = await fetch(ENDPOINT, {method: "PUT", body});
            if (!res.ok) {
                const data = (await res.json().catch(() => ({}))) as {error?: string};
                throw new Error(data.error ?? "Téléversement impossible");
            }
            setStatus("loading");
            setVersion(Date.now());
            toast.success("Signature enregistrée.");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Téléversement impossible");
        } finally {
            setBusy(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    async function handleDelete() {
        setBusy(true);
        try {
            const res = await fetch(ENDPOINT, {method: "DELETE"});
            if (!res.ok) throw new Error("Suppression impossible");
            setStatus("empty");
            toast.success("Signature supprimée.");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Suppression impossible");
        } finally {
            setBusy(false);
            setConfirmDelete(false);
        }
    }

    return (
        <section className={cn(ADMIN_CARD, "flex flex-wrap items-center gap-x-6 gap-y-4 p-5")}>
            <div
                className={cn(
                    "relative flex aspect-[555/183] w-64 shrink-0 items-center justify-center overflow-hidden rounded-lg border",
                    present
                        ? "border-bridge-500/35 bg-white"
                        : "border-dashed border-bridge-500/50 bg-bridge-100/40 dark:bg-bridge-900/40",
                )}
            >
                {/* eslint-disable-next-line @next/next/no-img-element -- aperçu d'une route API authentifiée, no-store */}
                <img
                    key={version}
                    src={`${ENDPOINT}?v=${version}`}
                    alt="Aperçu de votre signature"
                    className={cn("size-full object-contain", !present && "hidden")}
                    onLoad={() => setStatus("present")}
                    onError={() => setStatus("empty")}
                />
                {status === "loading" && <Loader2 className="size-5 animate-spin text-bridge-600 dark:text-bridge-300"/>}
                {status === "empty" && (
                    <span className="flex items-center gap-2 text-sm text-bridge-600 dark:text-bridge-300">
                        <PenLine className="size-4" aria-hidden/>
                        Aucune signature
                    </span>
                )}
            </div>

            <div className="flex min-w-60 flex-1 flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <Eyebrow>Signature</Eyebrow>
                    <p className="text-sm text-bridge-700 dark:text-bridge-200">
                        {present
                            ? "Utilisée automatiquement sur chaque fiche."
                            : "Téléversez-la une fois : elle sera apposée automatiquement sur chaque fiche. Sans signature, la fiche sort sans."}
                    </p>
                    <p className="text-xs text-bridge-600 dark:text-bridge-300">
                        PNG, JPEG ou WebP, 1 Mo maximum. Idéalement sur fond transparent ou blanc.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPT}
                        className="sr-only"
                        tabIndex={-1}
                        aria-label="Fichier de signature"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFile(file);
                        }}
                    />
                    <Button variant={present ? "outline" : "default"} disabled={busy} onClick={() => inputRef.current?.click()}>
                        {busy ? <Loader2 className="animate-spin"/> : <Upload/>}
                        {present ? "Remplacer la signature" : "Téléverser une signature"}
                    </Button>
                    {present && (
                        <Button variant="ghost" disabled={busy} onClick={() => setConfirmDelete(true)}>
                            <Trash2/>
                            Supprimer
                        </Button>
                    )}
                </div>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer la signature ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Les prochaines fiches seront générées sans signature, jusqu&apos;à un nouveau téléversement.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => void handleDelete()}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
