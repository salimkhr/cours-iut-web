"use client";

import {useState} from "react";
import {Pencil, Plus, X} from "lucide-react";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import {Button} from "@/components/ui/button";
import AdminDataTable, {type AdminColumn} from "@/components/admin/ui/AdminDataTable";
import {
    SectionContentLinks,
    SectionDeleteDialog,
    SectionStateSwitches,
    useSectionRowState,
} from "@/components/admin/AdminSection";
import SectionProgressBadges from "@/components/admin/module-workflow/SectionProgressBadges";
import InlineSectionRow from "@/components/admin/module-workflow/InlineSectionRow";
import {sectionProgress} from "@/lib/pedagogy/moduleProgress";
import {moduleColor} from "@/lib/moduleColor";

interface SectionsStepProps {
    module: Module;
    onSaved: (patch: Partial<Module>) => void;
}

/** Empreinte des champs affichés par `SectionStateSwitches`, utilisée comme `key` pour forcer
 *  un remount de `SectionStateCell` quand une édition en ligne les modifie. */
function sectionStateFingerprint(section: Section): string {
    return [
        section.path,
        section.isAvailable,
        section.correctionIsAvailable,
        section.examenIsLock,
        section.hasCorrection,
    ].join(":");
}

/** Cellule "États" : switches Publiée/Correction/Verrou examen, état géré localement à la ligne
 *  (un toggle ne change ni l'ordre ni la longueur de `module.sections`, donc n'a pas besoin de
 *  remonter jusqu'à `onSaved`). */
function SectionStateCell({section, module}: {section: Section; module: Module}) {
    const {currentSection, pendingKey, handleToggle} = useSectionRowState(section, module);
    return <SectionStateSwitches section={currentSection} pendingKey={pendingKey} onToggle={handleToggle}/>;
}

/** Cellule "Actions" : bascule d'édition en ligne (jamais de modale) + suppression. Instance de
 *  `useSectionRowState` indépendante de `SectionStateCell` — la suppression n'a pas besoin de
 *  connaître l'état des switches, et inversement. */
function SectionActionsCell({
    section,
    module,
    isEditing,
    onToggleEdit,
    onDeleted,
}: {
    section: Section;
    module: Module;
    isEditing: boolean;
    onToggleEdit: () => void;
    onDeleted: (sectionPath: string) => void;
}) {
    const {currentSection, deleting, handleDelete} = useSectionRowState(section, module, onDeleted);
    const color = moduleColor(module);

    return (
        <div className="flex shrink-0 items-center gap-1">
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 border-bridge-500/45"
                style={isEditing ? {backgroundColor: color, borderColor: color, color: "white"} : undefined}
                aria-label={isEditing ? `Fermer l'édition de la section ${currentSection.title}` : `Modifier la section ${currentSection.title}`}
                aria-pressed={isEditing}
                title={isEditing ? "Fermer l'édition" : "Modifier la section"}
                onClick={onToggleEdit}
            >
                {isEditing ? <X className="size-4" aria-hidden="true"/> : <Pencil className="size-4" aria-hidden="true"/>}
            </Button>
            <SectionDeleteDialog section={currentSection} modData={module} deleting={deleting} onConfirm={handleDelete}/>
        </div>
    );
}

export default function SectionsStep({module, onSaved}: SectionsStepProps) {
    const [sections, setSections] = useState<Section[]>(module.sections);
    const [editingPath, setEditingPath] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);

    const sortedSections = [...sections].sort((first, second) => first.order - second.order);

    const commitSections = (next: Section[]) => {
        setSections(next);
        onSaved({sections: next});
    };

    const handleRowDone = (previousPath: string | null, saved?: Section) => {
        if (saved) {
            const next = previousPath
                ? sections.map((s) => (s.path === previousPath ? saved : s))
                : [...sections, saved];
            commitSections(next);
        }
        setEditingPath(null);
        setAdding(false);
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
                    <div className="mt-1.5">
                        <SectionContentLinks section={section} modData={module}/>
                    </div>
                </div>
            ),
        },
        {
            id: "progress",
            header: "Avancement",
            cell: (section) => <SectionProgressBadges progress={sectionProgress(section)}/>,
        },
        {
            id: "state",
            header: "États",
            // `key` dérivée du contenu (pas juste du path) : force un remount — donc un état
            // local frais — quand une édition en ligne change isAvailable/hasCorrection/etc.,
            // au lieu de resynchroniser un état déjà monté via un effet (anti-pattern React).
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
                    isEditing={editingPath === section.path}
                    onToggleEdit={() => setEditingPath((prev) => (prev === section.path ? null : section.path))}
                    onDeleted={handleDeleted}
                />
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <AdminDataTable
                columns={columns}
                data={sortedSections}
                emptyMessage="Aucune section dans ce module."
                getRowKey={(section) => section.path}
                renderExpanded={(section) =>
                    editingPath === section.path ? (
                        <InlineSectionRow
                            module={module}
                            section={section}
                            onDone={(saved) => handleRowDone(section.path, saved)}
                        />
                    ) : null
                }
            />

            {adding ? (
                <InlineSectionRow
                    module={module}
                    section={null}
                    onDone={(saved) => handleRowDone(null, saved)}
                />
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 gap-2 self-start border-bridge-500/45"
                    onClick={() => setAdding(true)}
                >
                    <Plus className="size-4" aria-hidden="true"/>
                    Ajouter une section
                </Button>
            )}
        </div>
    );
}
