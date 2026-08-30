"use client";

import {useState} from "react";
import {Eye, EyeOff, Pencil, Plus} from "lucide-react";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import {getContentTypes} from "@/types/CourseContent";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import AdminDataTable, {type AdminColumn} from "@/components/admin/ui/AdminDataTable";
import {
    hasSectionBrief,
    SectionBriefPreview,
    SectionContentLinks,
    SectionDeleteDialog,
    SectionStateSwitches,
    useSectionRowState,
} from "@/components/admin/AdminSection";
import InlineSectionRow from "@/components/admin/module-workflow/InlineSectionRow";
import {moduleColor} from "@/lib/moduleColor";

interface SectionsStepProps {
    module: Module;
    onSaved: (patch: Partial<Module>) => void;
}

/** Empreinte des champs affichés par `SectionStateSwitches`, utilisée comme `key` pour forcer
 *  un remount de `SectionStateCell` quand une édition modifie ces champs. Inclut les types de
 *  `contents` : `SectionStateSwitches` dérive `hasExamen` de `section.contents` (présence du
 *  type "examen") pour décider d'afficher ou non le switch "Verrou examen" — un ajout/retrait de
 *  "examen" dans les types de contenu doit donc, lui aussi, déclencher le remount. */
function sectionStateFingerprint(section: Section): string {
    return [
        section.path,
        section.isAvailable,
        section.correctionIsAvailable,
        section.examenIsLock,
        section.hasCorrection,
        getContentTypes(section.contents).join(","),
    ].join(":");
}

/** Cellule "États" : switches Publiée/Correction/Verrou examen, état géré localement à la ligne
 *  (un toggle ne change ni l'ordre ni la longueur de `module.sections`, donc n'a pas besoin de
 *  remonter jusqu'à `onSaved`). */
function SectionStateCell({section, module}: {section: Section; module: Module}) {
    const {currentSection, pendingKey, handleToggle} = useSectionRowState(section, module);
    return <SectionStateSwitches section={currentSection} pendingKey={pendingKey} onToggle={handleToggle}/>;
}

/** Cellule "Actions" : ouverture de la modale d'édition + suppression. Instance de
 *  `useSectionRowState` indépendante de `SectionStateCell` — la suppression n'a pas besoin de
 *  connaître l'état des switches, et inversement. */
function SectionActionsCell({
    section,
    module,
    onEdit,
    onDeleted,
}: {
    section: Section;
    module: Module;
    onEdit: () => void;
    onDeleted: (sectionPath: string) => void;
}) {
    const {currentSection, deleting, handleDelete} = useSectionRowState(section, module, onDeleted);

    return (
        <div className="flex shrink-0 items-center gap-1">
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 border-bridge-500/45"
                aria-label={`Modifier la section ${currentSection.title}`}
                title="Modifier la section"
                onClick={onEdit}
            >
                <Pencil className="size-4" aria-hidden="true"/>
            </Button>
            <SectionDeleteDialog section={currentSection} modData={module} deleting={deleting} onConfirm={handleDelete}/>
        </div>
    );
}

export default function SectionsStep({module, onSaved}: SectionsStepProps) {
    const [sections, setSections] = useState<Section[]>(module.sections);
    const [editingPath, setEditingPath] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    // Briefs repliés par défaut : trois lignes de texte par section noient le tableau quand on
    // vient y piloter les contenus. On les déplie d'un coup quand on vient les lire.
    const [showBriefs, setShowBriefs] = useState(false);

    const sortedSections = [...sections].sort((first, second) => first.order - second.order);
    const editingSection = editingPath ? sortedSections.find((s) => s.path === editingPath) ?? null : null;
    const dialogOpen = adding || editingSection !== null;

    const commitSections = (next: Section[]) => {
        setSections(next);
        onSaved({sections: next});
    };

    const closeDialog = () => {
        setEditingPath(null);
        setAdding(false);
    };

    const handleRowDone = (saved?: Section) => {
        if (saved) {
            const next = editingPath
                ? sections.map((s) => (s.path === editingPath ? saved : s))
                : [...sections, saved];
            commitSections(next);
        }
        closeDialog();
    };

    const handleDeleted = (sectionPath: string) => {
        commitSections(sections.filter((s) => s.path !== sectionPath));
        setEditingPath((prev) => (prev === sectionPath ? null : prev));
    };

    const columns: AdminColumn<Section>[] = [
        {
            id: "order",
            header: "#",
            cell: (section) => (
                <span
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold text-white"
                    style={{backgroundColor: moduleColor(module)}}
                >
                    {section.order.toString().padStart(2, "0")}
                </span>
            ),
        },
        {
            id: "title",
            header: "Section",
            cell: (section) => (
                <div className="min-w-56">
                    <p className="text-sm font-semibold leading-tight text-brand-dark dark:text-bridge-100">
                        {section.title}
                    </p>
                    <SectionContentLinks section={section} modData={module}/>
                </div>
            ),
        },
        {
            id: "state",
            header: "États",
            // `key` dérivée du contenu (pas juste du path) : force un remount — donc un état
            // local frais — quand une édition change isAvailable/hasCorrection/etc., au lieu de
            // resynchroniser un état déjà monté via un effet (anti-pattern React).
            cell: (section) => (
                <SectionStateCell key={sectionStateFingerprint(section)} section={section} module={module}/>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: (section) => (
                <SectionActionsCell
                    key={`${section.path}:${section.title}`}
                    section={section}
                    module={module}
                    onEdit={() => setEditingPath(section.path)}
                    onDeleted={handleDeleted}
                />
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            {sortedSections.some(hasSectionBrief) && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-11 gap-2 self-end text-brand-dark dark:text-bridge-200"
                    onClick={() => setShowBriefs((previous) => !previous)}
                    aria-pressed={showBriefs}
                >
                    {showBriefs
                        ? <EyeOff className="size-4" aria-hidden="true"/>
                        : <Eye className="size-4" aria-hidden="true"/>}
                    {showBriefs ? "Masquer les briefs" : "Afficher les briefs"}
                </Button>
            )}

            <AdminDataTable
                columns={columns}
                data={sortedSections}
                emptyMessage="Aucune section dans ce module."
                getRowKey={(section) => section.path}
                renderSubRow={
                    showBriefs
                        ? (section) => (hasSectionBrief(section) ? <SectionBriefPreview section={section}/> : null)
                        : undefined
                }
                card={false}
            />

            <Button
                type="button"
                variant="outline"
                className="min-h-11 gap-2 self-start border-bridge-500/45"
                onClick={() => setAdding(true)}
            >
                <Plus className="size-4" aria-hidden="true"/>
                Ajouter une section
            </Button>

            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg md:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSection ? `Modifier « ${editingSection.title} »` : "Nouvelle section"}
                        </DialogTitle>
                    </DialogHeader>
                    {dialogOpen && (
                        <InlineSectionRow
                            module={module}
                            section={editingSection}
                            onDone={handleRowDone}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
