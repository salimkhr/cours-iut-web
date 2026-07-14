'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

    if (loading) return <p className="text-sm text-bridge-500">Chargement…</p>;

    return (
        <div className="flex flex-col gap-8">
            <section>
                <h2 className="text-lg font-semibold mb-3">Verdicts ({verdicts.length})</h2>
                {verdicts.length === 0 && (
                    <p className="text-sm text-bridge-500">Aucun verdict enregistré.</p>
                )}
                <ul className="flex flex-col gap-2">
                    {verdicts.map((v) => (
                        <li key={v.id} className="flex items-start gap-3 rounded-md border border-bridge-500/30 p-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <Badge variant="secondary">{v.format}</Badge>
                                    {v.moduleSlug && (
                                        <span className="text-xs text-bridge-500">{v.moduleSlug}</span>
                                    )}
                                    <span className="text-xs text-bridge-500">{v.date.slice(0, 10)}</span>
                                    {v.status === 'distilled' && (
                                        <span className="text-xs italic text-bridge-400">distillé</span>
                                    )}
                                </div>
                                <p className="text-sm">{v.verdict}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Supprimer le verdict"
                                onClick={() => void deleteItem('verdicts', v.id)}
                            >
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2 className="text-lg font-semibold mb-3">Exemplaires ({exemplars.length})</h2>
                {exemplars.length === 0 && (
                    <p className="text-sm text-bridge-500">Aucun exemplaire promu.</p>
                )}
                <ul className="flex flex-col gap-2">
                    {exemplars.map((e) => (
                        <li key={e.id} className="flex items-start gap-3 rounded-md border border-bridge-500/30 p-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <Badge variant="secondary">{e.format}</Badge>
                                    <span className="text-sm font-medium">{e.moduleSlug}/{e.sectionSlug}</span>
                                    <Badge variant="outline">{e.level}</Badge>
                                    <span className="text-xs text-bridge-500">{e.date.slice(0, 10)}</span>
                                </div>
                                <ul className="text-sm list-disc pl-5">
                                    {e.annotations.map((a, i) => <li key={i}>{a}</li>)}
                                </ul>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
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
