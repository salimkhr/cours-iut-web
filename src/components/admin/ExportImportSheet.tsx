'use client';

import { useReducer, useRef, useEffect } from 'react';
import { ArrowUpDown, Download, Rocket, Upload } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import AdminSheetHeader from '@/components/admin/AdminSheetHeader';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import Eyebrow from '@/components/admin/ui/Eyebrow';
import type { ModuleOption } from '@/components/admin/AdminToolsPanel';

interface ExportImportSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    modules: ModuleOption[];
}

interface FilePreview {
    modules: number;
    sections: number;
    contents: number;
}

interface PushResult {
    inserted: number;
    updated: number;
    contentsUpserted: number;
}

interface SheetState {
    exportLoading: boolean;
    importLoading: boolean;
    preview: FilePreview | null;
    importResult: PushResult | null;
    error: string | null;
    fileData: unknown | null;
    pushTarget: string;
    pushLoading: boolean;
    pushError: string | null;
    pushResult: PushResult | null;
}

type SheetAction =
    | { type: 'reset' }
    | { type: 'export_start' }
    | { type: 'export_end' }
    | { type: 'export_error'; error: string }
    | { type: 'file_clear' }
    | { type: 'file_ready'; preview: FilePreview; fileData: unknown }
    | { type: 'file_error'; error: string }
    | { type: 'import_start' }
    | { type: 'import_done'; result: PushResult }
    | { type: 'import_error'; error: string }
    | { type: 'push_target'; target: string }
    | { type: 'push_start' }
    | { type: 'push_done'; result: PushResult }
    | { type: 'push_error'; error: string };

const ALL_MODULES = '__all__';

const initial: SheetState = {
    exportLoading: false,
    importLoading: false,
    preview: null,
    importResult: null,
    error: null,
    fileData: null,
    pushTarget: ALL_MODULES,
    pushLoading: false,
    pushError: null,
    pushResult: null,
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
        case 'push_target':
            return { ...state, pushTarget: action.target };
        case 'push_start':
            return { ...state, pushLoading: true, pushError: null, pushResult: null };
        case 'push_done':
            return { ...state, pushLoading: false, pushResult: action.result };
        case 'push_error':
            return { ...state, pushLoading: false, pushError: action.error };
        default:
            return state;
    }
}

/** Extrait un aperçu (modules/sections/contenus) d'un fichier v1 (tableau) ou v2 ({ modules, contents }). */
function parseFilePreview(json: unknown): FilePreview {
    let moduleList: { sections?: unknown[] }[];
    let contents = 0;

    if (Array.isArray(json)) {
        moduleList = json as { sections?: unknown[] }[];
    } else if (json && typeof json === 'object' && Array.isArray((json as { modules?: unknown }).modules)) {
        moduleList = (json as { modules: { sections?: unknown[] }[] }).modules;
        const c = (json as { contents?: unknown }).contents;
        contents = Array.isArray(c) ? c.length : 0;
    } else {
        throw new Error('Le fichier doit être un export v1 (tableau) ou v2 ({ modules, contents })');
    }

    const sections = moduleList.reduce((sum, m) => sum + (m.sections?.length ?? 0), 0);
    return { modules: moduleList.length, sections, contents };
}

