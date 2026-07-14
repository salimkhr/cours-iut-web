'use client';

import { useReducer, useRef, useEffect } from 'react';
import { ArrowUpDown, Download, Upload } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import AdminSheetHeader from '@/components/admin/AdminSheetHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Eyebrow from '@/components/admin/ui/Eyebrow';

interface ExportImportSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface SheetState {
    exportLoading: boolean;
    importLoading: boolean;
    preview: { modules: number; sections: number } | null;
    importResult: { inserted: number; updated: number } | null;
    error: string | null;
    fileData: unknown[] | null;
}

type SheetAction =
    | { type: 'reset' }
    | { type: 'export_start' }
    | { type: 'export_end' }
    | { type: 'export_error'; error: string }
    | { type: 'file_clear' }
    | { type: 'file_ready'; preview: { modules: number; sections: number }; fileData: unknown[] }
    | { type: 'file_error'; error: string }
    | { type: 'import_start' }
    | { type: 'import_done'; result: { inserted: number; updated: number } }
    | { type: 'import_error'; error: string };

const initial: SheetState = {
    exportLoading: false,
    importLoading: false,
    preview: null,
    importResult: null,
    error: null,
    fileData: null,
};

function reducer(state: SheetState, action: SheetAction): SheetState {
    switch (action.type) {
        case 'reset':
            return initial;
        case 'export_start':
            return { ...state, exportLoading: true, error: null };
        case 'export_end':
            return { ...state, exportLoading: false };
        case 'export_error':
            return { ...state, exportLoading: false, error: action.error };
        case 'file_clear':
            return { ...state, preview: null, importResult: null, error: null, fileData: null };
        case 'file_ready':
            return { ...state, preview: action.preview, fileData: action.fileData, error: null, importResult: null };
        case 'file_error':
            return { ...state, error: action.error, preview: null, fileData: null };
        case 'import_start':
            return { ...state, importLoading: true, error: null };
        case 'import_done':
            return { ...state, importLoading: false, importResult: action.result, fileData: null, preview: null };
        case 'import_error':
            return { ...state, importLoading: false, error: action.error };
        default:
            return state;
    }
}

export default function ExportImportSheet({ open, onOpenChange }: ExportImportSheetProps) {
    const [state, dispatch] = useReducer(reducer, initial);
    const { exportLoading, importLoading, preview, importResult, error, fileData } = state;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const readerRef = useRef<FileReader | null>(null);

    useEffect(() => {
        if (!open) return;
        dispatch({ type: 'reset' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [open]);

    async function handleExport() {
        dispatch({ type: 'export_start' });
        try {
            const res = await fetch('/api/admin/export');
            if (!res.ok) throw new Error('Export échoué');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'modules-export.json';
            a.click();
            URL.revokeObjectURL(url);
            dispatch({ type: 'export_end' });
        } catch (e) {
            dispatch({ type: 'export_error', error: e instanceof Error ? e.message : 'Erreur export' });
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        readerRef.current?.abort();
        const file = e.target.files?.[0];
        dispatch({ type: 'file_clear' });
        if (!file) return;

        const reader = new FileReader();
        readerRef.current = reader;
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target?.result as string);
                if (!Array.isArray(json)) throw new Error('Le fichier doit contenir un tableau JSON');
                const totalSections = (json as { sections?: unknown[] }[])
                    .reduce((sum, m) => sum + (m.sections?.length ?? 0), 0);
                dispatch({ type: 'file_ready', preview: { modules: json.length, sections: totalSections }, fileData: json });
            } catch (err) {
                dispatch({ type: 'file_error', error: err instanceof Error ? err.message : 'Fichier invalide' });
            }
        };
        reader.readAsText(file);
    }

    async function handleImport() {
        if (!fileData) return;
        dispatch({ type: 'import_start' });
        try {
            const res = await fetch('/api/admin/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fileData),
            });
            if (!res.ok) {
                const body = await res.json() as { error?: string };
                throw new Error(body.error ?? 'Import échoué');
            }
            const result = await res.json() as { inserted: number; updated: number };
            dispatch({ type: 'import_done', result });
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (e) {
            dispatch({ type: 'import_error', error: e instanceof Error ? e.message : 'Erreur import' });
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn(
                    'p-0 gap-0 overflow-hidden flex flex-col sm:max-w-[440px]',
                    'bg-card',
                    'border-l border-bridge-500/45',
                    '[&>button]:text-white/80 [&>button:hover]:text-white dark:[&>button]:text-brand-dark/80 dark:[&>button:hover]:text-brand-dark',
                )}
            >
                {/* Header */}
                <AdminSheetHeader
                    icon={ArrowUpDown}
                    eyebrow="Admin"
                    title="Exporter / Importer"
                    description="Transférez vos modules entre environnements"
                    className="bg-brand-primary"
                />

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

                    {/* Export */}
                    <section className="flex flex-col gap-3">
                        <Eyebrow>Export</Eyebrow>
                        <p className="text-sm text-brand-dark/70 dark:text-bridge-200/70">
                            Télécharge tous les modules et leurs sections au format JSON.
                        </p>
                        <Button
                            variant="outline"
                            className="self-start gap-2 border-bridge-500/45"
                            onClick={handleExport}
                            disabled={exportLoading}
                        >
                            <Download className="w-4 h-4" aria-hidden="true" />
                            {exportLoading ? 'Export en cours…' : "Télécharger l'export JSON"}
                        </Button>
                    </section>

                    <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6" />

                    {/* Import */}
                    <section className="flex flex-col gap-3">
                        <Eyebrow>Import</Eyebrow>
                        <p className="text-sm text-brand-dark/70 dark:text-bridge-200/70">
                            Importe un fichier JSON exporté depuis un autre environnement.
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <Button
                            variant="outline"
                            className="self-start gap-2 border-bridge-500/45"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-4 h-4" aria-hidden="true" />
                            Choisir un fichier…
                        </Button>

                        {preview && (
                            <p className="text-sm text-bridge-600 dark:text-bridge-300">
                                {preview.modules} module{preview.modules > 1 ? 's' : ''},{' '}
                                {preview.sections} section{preview.sections > 1 ? 's' : ''} détectés
                            </p>
                        )}

                        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}

                        {importResult && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Import terminé : {importResult.inserted} créé{importResult.inserted > 1 ? 's' : ''},
                                {' '}{importResult.updated} mis à jour
                            </p>
                        )}

                        <Button
                            className="self-start gap-2 bg-brand-primary text-white dark:text-brand-dark hover:opacity-90"
                            onClick={handleImport}
                            disabled={!fileData || importLoading}
                        >
                            {importLoading ? 'Import en cours…' : 'Importer'}
                        </Button>
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    );
}
