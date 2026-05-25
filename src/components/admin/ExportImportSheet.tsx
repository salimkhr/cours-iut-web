'use client';

import { useState, useRef } from 'react';
import { ArrowUpDown, Download, Upload } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Eyebrow from '@/components/admin/ui/Eyebrow';

interface ExportImportSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ExportImportSheet({ open, onOpenChange }: ExportImportSheetProps) {
    const [exportLoading, setExportLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [preview, setPreview] = useState<{ modules: number; sections: number } | null>(null);
    const [importResult, setImportResult] = useState<{ inserted: number; updated: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fileData, setFileData] = useState<unknown[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleExport() {
        setExportLoading(true);
        setError(null);
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
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erreur export');
        } finally {
            setExportLoading(false);
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        setPreview(null);
        setImportResult(null);
        setError(null);
        setFileData(null);
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target?.result as string);
                if (!Array.isArray(json)) throw new Error('Le fichier doit contenir un tableau JSON');
                const totalSections = (json as { sections?: unknown[] }[])
                    .reduce((sum, m) => sum + (m.sections?.length ?? 0), 0);
                setPreview({ modules: json.length, sections: totalSections });
                setFileData(json);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Fichier invalide');
            }
        };
        reader.readAsText(file);
    }

    async function handleImport() {
        if (!fileData) return;
        setImportLoading(true);
        setError(null);
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
            setImportResult(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erreur import');
        } finally {
            setImportLoading(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn(
                    'p-0 gap-0 overflow-hidden flex flex-col sm:max-w-[440px]',
                    'bg-[#f7ebd9] dark:bg-[#13110d]',
                    'border-l border-bridge-500/45',
                    '[&>button]:text-white/80 [&>button:hover]:text-white',
                )}
            >
                {/* Header */}
                <div className="relative flex items-center gap-4 px-6 py-5 pr-14 overflow-hidden shrink-0 bg-brand-primary">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    />
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 shrink-0">
                        <ArrowUpDown className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/60">Admin</p>
                        <SheetTitle className="text-white font-bold text-xl leading-tight p-0 m-0">
                            Exporter / Importer
                        </SheetTitle>
                        <SheetDescription className="text-white/70 text-sm mt-0.5">
                            Transférez vos modules entre environnements
                        </SheetDescription>
                    </div>
                </div>

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
                            <Download className="w-4 h-4" />
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
                            <Upload className="w-4 h-4" />
                            Choisir un fichier…
                        </Button>

                        {preview && (
                            <p className="text-sm text-bridge-600 dark:text-bridge-300">
                                {preview.modules} module{preview.modules > 1 ? 's' : ''},{' '}
                                {preview.sections} section{preview.sections > 1 ? 's' : ''} détectés
                            </p>
                        )}

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        {importResult && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Import terminé : {importResult.inserted} créé{importResult.inserted > 1 ? 's' : ''},
                                {' '}{importResult.updated} mis à jour
                            </p>
                        )}

                        <Button
                            className="self-start gap-2 bg-brand-primary text-white hover:opacity-90"
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