export default function ExportImportSheet({ open, onOpenChange, modules }: ExportImportSheetProps) {
    const [state, dispatch] = useReducer(reducer, initial);
    const {
        exportLoading, importLoading, preview, importResult, error, fileData,
        pushTarget, pushLoading, pushError, pushResult,
    } = state;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const readerRef = useRef<FileReader | null>(null);

    useEffect(() => {
        if (!open) return;
        dispatch({ type: 'reset' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [open]);

    async function handlePushToProd() {
        dispatch({ type: 'push_start' });
        try {
            const res = await fetch('/api/admin/push-to-prod', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pushTarget === ALL_MODULES ? {} : { modulePath: pushTarget }),
            });
            const body = await res.json() as { inserted?: number; updated?: number; contentsUpserted?: number; error?: string };
            if (!res.ok) throw new Error(body.error ?? 'Push échoué');
            dispatch({
                type: 'push_done',
                result: {
                    inserted: body.inserted ?? 0,
                    updated: body.updated ?? 0,
                    contentsUpserted: body.contentsUpserted ?? 0,
                },
            });
        } catch (e) {
            dispatch({ type: 'push_error', error: e instanceof Error ? e.message : 'Erreur pendant le push' });
        }
    }

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
                dispatch({ type: 'file_ready', preview: parseFilePreview(json), fileData: json });
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
            const result = await res.json() as { inserted: number; updated: number; contentsUpserted?: number };
            dispatch({ type: 'import_done', result: { ...result, contentsUpserted: result.contentsUpserted ?? 0 } });
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

                    {/* Push vers la prod */}
                    <section className="flex flex-col gap-3">
                        <Eyebrow>Publier vers la prod</Eyebrow>
                        <p className="text-sm text-brand-dark/70 dark:text-bridge-200/70">
                            Pousse la structure et le contenu des cours directement vers la production.
                            L&apos;état de publication de la prod (visibilité, sections publiées, verrous)
                            est préservé ; les nouveautés arrivent masquées.
                        </p>
                        <Select value={pushTarget} onValueChange={(target) => dispatch({ type: 'push_target', target })}>
                            <SelectTrigger className="min-h-11 w-full border-bridge-500/45" aria-label="Module à publier">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_MODULES}>Tous les modules</SelectItem>
                                {modules.map((mod) => (
                                    <SelectItem key={mod.path} value={mod.path}>{mod.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {pushError && <p className="text-sm text-red-500" role="alert">{pushError}</p>}

                        {pushResult && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Publié : {pushResult.inserted} module{pushResult.inserted > 1 ? 's' : ''} créé{pushResult.inserted > 1 ? 's' : ''},
                                {' '}{pushResult.updated} mis à jour, {pushResult.contentsUpserted} contenu{pushResult.contentsUpserted > 1 ? 's' : ''} synchronisé{pushResult.contentsUpserted > 1 ? 's' : ''}
                            </p>
                        )}

                        <Button
                            className="self-start gap-2 bg-brand-primary text-white dark:text-brand-dark hover:opacity-90"
                            onClick={handlePushToProd}
                            disabled={pushLoading}
                        >
                            <Rocket className="w-4 h-4" aria-hidden="true"/>
                            {pushLoading ? 'Publication en cours…' : 'Publier vers la prod'}
                        </Button>
                    </section>

                    <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                    {/* Export */}
                    <section className="flex flex-col gap-3">
                        <Eyebrow>Export</Eyebrow>
                        <p className="text-sm text-brand-dark/70 dark:text-bridge-200/70">
                            Télécharge tous les modules, leurs sections et le contenu des cours au format JSON.
                        </p>
                        <Button
                            variant="outline"
                            className="self-start gap-2 border-bridge-500/45"
                            onClick={handleExport}
                            disabled={exportLoading}
                        >
                            <Download className="w-4 h-4" aria-hidden="true"/>
                            {exportLoading ? 'Export en cours…' : "Télécharger l'export JSON"}
                        </Button>
                    </section>

                    <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

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
                            <Upload className="w-4 h-4" aria-hidden="true"/>
                            Choisir un fichier…
                        </Button>

                        {preview && (
                            <p className="text-sm text-bridge-600 dark:text-bridge-300">
                                {preview.modules} module{preview.modules > 1 ? 's' : ''},{' '}
                                {preview.sections} section{preview.sections > 1 ? 's' : ''},{' '}
                                {preview.contents} contenu{preview.contents > 1 ? 's' : ''} détectés
                            </p>
                        )}

                        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}

                        {importResult && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Import terminé : {importResult.inserted} créé{importResult.inserted > 1 ? 's' : ''},
                                {' '}{importResult.updated} mis à jour, {importResult.contentsUpserted} contenu{importResult.contentsUpserted > 1 ? 's' : ''}
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
