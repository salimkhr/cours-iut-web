"use client";

import {useEffect, useState} from "react";
import {Loader2, ShieldCheck, ShieldOff} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import Eyebrow from "@/components/admin/ui/Eyebrow";
import {ADMIN_CARD} from "@/components/admin/ui/adminStyles";
import {cn} from "@/lib/utils";

const ENDPOINT = "/api/admin/exam-mode";

const DURATIONS = [
    {minutes: 60, label: "1 h"},
    {minutes: 120, label: "2 h"},
    {minutes: 180, label: "3 h"},
    {minutes: 240, label: "4 h"},
] as const;

export type ExamModeJson = {active: boolean; until: string | null; enabledBy: string | null};

const timeFormat = new Intl.DateTimeFormat("fr-FR", {hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris"});

/**
 * Bascule de secours : retire le captcha de la connexion pour tout le monde pendant une
 * durée bornée, quand l'exemption par plage d'IP de l'IUT ne suffit pas.
 */
export default function ExamModeCard({initial}: {initial: ExamModeJson}) {
    const [state, setState] = useState<ExamModeJson>(initial);
    const [minutes, setMinutes] = useState<string>("120");
    const [busy, setBusy] = useState(false);

    // Le mode s'éteint seul côté serveur : on reflète l'échéance sans recharger la page.
    useEffect(() => {
        if (!state.active || !state.until) return;
        const remaining = new Date(state.until).getTime() - Date.now();
        const id = setTimeout(() => setState({active: false, until: null, enabledBy: null}), Math.max(0, remaining));
        return () => clearTimeout(id);
    }, [state]);

    async function send(method: "PUT" | "DELETE") {
        setBusy(true);
        try {
            const res = await fetch(ENDPOINT, {
                method,
                headers: method === "PUT" ? {"Content-Type": "application/json"} : undefined,
                body: method === "PUT" ? JSON.stringify({durationMinutes: Number(minutes)}) : undefined,
            });
            const data = (await res.json().catch(() => ({}))) as Partial<ExamModeJson> & {error?: string};
            if (!res.ok) throw new Error(data.error ?? "Opération impossible");
            const next = {active: !!data.active, until: data.until ?? null, enabledBy: data.enabledBy ?? null};
            setState(next);
            toast.success(next.active && next.until
                ? `Mode examen actif jusqu'à ${timeFormat.format(new Date(next.until))}.`
                : "Mode examen désactivé, captcha rétabli.");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Opération impossible");
        } finally {
            setBusy(false);
        }
    }

    const Icon = state.active ? ShieldOff : ShieldCheck;

    return (
        <section className={cn(ADMIN_CARD, "flex flex-col gap-4 p-5")}>
            <div className="flex items-start gap-3">
                <Icon
                    className={cn(
                        "mt-0.5 size-5 shrink-0",
                        state.active ? "text-brand-accent-dark" : "text-bridge-600 dark:text-bridge-300",
                    )}
                    aria-hidden
                />
                <div className="flex flex-col gap-1">
                    <Eyebrow>Mode examen</Eyebrow>
                    <p className="text-sm font-semibold text-brand-dark dark:text-bridge-50" role="status">
                        {state.active && state.until
                            ? `Actif jusqu'à ${timeFormat.format(new Date(state.until))} : captcha retiré de la connexion.`
                            : "Inactif : captcha exigé hors réseau de l'IUT."}
                    </p>
                    <p className="text-xs text-bridge-700 dark:text-bridge-200">
                        Secours si les étudiants ne peuvent pas se connecter en salle (Cloudflare bloqué et IP de
                        l&apos;IUT non reconnue). Retire le captcha et relève la limite de tentatives de
                        connexion (60 par 10 s et par IP), pour tout le monde et pas seulement à l&apos;IUT.
                        S&apos;éteint seul à l&apos;échéance.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
                {!state.active && (
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="exam-mode-duration" className="text-xs">Durée</Label>
                        <Select value={minutes} onValueChange={setMinutes} disabled={busy}>
                            <SelectTrigger id="exam-mode-duration" className="min-h-11 w-32 border-bridge-500/45">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                {DURATIONS.map((d) => (
                                    <SelectItem key={d.minutes} value={String(d.minutes)}>{d.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <Button
                    type="button"
                    variant={state.active ? "outline" : "default"}
                    className="min-h-11 cursor-pointer"
                    disabled={busy}
                    onClick={() => void send(state.active ? "DELETE" : "PUT")}
                >
                    {busy && <Loader2 className="size-4 animate-spin" aria-hidden/>}
                    {state.active ? "Désactiver maintenant" : "Activer le mode examen"}
                </Button>
            </div>
        </section>
    );
}
