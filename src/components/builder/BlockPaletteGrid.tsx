"use client";

import { useState } from "react";
import {
    AlignLeft,
    Heading2,
    List,
    ImageIcon,
    Table2,
    Link2,
    Puzzle,
    Search,
    Code2,
    Eye,
    GitBranch,
    Download,
    Quote,
    Minus,
    Columns2,
    Megaphone,
    ChevronsDownUp,
} from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { getAllBlockDefinitions } from "@/lib/blockRegistry";
import type { BlockDefinition } from "@/lib/blockRegistry";
import { containerRules } from "@/lib/blockSchemas";

export const BLOCK_META: Record<string, {
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}> = {
    "text":            { icon: AlignLeft,  description: "Paragraphe avec mise en gras partielle" },
    "heading":         { icon: Heading2,   description: "Titre de section h2 ou h3" },
    "list":            { icon: List,       description: "Liste ordonnée ou à puces" },
    "image-card":      { icon: ImageIcon,  description: "Illustration avec titre et légende" },
    "table":           { icon: Table2,     description: "Tableau de données tabulaires" },
    "section-card":    { icon: Link2,      description: "Lien vers une autre section du cours" },
    "code":              { icon: Code2,     description: "Bloc de code avec coloration syntaxique" },
    "code-with-preview": { icon: Eye,       description: "Code HTML/CSS avec aperçu rendu" },
    "diagram":           { icon: GitBranch, description: "Diagramme Mermaid (flowchart, séquence…)" },
    "download-file":     { icon: Download,  description: "Fichier de démarrage à télécharger" },
    "quote":             { icon: Quote,        description: "Citation avec source optionnelle" },
    "divider":           { icon: Minus,        description: "Séparateur horizontal" },
    "list-item":         { icon: List,         description: "Élément d'une liste (créé par la liste parente)" },
    "columns":           { icon: Columns2,     description: "Mise en page en 2 à 4 colonnes" },
    "column":            { icon: Columns2,     description: "Colonne (créée par le bloc colonnes parent)" },
    "callout":           { icon: Megaphone,    description: "Encadré info, attention, astuce ou rappel" },
    "collapsible":       { icon: ChevronsDownUp, description: "Bloc dépliable (prérequis, aparté)" },
};

// Types réservés : créés par leur conteneur parent, jamais via la palette principale
const HIDDEN_TYPES = Object.entries(containerRules)
    .filter(([, rule]) => rule.allowedParents !== undefined && !rule.allowedParents.includes(null))
    .map(([type]) => type); // → ["column", "list-item"]

interface BlockPaletteGridProps {
    onSelect: (def: BlockDefinition) => void;
    /** compact : liste 1 colonne pour le panneau latéral étroit */
    compact?: boolean;
    autoFocusSearch?: boolean;
    /** draggable : active le drag & drop vers le canvas */
    draggable?: boolean;
    /** Types insérables dans le contexte courant (canDrop). Absent = racine. */
    allowedTypes?: string[];
}

function DraggableCompactItem({ def, onSelect }: { def: BlockDefinition; onSelect: (def: BlockDefinition) => void }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `palette-${def.type}`,
        data: { origin: "palette", def },
    });
    const meta = BLOCK_META[def.type];
    const Icon = meta?.icon ?? Puzzle;

    return (
        <button
            ref={setNodeRef}
            onClick={() => onSelect(def)}
            className={[
                "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left",
                "border border-bridge-400/20 dark:border-bridge-500/25",
                "bg-bridge-100/40 dark:bg-bridge-800/40",
                "hover:bg-bridge-200/60 dark:hover:bg-bridge-700/60 hover:border-brand-primary/30",
                "transition-all duration-150 cursor-grab active:cursor-grabbing",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50",
                isDragging ? "opacity-40" : "",
            ].join(" ")}
            {...attributes}
            {...listeners}
        >
            <div className="shrink-0 w-7 h-7 rounded-md bg-bridge-200/80 dark:bg-bridge-700/80 group-hover:bg-brand-primary/15 flex items-center justify-center transition-colors duration-150">
                <Icon className="w-3.5 h-3.5 text-bridge-600 dark:text-bridge-300 group-hover:text-brand-primary transition-colors duration-150" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-bridge-800 dark:text-bridge-100 leading-tight truncate">
                    {def.label}
                </div>
                <div className="text-[10px] font-mono text-bridge-400 dark:text-bridge-500 leading-none mt-0.5">
                    {def.type}
                </div>
            </div>
        </button>
    );
}

