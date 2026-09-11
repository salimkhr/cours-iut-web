'use client';

import { useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    FileSearch,
    Loader2,
    Wrench,
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminSheetHeader from '@/components/admin/AdminSheetHeader';
import Eyebrow from '@/components/admin/ui/Eyebrow';
import { cn } from '@/lib/utils';

type RepairMode = 'dry-run' | 'apply';
type RepairStatus = 'convertible' | 'converted' | 'warning' | 'error';

type RepairDocResult = {
    section: string;
    contentId: string;
    version: number;
    rootTypesBefore: string[];
    blocksConverted: number;
    remainingUnrenderable: string[];
    status: RepairStatus;
    error?: string;
};

type RepairResult = {
    mode: RepairMode;
    total: number;
    clean: number;
    convertible: number;
    warning: number;
    error: number;
    results: RepairDocResult[];
};

function statusLabel(status: RepairStatus): string {
    switch (status) {
        case 'convertible': return 'À convertir';
        case 'converted': return 'Converti';
        case 'warning': return 'Avertissement';
        case 'error': return 'Erreur';
    }
}

function summaryTone(result: RepairResult) {
    if (result.error > 0) return 'destructive' as const;
    if (result.warning > 0 || result.convertible > 0) return 'outline' as const;
    return 'secondary' as const;
}

interface SlideRepairSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SlideRepairSheet({ open, onOpenChange }: SlideRepairSheetProps) {
    const [loadingMode, setLoadingMode] = useState<RepairMode | null>(null);
    const [result, setResult] = useState<RepairResult | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    async function runRepair(mode: RepairMode) {
        setLoadingMode(mode);
        setApiError(null);
        try {
            const res = await fetch('/api/admin/slide-repair', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode }),
            });
            const data = await res.json() as RepairResult & { error?: string };
            if (!res.ok) throw new Error(data.error ?? 'Erreur serveur');
            setResult(data);
        } catch (e) {
            setApiError(e instanceof Error ? e.message : 'Erreur inconnue');
        } finally {
            setLoadingMode(null);
        }
    }

    const hasScanned = result !== null;
    const canApply = hasScanned && result.convertible > 0;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn(
                    'p-0 gap-0 overflow-hidden flex flex-col sm:max-w-[560px]',
                    'bg-card',
                    'border-l border-bridge-500/45',
                    '[&>button]:text-white/80 [&>button:hover]:text-white dark:[&>button]:text-brand-dark/80 dark:[&>button:hover]:text-brand-dark',
                )}
            >
                <AdminSheetHeader
                    icon={Wrench}
                    eyebrow="Admin"
                    title="Réparer les slides"
                    description="Convertit les présentations dont les blocs racine sont restés au format cours (`section`)."
                    className="bg-brand-primary"
                />

                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
                    <section className="flex flex-col gap-3">
                        <Eyebrow>Diagnostic</Eyebrow>
                        <p className="text-sm leading-relaxed text-brand-dark/70 dark:text-bridge-200/70">
                            Un document <code>contentType: &quot;slide&quot;</code> dont les blocs racine sont
                            de type <code>section</code> (au lieu de <code>slide</code>) ne s&apos;affiche
                            jamais côté étudiant, même si le contenu existe en base. Analysez d&apos;abord
                            sans rien écrire, puis convertissez.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="min-h-10 border-bridge-500/45"
                                onClick={() => void runRepair('dry-run')}
                                disabled={loadingMode !== null}
                            >
                                {loadingMode === 'dry-run'
                                    ? <Loader2 data-icon="inline-start" className="animate-spin"/>
                                    : <FileSearch data-icon="inline-start"/>
                                }
                                Analyser (dry-run)
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="min-h-10 border-destructive/45 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        disabled={!canApply || loadingMode !== null}
                                    >
                                        {loadingMode === 'apply'
                                            ? <Loader2 data-icon="inline-start" className="animate-spin"/>
                                            : <Wrench data-icon="inline-start"/>
                                        }
                                        Convertir
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent
                                    className={cn(
                                        'bg-card',
                                        'border border-bridge-500/45',
                                        'shadow-[0_22px_44px_-14px_rgba(147,97,58,0.45)] dark:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.7)]',
                                    )}
                                >
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-brand-dark dark:text-bridge-100">
                                            Convertir {result?.convertible ?? 0} présentation{(result?.convertible ?? 0) !== 1 ? 's' : ''} ?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-bridge-600 dark:text-bridge-400">
                                            Chaque document est sauvegardé (blocs d&apos;avant conversion)
                                            dans <code>course_content_backups</code> avant écriture. L&apos;opération
                                            est idempotente : la relancer sur une base déjà convertie ne change rien.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="border-bridge-500/45">Annuler</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => void runRepair('apply')}
                                            variant="destructive"
                                        >
                                            Convertir
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </section>

                    <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                    <section className="flex flex-col gap-3">
                        <Eyebrow>Résultat</Eyebrow>

                        {apiError && (
                            <Alert variant="destructive">
                                <AlertTriangle aria-hidden="true"/>
                                <AlertTitle>Opération interrompue</AlertTitle>
                                <AlertDescription>{apiError}</AlertDescription>
                            </Alert>
                        )}

                        {!apiError && !result && (
                            <p className="text-sm text-brand-dark/70 dark:text-bridge-200/70">
                                Lancez une analyse pour afficher le bilan ici.
                            </p>
                        )}

                        {result && (
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap items-center gap-2" aria-live="polite">
                                    <Badge variant={summaryTone(result)}>
                                        {result.error === 0 ? <CheckCircle2 aria-hidden="true"/> : <AlertTriangle aria-hidden="true"/>}
                                        {result.mode === 'dry-run' ? 'Analyse' : 'Conversion'}
                                    </Badge>
                                    <Badge variant="outline">{result.clean} déjà bon{result.clean !== 1 ? 's' : ''}</Badge>
                                    {result.convertible > 0 && (
                                        <Badge variant="outline">
                                            {result.convertible} {result.mode === 'dry-run' ? 'à convertir' : 'converti(s)'}
                                        </Badge>
                                    )}
                                    {result.warning > 0 && <Badge variant="outline">{result.warning} avert.</Badge>}
                                    {result.error > 0 && <Badge variant="destructive">{result.error} erreur{result.error !== 1 ? 's' : ''}</Badge>}
                                    <span className="text-xs text-bridge-600 dark:text-bridge-300">
                                        {result.total} présentation{result.total !== 1 ? 's' : ''} au total
                                    </span>
                                </div>

                                {result.results.length > 0 ? (
                                    <ul className="max-h-[45dvh] overflow-y-auto rounded-md border border-bridge-500/25">
                                        {result.results.map((item) => (
                                            <li
                                                key={item.contentId}
                                                className="flex flex-col gap-1 border-b border-bridge-500/15 px-3 py-2 text-xs last:border-b-0 dark:border-bridge-500/20"
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant={item.status === 'error' ? 'destructive' : 'outline'}>
                                                        {statusLabel(item.status)}
                                                    </Badge>
                                                    <span className="font-mono text-brand-dark dark:text-bridge-100">{item.section}</span>
                                                    <span className="text-bridge-600 dark:text-bridge-300">
                                                        {item.blocksConverted} bloc{item.blocksConverted !== 1 ? 's' : ''} renommé{item.blocksConverted !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <p className="text-bridge-600 dark:text-bridge-300">
                                                    racine avant : {item.rootTypesBefore.join(', ')}
                                                </p>
                                                {item.error && <p className="text-destructive">{item.error}</p>}
                                                {item.remainingUnrenderable.length > 0 && (
                                                    <p className="text-bridge-600 dark:text-bridge-300">
                                                        types non rendus restants : {item.remainingUnrenderable.join(', ')}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-brand-dark/70 dark:text-bridge-200/70">
                                        Aucune présentation à convertir.
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
