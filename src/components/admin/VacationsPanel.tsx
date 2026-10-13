"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {CalendarArrowDown, Download, Loader2, Mail, Plus, Trash2, TriangleAlert} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import AdminDataTable, {type AdminColumn} from "@/components/admin/ui/AdminDataTable";
import Eyebrow from "@/components/admin/ui/Eyebrow";
import {ADMIN_CARD} from "@/components/admin/ui/adminStyles";
import VacationSignatureCard from "@/components/admin/VacationSignatureCard";
import {computeTotals, FICHE_MAX_ROWS, type FicheRow} from "@/lib/vacation/fiche";
import {cn} from "@/lib/utils";

/** Taux horaire brut de l'heure ETD : 43,50 € (en vigueur au 01/07/2023, rappelé sur la fiche). */
const ETD_RATE = 43.5;

/**
 * Coefficient net/brut indicatif (avant prélèvement à la source). Valeur par défaut
 * non issue d'un bulletin : à ajuster avec `net ÷ brut` d'une vraie paie de vacations.
 */
const NET_RATIO = 0.88;

/** Dernier destinataire saisi, retenu dans ce navigateur (confort, pas une donnée de référence). */
const MAIL_TO_KEY = "vacations:mail-to";

function readStoredMailTo(): string {
    try {
        return localStorage.getItem(MAIL_TO_KEY) ?? "";
    } catch {
        return "";
    }
}

type EditableRow = FicheRow & {id: string};
type HourField = "cours" | "td" | "tp";

