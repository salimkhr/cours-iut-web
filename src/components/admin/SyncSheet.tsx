'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {AlertCircle, CheckCircle2, ChevronRight, Layers} from 'lucide-react';
import {Sheet, SheetContent} from '@/components/ui/sheet';
import AdminSheetHeader from '@/components/admin/AdminSheetHeader';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import AddModuleButton from '@/components/admin/AddModuleButton';
import SectionForm, {Section} from '@/components/admin/SectionForm';
import useAdminApi from '@/hook/admin/useAdminApi';
import Module from '@/types/Module';
import type {ModuleFormValues} from '@/lib/schemas/module.schema';
import type {MissingSectionItem} from '@/app/api/admin/sync/route';

interface SyncSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    missingModules: {slug: string}[];
    missingSections: MissingSectionItem[];
    onCreated: () => void;
}

export default function SyncSheet({
    open,
    onOpenChange,
    missingModules,
    missingSections,
    onCreated,
}: SyncSheetProps) {
    const router = useRouter();
    const {addModule, addSection} = useAdminApi();

    const [addModuleOpen, setAddModuleOpen] = useState(false);
    const [selectedModuleSlug, setSelectedModuleSlug] = useState<string | null>(null);

    const [addSectionOpen, setAddSectionOpen] = useState(false);
    const [selectedSectionItem, setSelectedSectionItem] = useState<MissingSectionItem | null>(null);

    const totalMissing = missingModules.length + missingSections.length;

    // Regroupe les sections manquantes par module slug
    const sectionsByModule = missingSections.reduce<Record<string, MissingSectionItem[]>>((acc, item) => {
        const key = item.module.path;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    // Tous les modules concernés (ceux qui manquent + ceux qui ont des sections manquantes)
    const allModuleSlugs = [
        ...missingModules.map(m => m.slug),
        ...Object.keys(sectionsByModule),
    ];
    const uniqueModuleSlugs = [...new Set(allModuleSlugs)];

    function openAddModule(slug: string) {
        setSelectedModuleSlug(slug);
        onOpenChange(false);
        setAddModuleOpen(true);
    }

    function openAddSection(item: MissingSectionItem) {
        setSelectedSectionItem(item);
        onOpenChange(false);
        setAddSectionOpen(true);
    }

    async function handleModuleCreated(data: ModuleFormValues) {
        await addModule({...data, sections: []});
        onCreated();
        router.refresh();
    }

    async function handleSectionCreated(section: Section) {
        if (!selectedSectionItem) return;
        await addSection(selectedSectionItem.module._id as string, section);
        onCreated();
        router.refresh();
    }

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    side="right"
                    className={cn(
                        'p-0 gap-0 overflow-hidden flex flex-col sm:max-w-[480px]',
                        'bg-[#f7ebd9] dark:bg-[#13110d]',
                        'border-l border-bridge-500/45',
                        '[&>button]:text-white/80 [&>button:hover]:text-white dark:[&>button]:text-brand-dark/80 dark:[&>button:hover]:text-brand-dark',
                    )}
                >
                    {/* Header */}
                    <AdminSheetHeader
                        icon={Layers}
                        eyebrow="Synchronisation"
                        title="Cours non synchronisés"
                        description={totalMissing > 0
                            ? `${totalMissing} élément${totalMissing > 1 ? 's' : ''} à créer dans MongoDB`
                            : 'Tout est synchronisé'}
                        className="bg-brand-primary"
                    />

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        {totalMissing === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                <CheckCircle2 className="w-10 h-10 text-green-500"/>
                                <p className="text-sm text-bridge-600 dark:text-bridge-400">
                                    Tous les cours sont synchronisés avec MongoDB.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {uniqueModuleSlugs.map(slug => {
                                    const isModuleMissing = missingModules.some(m => m.slug === slug);
                                    const sections = sectionsByModule[slug] ?? [];

                                    return (
                                        <div key={slug}>
                                            {/* Module header */}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs uppercase tracking-widest font-semibold text-bridge-500 dark:text-bridge-400">
                                                    {slug}
                                                </span>
                                            </div>

                                            <div className="space-y-1.5">
                                                {isModuleMissing && (
                                                    <div className="flex items-center justify-between rounded-lg border border-orange-300/50 bg-orange-50/60 dark:bg-orange-950/20 px-3 py-2.5 gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <AlertCircle className="w-4 h-4 text-orange-500 shrink-0"/>
                                                            <span className="text-sm font-medium text-brand-dark dark:text-bridge-100 truncate">
                                                                Module absent de MongoDB
                                                            </span>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="shrink-0 text-brand-accent-dark hover:text-brand-accent-dark hover:bg-brand-accent-dark/10 gap-1 px-2"
                                                            onClick={() => openAddModule(slug)}
                                                        >
                                                            Créer
                                                            <ChevronRight className="w-3.5 h-3.5"/>
                                                        </Button>
                                                    </div>
                                                )}

                                                {sections.map(item => (
                                                    <div
                                                        key={item.sectionSlug}
                                                        className="flex items-center justify-between rounded-lg border border-bridge-300/50 dark:border-bridge-700/50 bg-bridge-50/60 dark:bg-bridge-900/20 px-3 py-2.5 gap-2"
                                                    >
                                                        <span className="text-sm text-brand-dark dark:text-bridge-100 truncate">
                                                            {item.sectionSlug}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="shrink-0 text-brand-accent-dark hover:text-brand-accent-dark hover:bg-brand-accent-dark/10 gap-1 px-2"
                                                            onClick={() => openAddSection(item)}
                                                        >
                                                            Créer
                                                            <ChevronRight className="w-3.5 h-3.5"/>
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Sheet création module */}
            <AddModuleButton
                key={selectedModuleSlug ?? 'none'}
                onAdd={handleModuleCreated}
                open={addModuleOpen}
                onOpenChange={setAddModuleOpen}
                defaultPath={selectedModuleSlug ?? undefined}
            />

            {/* Sheet création section */}
            {selectedSectionItem && (
                <SectionForm
                    modData={selectedSectionItem.module as Module}
                    mode="add"
                    open={addSectionOpen}
                    onOpenChange={setAddSectionOpen}
                    onSubmit={handleSectionCreated}
                    prefill={selectedSectionItem.prefill}
                />
            )}
        </>
    );
}
