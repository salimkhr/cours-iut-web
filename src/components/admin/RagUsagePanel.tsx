"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Loader2, RefreshCw} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import AdminDataTable, {type AdminColumn} from "@/components/admin/ui/AdminDataTable";
import Eyebrow from "@/components/admin/ui/Eyebrow";
import {ADMIN_CARD} from "@/components/admin/ui/adminStyles";
import type {RagStep, RagUsageEntry} from "@/lib/rag/usage";

/** Entrée sérialisée pour le client : la date voyage en ISO. */
export type RagUsageRow = Omit<RagUsageEntry, "createdAt"> & {createdAt: string};

type StepTotal = {calls: number; tokens: number; costUsd: number};

interface RagUsagePanelProps {
    entries: RagUsageRow[];
    summary: Partial<Record<RagStep, StepTotal>>;
    /** Date ISO de la dernière synchro réussie, `null` si l'index n'a jamais été construit. */
    lastSyncAt: string | null;
}

interface SyncResult {
    contentsChecked: number;
    chunksEmbedded: number;
    chunksUnchanged: number;
    pointsDeleted: number;
    error?: string;
}

const STEP_LABELS: Record<RagStep, string> = {index: "Indexation", sync: "Synchro", search: "Recherche"};

const formatTokens = (n: number) => n.toLocaleString("fr-FR");
const formatCost = (usd: number) => `${usd.toLocaleString("fr-FR", {minimumFractionDigits: 4, maximumFractionDigits: 4})} $`;

const columns: AdminColumn<RagUsageRow>[] = [
    {
        id: "date",
        header: "Date",
        cell: (row) => new Date(row.createdAt).toLocaleString("fr-FR", {dateStyle: "short", timeStyle: "medium"}),
    },
    {id: "step", header: "Étape", cell: (row) => STEP_LABELS[row.step]},
    {
        id: "detail",
        header: "Détail",
        cell: (row) => row.query ? `« ${row.query} »` : `${row.inputs} morceaux → ${row.collection}`,
    },
    {id: "tokens", header: "Tokens", cell: (row) => <span className="tabular-nums">{formatTokens(row.tokens)}</span>},
    {id: "cost", header: "Coût estimé", cell: (row) => <span className="tabular-nums">{formatCost(row.costUsd)}</span>},
    {
        id: "duration",
        header: "Durée",
        cell: (row) => <span className="tabular-nums">{(row.durationMs / 1000).toLocaleString("fr-FR", {maximumFractionDigits: 1})} s</span>,
    },
];

function TotalCard({label, total}: {label: string; total: StepTotal}) {
    return (
        <div className={`${ADMIN_CARD} flex flex-col gap-2 p-5`}>
            <Eyebrow>{label}</Eyebrow>
            <p className="text-2xl font-semibold tabular-nums text-brand-dark dark:text-bridge-100">{formatCost(total.costUsd)}</p>
            <p className="text-sm text-brand-dark/70 dark:text-bridge-100/70">
                {total.calls} appel{total.calls > 1 ? "s" : ""} · {formatTokens(total.tokens)} tokens
            </p>
        </div>
    );
}

function SyncButton({lastSyncAt}: {lastSyncAt: string | null}) {
    const router = useRouter();
    const [syncing, setSyncing] = useState(false);

    async function handleSync() {
        setSyncing(true);
        try {
            const res = await fetch("/api/admin/rag/sync", {method: "POST"});
            const result = await res.json() as SyncResult;
            if (!res.ok) throw new Error(result.error ?? "Synchro échouée");
            toast.success(
                `${result.contentsChecked} contenus relus : ${result.chunksEmbedded} morceaux revectorisés, ` +
                `${result.chunksUnchanged} inchangés, ${result.pointsDeleted} supprimés.`,
            );
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Synchro échouée");
        } finally {
            setSyncing(false);
        }
    }

    return (
        <div className={`${ADMIN_CARD} flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between`}>
            <div className="flex flex-col gap-1">
                <Eyebrow>Index</Eyebrow>
                <p className="text-sm text-brand-dark/70 dark:text-bridge-100/70">
                    {lastSyncAt
                        ? `Dernière synchro : ${new Date(lastSyncAt).toLocaleString("fr-FR", {dateStyle: "short", timeStyle: "short"})}. Seuls les contenus modifiés depuis seront relus.`
                        : "L'index n'a jamais été construit : la première synchro vectorise tous les cours et TP."}
                </p>
            </div>
            <Button onClick={handleSync} disabled={syncing} className="shrink-0">
                {syncing ? <Loader2 className="size-4 animate-spin" aria-hidden="true"/> : <RefreshCw className="size-4" aria-hidden="true"/>}
                {syncing ? "Synchro en cours…" : "Mettre à jour l'index"}
            </Button>
        </div>
    );
}

export default function RagUsagePanel({entries, summary, lastSyncAt}: RagUsagePanelProps) {
    const steps = (Object.keys(STEP_LABELS) as RagStep[]).filter((step) => summary[step]);
    const total = steps.reduce<StepTotal>((acc, step) => ({
        calls: acc.calls + summary[step]!.calls,
        tokens: acc.tokens + summary[step]!.tokens,
        costUsd: acc.costUsd + summary[step]!.costUsd,
    }), {calls: 0, tokens: 0, costUsd: 0});

    return (
        <div className="flex flex-col gap-6">
            <SyncButton lastSyncAt={lastSyncAt}/>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <TotalCard label="Total" total={total}/>
                {steps.map((step) => <TotalCard key={step} label={STEP_LABELS[step]} total={summary[step]!}/>)}
            </div>
            <AdminDataTable
                columns={columns}
                data={entries}
                emptyMessage="Aucun appel enregistré. Lancez bun run rag:index ou bun run rag:search."
                getRowKey={(row) => row.createdAt}
            />
            <p className="text-sm text-brand-dark/70 dark:text-bridge-100/70">
                Coût estimé au tarif public de mistral-embed (0,10 $ le million de tokens). Le montant facturé fait foi dans la console Mistral.
            </p>
        </div>
    );
}