export function BlockPaletteGrid({ onSelect, compact = false, autoFocusSearch = false, draggable = false, allowedTypes }: BlockPaletteGridProps) {
    const [search, setSearch] = useState("");
    const definitions = getAllBlockDefinitions();

    const visible = allowedTypes
        ? definitions.filter((d) => allowedTypes.includes(d.type))
        : definitions.filter((d) => !HIDDEN_TYPES.includes(d.type));

    const filtered = visible.filter(
        (d) =>
            d.label.toLowerCase().includes(search.toLowerCase()) ||
            d.type.toLowerCase().includes(search.toLowerCase()) ||
            (BLOCK_META[d.type]?.description ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-3">
            {/* Recherche */}
            <div className="relative">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-bridge-400 dark:text-bridge-500 pointer-events-none"
                    aria-hidden="true"
                />
                <input
                    type="text"
                    placeholder="Rechercher…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus={autoFocusSearch}
                    className="w-full h-8 pl-8 pr-3 rounded-lg text-sm bg-bridge-100/70 dark:bg-bridge-800/70 border border-bridge-400/30 dark:border-bridge-500/35 text-bridge-800 dark:text-bridge-100 placeholder:text-bridge-400 dark:placeholder:text-bridge-500 outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-colors"
                />
            </div>

            {/* Grille / liste */}
            {filtered.length > 0 ? (
                <div className={compact ? "flex flex-col gap-1" : "grid grid-cols-2 gap-2.5"}>
                    {filtered.map((def) => {
                        const meta = BLOCK_META[def.type];
                        const Icon = meta?.icon ?? Puzzle;

                        if (compact && draggable) {
                            return <DraggableCompactItem key={def.type} def={def} onSelect={onSelect} />;
                        }

                        return compact ? (
                            <button
                                key={def.type}
                                onClick={() => onSelect(def)}
                                className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left border border-bridge-400/20 dark:border-bridge-500/25 bg-bridge-100/40 dark:bg-bridge-800/40 hover:bg-bridge-200/60 dark:hover:bg-bridge-700/60 hover:border-brand-primary/30 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
                            >
                                <div className="shrink-0 w-7 h-7 rounded-md bg-bridge-200/80 dark:bg-bridge-700/80 group-hover:bg-brand-primary/15 flex items-center justify-center transition-colors duration-150">
                                    <Icon className="w-3.5 h-3.5 text-bridge-600 dark:text-bridge-300 group-hover:text-brand-primary transition-colors duration-150" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-semibold text-bridge-800 dark:text-bridge-100 leading-tight truncate">
                                        {def.label}
                                    </div>
                                    <div className="text-[10px] font-mono text-bridge-400 dark:text-bridge-500 leading-none mt-0.5">
                                        {def.type}
                                    </div>
                                </div>
                            </button>
                        ) : (
                            <button
                                key={def.type}
                                onClick={() => onSelect(def)}
                                className="group flex items-start gap-3 rounded-xl p-3.5 text-left border border-bridge-400/25 dark:border-bridge-500/30 bg-bridge-100/50 dark:bg-bridge-800/50 hover:bg-bridge-200/60 dark:hover:bg-bridge-700/60 hover:border-brand-primary/35 dark:hover:border-brand-primary/35 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
                            >
                                <div className="shrink-0 w-9 h-9 rounded-lg bg-bridge-200/80 dark:bg-bridge-700/80 group-hover:bg-brand-primary/15 dark:group-hover:bg-brand-primary/20 flex items-center justify-center transition-colors duration-150">
                                    <Icon className="w-4 h-4 text-bridge-600 dark:text-bridge-300 group-hover:text-brand-primary dark:group-hover:text-brand-primary transition-colors duration-150" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-bridge-800 dark:text-bridge-100 leading-tight">
                                        {def.label}
                                    </div>
                                    {meta?.description && (
                                        <div className="text-[11px] text-bridge-500 dark:text-bridge-400 mt-0.5 leading-snug line-clamp-2">
                                            {meta.description}
                                        </div>
                                    )}
                                    <div className="text-[10px] font-mono text-bridge-400 dark:text-bridge-500 mt-1.5">
                                        {def.type}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="py-6 text-center">
                    <p className="text-sm font-medium text-bridge-600 dark:text-bridge-400">
                        Aucun bloc correspondant
                    </p>
                    <p className="text-xs text-bridge-400 dark:text-bridge-500 mt-1">
                        Essayez « texte », « titre » ou « liste »
                    </p>
                </div>
            )}
        </div>
    );
}
