'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Eyebrow from '@/components/admin/ui/Eyebrow';
import { ADMIN_CARD } from '@/components/admin/ui/adminStyles';

interface Verdict {
    id: string;
    date: string;
    format: string;
    moduleSlug: string | null;
    verdict: string;
    status: 'active' | 'distilled';
}

interface Exemplar {
    id: string;
    date: string;
    format: string;
    moduleSlug: string;
    sectionSlug: string;
    level: string;
    annotations: string[];
}

type Data = { verdicts: Verdict[]; exemplars: Exemplar[] } | null;

async function fetchData(): Promise<Data> {
    const [v, e] = await Promise.all([
        fetch('/api/admin/calibrage/verdicts').then((r) => r.json()),
        fetch('/api/admin/calibrage/exemplars').then((r) => r.json()),
    ]);
    return { verdicts: v, exemplars: e };
}

export default function CalibrageList() {
    const [data, setData] = useState<Data>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        fetchData().then((d) => {
            if (!cancelled) setData(d);
        });
        return () => { cancelled = true; };
    }, [refreshKey]);

    const deleteItem = async (kind: 'verdicts' | 'exemplars', id: string) => {
        await fetch(`/api/admin/calibrage/${kind}?id=${id}`, { method: 'DELETE' });
        setRefreshKey((k) => k + 1);
    };

    const loading = data === null;
    const verdicts = data?.verdicts ?? [];
    const exemplars = data?.exemplars ?? [];

    if (loading) return <p className="text-sm text-bridge-500 dark:text-bridge-400">Chargement…</p>;

    return (
        <div className="flex flex-col gap-8">
            <section className="space-y-3">
                <div>
                    <Eyebrow>Critiques verbatim</Eyebrow>
                    <h2 className="mt-1 text-xl font-bold text-brand-dark dark:text-bridge-100">
                        Verdicts ({verdicts.length})
                    </h2>
                </div>
                {verdicts.length === 0 && (
                    <p className="text-sm text-bridge-500 dark:text-bridge-400">Aucun verdict enregistré.</p>
                )}
                <ul className="flex flex-col gap-3">
                    {verdicts.map((v) => (
                        <li key={v.id} className={`${ADMIN_CARD} flex items-start gap-3 p-4`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <Badge variant="secondary">{v.format}</Badge>
                                    {v.moduleSlug && (
                                        <span className="text-xs text-bridge-500 dark:text-bridge-400">{v.moduleSlug}</span>
                                    )}
                                    <span className="text-xs text-bridge-500 dark:text-bridge-400">{v.date.slice(0, 10)}</span>
                                    {v.status === 'distilled' && (
                                        <span className="text-xs italic text-bridge-400 dark:text-bridge-500">distillé</span>
                                    )}
                                </div>
                                <p className="text-sm text-brand-dark dark:text-bridge-100">{v.verdict}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 text-bridge-600 dark:text-bridge-300 hover:text-destructive hover:bg-destructive/10"
                                aria-label="Supprimer le verdict"
                                onClick={() => void deleteItem('verdicts', v.id)}
                            >
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="space-y-3">
                <div>
                    <Eyebrow>Étalons annotés</Eyebrow>
                    <h2 className="mt-1 text-xl font-bold text-brand-dark dark:text-bridge-100">
                        Exemplaires ({exemplars.length})
                    </h2>
                </div>
                {exemplars.length === 0 && (
                    <p className="text-sm text-bridge-500 dark:text-bridge-400">Aucun exemplaire promu.</p>
                )}
                <ul className="flex flex-col gap-3">
                    {exemplars.map((e) => (
                        <li key={e.id} className={`${ADMIN_CARD} flex items-start gap-3 p-4`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <Badge variant="secondary">{e.format}</Badge>
                                    <span className="text-sm font-medium text-brand-dark dark:text-bridge-100">{e.moduleSlug}/{e.sectionSlug}</span>
                                    <Badge variant="outline">{e.level}</Badge>
                                    <span className="text-xs text-bridge-500 dark:text-bridge-400">{e.date.slice(0, 10)}</span>
                                </div>
                                <ul className="text-sm list-disc pl-5 text-brand-dark dark:text-bridge-100">
                                    {e.annotations.map((a, i) => <li key={i}>{a}</li>)}
                                </ul>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 text-bridge-600 dark:text-bridge-300 hover:text-destructive hover:bg-destructive/10"
                                aria-label="Supprimer l&apos;exemplaire"
                                onClick={() => void deleteItem('exemplars', e.id)}
                            >
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
