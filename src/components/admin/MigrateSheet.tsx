'use client';

import { useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Database,
    FileSearch,
    Loader2,
    ShieldAlert,
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminSheetHeader from '@/components/admin/AdminSheetHeader';
import Eyebrow from '@/components/admin/ui/Eyebrow';
import { cn } from '@/lib/utils';

type MigrationMode = 'default' | 'dry-run' | 'force';
type MigrationFileStatus = 'dry-run' | 'written' | 'warning' | 'ignored' | 'error';

type MigrateResult = {
    mode: MigrationMode;
    ok: number;
    warn: number;
    ignored: number;
    error: number;
    total: number;
    results: {
        file: string;
        blocks: number;
        warnings: string[];
        status: MigrationFileStatus;
        error?: string;
        skippedReason?: 'edited-after-migration';
    }[];
};

const MIGRATION_ACTIONS: {
    id: MigrationMode;
    label: string;
    description: string;
    Icon: typeof Database;
}[] = [
    {
        id: 'dry-run',
        label: 'Dry run',
        description: 'Analyse les fichiers sans modifier MongoDB.',
        Icon: FileSearch,
    },
    {
        id: 'default',
        label: 'Migration',
        description: 'Importe en base et garde les contenus déjà retouchés.',
        Icon: Database,
    },
    {
        id: 'force',
        label: 'Force',
        description: 'Réécrit aussi les contenus retouchés depuis la migration.',
        Icon: ShieldAlert,
    },
];

function actionLabel(mode: MigrationMode): string {
    return MIGRATION_ACTIONS.find((action) => action.id === mode)?.label ?? 'Migration';
}

function statusLabel(status: MigrationFileStatus): string {
    switch (status) {
        case 'dry-run':
            return 'Testé';
        case 'written':
            return 'Migré';
        case 'warning':
            return 'Avertissement';
        case 'ignored':
            return 'Ignoré';
        case 'error':
            return 'Erreur';
    }
}

function summaryTone(result: MigrateResult) {
    if (result.error > 0) return 'destructive' as const;
    if (result.warn > 0 || result.ignored > 0) return 'outline' as const;
    return 'secondary' as const;
}

interface MigrateSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function MigrateSheet({ open, onOpenChange }: MigrateSheetProps) {
    const [loadingMode, setLoadingMode] = useState<MigrationMode | null>(null);
    const [result, setResult] = useState<MigrateResult | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const filesToReview = result?.results.filter(
        (item) => item.status === 'error' || item.status === 'warning' || item.status === 'ignored' || item.warnings.length > 0,
    ) ?? [];

    async function handleMigrate(mode: MigrationMode) {
        setLoadingMode(mode);
        setResult(null);
        setApiError(null);
        try {
            const res = await fetch('/api/admin/migrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode }),
            });
            const data = await res.json() as MigrateResult & { error?: string };
            if (!res.ok) throw new Error(data.error ?? 'Erreur serveur');
            setResult(data);
        } catch (e) {
            setApiError(e instanceof Error ? e.message : 'Erreur inconnue');
        } finally {
            setLoadingMode(null);
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn(
                    'p-0 gap-0 overflow-hidden flex flex-col sm:max-w-[520px]',
                    'bg-card',
                    'border-l border-bridge-500/45',
                    '[&>button]:text-white/80 [&>button:hover]:text-white dark:[&>button]:text-brand-dark/80 dark:[&>button:hover]:text-brand-dark',
                )}
            >
                <AdminSheetHeader
                    icon={Database}
                    eyebrow="Admin"
                    title="Migration"
                    description="Importer les contenus fichier vers MongoDB"
                    className="bg-brand-primary"
                />

                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
                    <section className="flex flex-col gap-3">
                        <Eyebrow>Actions</Eyebrow>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {MIGRATION_ACTIONS.map((action) => {
                                const Icon = action.Icon;
                                const isLoading = loadingMode === action.id;
                                return (
                                    <div key={action.id} className="flex min-h-32 flex-col justify-between gap-3 rounded-md border border-bridge-500/25 bg-bridge-100/45 p-3 dark:bg-bridge-900/25">
                                        <p className="text-sm leading-relaxed text-brand-dark/70 dark:text-bridge-200/70">
                                            {action.description}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                'min-h-10 w-full border-bridge-500/45',
                                                action.id === 'default' && 'border-brand-primary/55 bg-bridge-50 dark:bg-bridge-800',
                                                action.id === 'force' && 'text-destructive hover:bg-destructive/10 hover:text-destructive',
                                            )}
                                            onClick={() => void handleMigrate(action.id)}
                                            disabled={loadingMode !== null}
                                        >
                                            {isLoading
                                                ? <Loader2 data-icon="inline-start" className="animate-spin"/>
                                                : <Icon data-icon="inline-start"/>
                                            }
                                            {action.label}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                    <section className="flex flex-col gap-3">
                        <Eyebrow>Résultat</Eyebrow>

                        {apiError && (
                            <Alert variant="destructive">
                                <AlertTriangle aria-hidden="true"/>
                                <AlertTitle>Migration interrompue</AlertTitle>
                                <AlertDescription>{apiError}</AlertDescription>
                            </Alert>
                        )}

                        {!apiError && !result && (
                            <p className="text-sm text-brand-dark/70 dark:text-bridge-200/70">
                                Lancez un mode pour afficher le bilan ici.
                            </p>
                        )}

                        {result && (
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap items-center gap-2" aria-live="polite">
                                    <Badge variant={summaryTone(result)}>
                                        {result.error === 0 ? <CheckCircle2 aria-hidden="true"/> : <AlertTriangle aria-hidden="true"/>}
                                        {actionLabel(result.mode)}
                                    </Badge>
                                    <Badge variant="outline">{result.ok} ok</Badge>
                                    {result.warn > 0 && <Badge variant="outline">{result.warn} avert.</Badge>}
                                    {result.ignored > 0 && <Badge variant="outline">{result.ignored} ignoré{result.ignored !== 1 ? 's' : ''}</Badge>}
                                    {result.error > 0 && <Badge variant="destructive">{result.error} erreur{result.error !== 1 ? 's' : ''}</Badge>}
                                    <span className="text-xs text-bridge-600 dark:text-bridge-300">
                                        {result.total} fichier{result.total !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {filesToReview.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-semibold text-brand-dark dark:text-bridge-100">
                                            Fichiers à vérifier
                                        </p>
                                        <ul className="max-h-[45dvh] overflow-y-auto rounded-md border border-bridge-500/25">
                                            {filesToReview.map((item) => (
                                                <li
                                                    key={`${item.file}-${item.status}`}
                                                    className="flex flex-col gap-1 border-b border-bridge-500/15 px-3 py-2 text-xs last:border-b-0 dark:border-bridge-500/20"
                                                >
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge variant={item.status === 'error' ? 'destructive' : 'outline'}>
                                                            {statusLabel(item.status)}
                                                        </Badge>
                                                        <span className="font-mono text-brand-dark dark:text-bridge-100">{item.file}</span>
                                                        <span className="text-bridge-600 dark:text-bridge-300">
                                                            {item.blocks} bloc{item.blocks !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    {item.error && <p className="text-destructive">{item.error}</p>}
                                                    {item.skippedReason === 'edited-after-migration' && (
                                                        <p className="text-bridge-600 dark:text-bridge-300">
                                                            Contenu déjà édité en base. Utilisez Force pour le remplacer.
                                                        </p>
                                                    )}
                                                    {item.warnings.length > 0 && (
                                                        <p className="text-bridge-600 dark:text-bridge-300">
                                                            {item.warnings.join(' · ')}
                                                        </p>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-sm text-brand-dark/70 dark:text-bridge-200/70">
                                        Aucun fichier à vérifier.
                                    </p>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    );
}