interface LoadResponse {
    rows: FicheRow[];
    warnings: string[];
    matieres: Record<string, string>;
    mailTo?: string;
    error?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
/** Mois précédent au format AAAA-MM : la fiche se remplit après la fin du mois. */
const previousMonth = () => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const formatHours = (n: number) => n.toLocaleString("fr-FR", {maximumFractionDigits: 2});
const euros = new Intl.NumberFormat("fr-FR", {style: "currency", currency: "EUR"});

let rowSeq = 0;
const withId = (row: FicheRow): EditableRow => ({...row, id: `row-${++rowSeq}`});

export default function VacationsPanel() {
    const [month, setMonth] = useState(previousMonth);
    const [signedAt, setSignedAt] = useState(today);
    const [rows, setRows] = useState<EditableRow[]>([]);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [matieres, setMatieres] = useState<Record<string, string>>({});
    const [loadedMonth, setLoadedMonth] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [drafting, setDrafting] = useState(false);
    const [mailTo, setMailTo] = useState("");

    const totals = useMemo(() => computeTotals(rows), [rows]);
    const unknownCodes = rows.filter((r) => r.code && Object.keys(matieres).length > 0 && !matieres[r.code]);
    const canExport = rows.length > 0 && rows.length <= FICHE_MAX_ROWS && !exporting;

    async function loadMonth(target: string) {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/vacations?month=${encodeURIComponent(target)}`);
            const body = (await res.json()) as LoadResponse;
            if (!res.ok) throw new Error(body.error ?? "Chargement impossible");
            setRows(body.rows.map(withId));
            setWarnings(body.warnings);
            setMatieres(body.matieres);
            setMailTo((prev) => prev || readStoredMailTo() || body.mailTo || "");
            setLoadedMonth(target);
            if (body.rows.length === 0) toast.info("Aucun créneau trouvé sur ce mois.");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Chargement impossible");
        } finally {
            setLoading(false);
        }
    }

    const handleLoad = () => loadMonth(month);

    // Préchargement du mois proposé à l'ouverture ; le garde-fou évite le double appel du StrictMode.
    const preloaded = useRef(false);
    useEffect(() => {
        if (preloaded.current) return;
        preloaded.current = true;
        void loadMonth(month);
        // reason: exécuté une seule fois à l'ouverture, avec le mois initial
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function updateRow(id: string, patch: Partial<FicheRow>) {
        setRows((prev) => prev.map((r) => (r.id === id ? {...r, ...patch} : r)));
    }

    function addRow() {
        setRows((prev) => [
            ...prev,
            withId({date: `${month}-01`, code: "", label: "", annee: null, cours: 0, td: 0, tp: 0}),
        ]);
    }

    /** POST la fiche courante vers `endpoint` et télécharge le fichier renvoyé. */
    async function downloadFrom(
        endpoint: string,
        extra: Record<string, string>,
        fallbackName: string,
        setBusy: (busy: boolean) => void,
    ) {
        setBusy(true);
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    month: loadedMonth ?? month,
                    signedAt,
                    rows: rows.map(({date, code, label, annee, cours, td, tp}) => ({date, code, label, annee, cours, td, tp})),
                    ...extra,
                }),
            });
            if (!res.ok) {
                const body = (await res.json().catch(() => ({}))) as {error?: string};
                throw new Error(body.error ?? "Génération impossible");
            }
            const filename =
                /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? fallbackName;
            const url = URL.createObjectURL(await res.blob());
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Génération impossible");
        } finally {
            setBusy(false);
        }
    }

    const handleExport = () => downloadFrom("/api/admin/vacations", {}, "heure_vacation.xlsx", setExporting);

    function handleDraft() {
        try {
            localStorage.setItem(MAIL_TO_KEY, mailTo);
        } catch {
            // stockage indisponible : le destinataire sera simplement à ressaisir
        }
        return downloadFrom("/api/admin/vacations/draft", {to: mailTo}, "brouillon.eml", setDrafting);
    }

    function renderHourInput(row: EditableRow, field: HourField, label: string) {
        return (
            <Input
                type="number"
                inputMode="decimal"
                min={0}
                max={24}
                step={0.5}
                aria-label={`${label} — ${row.date}`}
                value={row[field] || ""}
                placeholder="0"
                onChange={(e) => updateRow(row.id, {[field]: Math.max(0, Number(e.target.value) || 0)})}
                className="w-20 tabular-nums"
            />
        );
    }

    const columns: AdminColumn<EditableRow>[] = [
        {
            id: "date",
            header: "Date",
            cell: (row) => (
                <Input
                    type="date"
                    aria-label="Date"
                    value={row.date}
                    onChange={(e) => updateRow(row.id, {date: e.target.value})}
                    className="w-38"
                />
            ),
        },
        {
            id: "code",
            header: "Matière",
            cell: (row) => {
                const known = matieres[row.code];
                const unknown = row.code !== "" && Object.keys(matieres).length > 0 && !known;
                return (
                    <div className="flex items-center gap-3">
                        <Input
                            aria-label="Code matière"
                            aria-invalid={unknown || row.code === "" || undefined}
                            value={row.code}
                            placeholder="R3.01"
                            onChange={(e) => updateRow(row.id, {code: e.target.value.toUpperCase().trim()})}
                            className="w-24 font-mono"
                        />
                        <span
                            className={cn(
                                "max-w-56 truncate text-sm",
                                unknown ? "text-destructive" : "text-bridge-600 dark:text-bridge-300",
                            )}
                            title={known ?? row.label}
                        >
                            {known ?? (unknown ? "Code absent du modèle" : row.label || "—")}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "annee",
            header: "Année",
            cell: (row) => (
                <Input
                    type="number"
                    min={1}
                    max={3}
                    aria-label="Année d'étude"
                    value={row.annee ?? ""}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        updateRow(row.id, {annee: v >= 1 && v <= 3 ? v : null});
                    }}
                    className="w-16 tabular-nums"
                />
            ),
        },
        {id: "cours", header: "Cours", cell: (row) => renderHourInput(row, "cours", "Heures de cours")},
        {id: "td", header: "TD", cell: (row) => renderHourInput(row, "td", "Heures de TD")},
        {id: "tp", header: "TP", cell: (row) => renderHourInput(row, "tp", "Heures de TP")},
        {
            id: "actions",
            header: <span className="sr-only">Actions</span>,
            cell: (row) => (
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Supprimer la ligne du ${row.date}`}
                    onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
                >
                    <Trash2/>
                </Button>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <section className={cn(ADMIN_CARD, "flex flex-col gap-6 p-5")}>
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="vacation-month">Mois</Label>
                        <Input
                            id="vacation-month"
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-44"
                        />
                    </div>
                    <Button onClick={handleLoad} disabled={loading || !month}>
                        {loading ? <Loader2 className="animate-spin"/> : <CalendarArrowDown/>}
                        Charger depuis l&apos;emploi du temps
                    </Button>
                    {loadedMonth && loadedMonth !== month && (
                        <p className="text-sm text-bridge-600 dark:text-bridge-300">
                            Lignes affichées : {loadedMonth}. Rechargez pour changer de mois.
                        </p>
                    )}
                </div>

                {warnings.length > 0 && (
                    <Alert>
                        <TriangleAlert/>
                        <AlertTitle>À vérifier avant export</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-4">
                                {warnings.map((w) => <li key={w}>{w}</li>)}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                {loadedMonth && (
                    <>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                                <Eyebrow>
                                    {rows.length} / {FICHE_MAX_ROWS} lignes
                                </Eyebrow>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={addRow}
                                    disabled={rows.length >= FICHE_MAX_ROWS}
                                >
                                    <Plus/>
                                    Ajouter une ligne
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <AdminDataTable
                                    columns={columns}
                                    data={rows}
                                    getRowKey={(row) => row.id}
                                    emptyMessage="Aucun créneau sur ce mois. Ajoutez une ligne à la main si besoin."
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 border-t border-bridge-500/25 pt-5">
                            <div className="flex flex-wrap items-end justify-between gap-6">
                                <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-6">
                                    {[
                                        ["Cours", `${formatHours(totals.cours)} h`],
                                        ["TD", `${formatHours(totals.td)} h`],
                                        ["TP", `${formatHours(totals.tp)} h`],
                                        ["Total ETD", `${formatHours(totals.etd)} h`],
                                        ["Estimation brute", euros.format(totals.etd * ETD_RATE)],
                                        ["Net indicatif", euros.format(totals.etd * ETD_RATE * NET_RATIO)],
                                    ].map(([term, value]) => (
                                        <div key={term}>
                                            <dt className="text-bridge-600 dark:text-bridge-300">{term}</dt>
                                            <dd className="font-semibold tabular-nums text-brand-dark dark:text-bridge-100">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                                <div className="flex flex-wrap items-end gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="vacation-signed">Date de signature</Label>
                                        <Input
                                            id="vacation-signed"
                                            type="date"
                                            value={signedAt}
                                            onChange={(e) => setSignedAt(e.target.value)}
                                            className="w-40"
                                        />
                                    </div>
                                    <Button onClick={handleExport} disabled={!canExport || !signedAt || drafting}>
                                        {exporting ? <Loader2 className="animate-spin"/> : <Download/>}
                                        Télécharger la fiche
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-end gap-4 border-t border-bridge-500/25 pt-4">
                                <div className="flex min-w-64 flex-1 flex-col gap-1.5">
                                    <Label htmlFor="vacation-mail-to">Destinataire du brouillon</Label>
                                    <Input
                                        id="vacation-mail-to"
                                        type="email"
                                        inputMode="email"
                                        autoComplete="off"
                                        placeholder="prenom.nom@univ-lehavre.fr"
                                        value={mailTo}
                                        onChange={(e) => setMailTo(e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleDraft}
                                    disabled={!canExport || !signedAt || !mailTo.trim() || exporting || drafting}
                                >
                                    {drafting ? <Loader2 className="animate-spin"/> : <Mail/>}
                                    Brouillon e-mail (.eml)
                                </Button>
                                <p className="basis-full text-xs text-bridge-600 dark:text-bridge-300">
                                    Le fichier .eml s&apos;ouvre dans votre client mail (Outlook, Thunderbird, Mail) avec
                                    destinataire, objet, message et fiche déjà joints. Il ne s&apos;ouvre pas dans Gmail web.
                                </p>
                            </div>
                            <p className="text-xs text-bridge-600 dark:text-bridge-300">
                                Net indicatif : environ {Math.round(NET_RATIO * 100)} % du brut, avant prélèvement à la
                                source. Le montant réel dépend de votre situation et figure sur votre bulletin de paie.
                            </p>
                            {unknownCodes.length > 0 && (
                                <p className="text-sm text-destructive">
                                    {unknownCodes.length} ligne(s) avec un code absent de l&apos;onglet code_matiere : le
                                    libellé affichera #N/A dans Excel.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </section>

            <VacationSignatureCard/>
        </div>
    );
}
