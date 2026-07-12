'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Plus, RefreshCw, Wrench, ArrowUpDown} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddModuleButton from '@/components/admin/AddModuleButton';
import SyncSheet from '@/components/admin/SyncSheet';
import ExportImportSheet from '@/components/admin/ExportImportSheet';
import useAdminApi from '@/hook/admin/useAdminApi';
import type {ModuleFormValues} from '@/lib/schemas/module.schema';
import type {SyncResponse} from '@/app/api/admin/sync/route';

export default function AdminHomeFab() {
    const [addModuleOpen, setAddModuleOpen] = useState(false);
    const [syncSheetOpen, setSyncSheetOpen] = useState(false);
    const [syncData, setSyncData] = useState<SyncResponse>({missingModules: [], missingSections: []});
    const [exportImportOpen, setExportImportOpen] = useState(false);
    const router = useRouter();
    const {addModule} = useAdminApi();

    const totalMissing = syncData.missingModules.length + syncData.missingSections.length;

    async function fetchSync() {
        try {
            const res = await fetch('/api/admin/sync');
            if (res.ok) {
                const data: SyncResponse = await res.json();
                setSyncData(data);
            }
        } catch {
            // silencieux — le badge reste à 0 en cas d'erreur réseau
        }
    }

    useEffect(() => {
        let cancelled = false;
        fetch('/api/admin/sync')
            .then((res) => res.ok ? res.json() : null)
            .then((data: SyncResponse | null) => {
                if (!cancelled && data) setSyncData(data);
            })
            .catch(() => {
                // silencieux — le badge reste à 0 en cas d'erreur réseau
            });
        return () => { cancelled = true; };
    }, []);

    const handleAdd = async (data: ModuleFormValues) => {
        await addModule({...data, sections: []});
        router.refresh();
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        aria-label="Actions admin"
                        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg bg-brand-primary text-white dark:text-brand-dark hover:bg-brand-accent-dark dark:hover:bg-brand-primary/80"
                    >
                        <Wrench className="w-5 h-5"/>
                        {totalMissing > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                                {totalMissing > 9 ? '9+' : totalMissing}
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side="top"
                    align="end"
                    className="mb-2 min-w-[200px] bg-[#f7ebd9] dark:bg-[#13110d] border-bridge-500/45 shadow-[0_8px_24px_-4px_rgba(147,97,58,0.3)]"
                >
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => setAddModuleOpen(true)}
                    >
                        <Plus className="w-4 h-4"/>
                        Créer un module
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => setSyncSheetOpen(true)}
                    >
                        <RefreshCw className="w-4 h-4"/>
                        Synchroniser les cours
                        {totalMissing > 0 && (
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                {totalMissing}
                            </span>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => setExportImportOpen(true)}
                    >
                        <ArrowUpDown className="w-4 h-4"/>
                        Exporter / Importer
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AddModuleButton
                onAdd={handleAdd}
                open={addModuleOpen}
                onOpenChange={setAddModuleOpen}
            />

            <SyncSheet
                open={syncSheetOpen}
                onOpenChange={setSyncSheetOpen}
                missingModules={syncData.missingModules}
                missingSections={syncData.missingSections}
                onCreated={fetchSync}
            />

            <ExportImportSheet
                open={exportImportOpen}
                onOpenChange={setExportImportOpen}
            />
        </>
    );
}
