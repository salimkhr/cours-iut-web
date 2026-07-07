'use client';

import { useState } from 'react';
import { Database, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type MigrateResult = { ok: number; warn: number; error: number; total: number };

export default function MigrateButton() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<MigrateResult | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    async function handleMigrate() {
        setLoading(true);
        setResult(null);
        setApiError(null);
        try {
            const res = await fetch('/api/admin/migrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            const data = await res.json() as MigrateResult & { error?: string };
            if (!res.ok) throw new Error(data.error ?? 'Erreur serveur');
            setResult(data);
        } catch (e) {
            setApiError(e instanceof Error ? e.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-3">
            <Button
                variant="outline"
                size="sm"
                className="gap-2 border-bridge-500/45"
                onClick={() => { setResult(null); setApiError(null); setOpen(true); }}
                disabled={loading}
            >
                {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Database className="w-4 h-4" />
                }
                Migrer fichiers → DB
            </Button>

            {result && (
                <span className={`text-xs ${result.error > 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                    {result.ok} ok · {result.warn} avert. · {result.error} erreur{result.error !== 1 ? 's' : ''}
                    {' '}/ {result.total}
                </span>
            )}
            {apiError && (
                <span className="text-xs text-red-500">{apiError}</span>
            )}

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Migrer les fichiers vers MongoDB ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Parse tous les <code className="text-xs bg-bridge-100 dark:bg-bridge-800 px-1 rounded">Cours.tsx</code>,{' '}
                            <code className="text-xs bg-bridge-100 dark:bg-bridge-800 px-1 rounded">TP.tsx</code>,{' '}
                            <code className="text-xs bg-bridge-100 dark:bg-bridge-800 px-1 rounded">Slide.tsx</code> et{' '}
                            <code className="text-xs bg-bridge-100 dark:bg-bridge-800 px-1 rounded">Examen.tsx</code>{' '}
                            et écrase leur contenu dans la collection{' '}
                            <code className="text-xs bg-bridge-100 dark:bg-bridge-800 px-1 rounded">course_content</code>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMigrate}>
                            Lancer la migration
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
