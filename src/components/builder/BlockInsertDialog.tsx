"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAllBlockDefinitions, createBlockInstance } from "@/lib/blockRegistry";
import type { BlockCategory } from "@/lib/blockRegistry";
import { useBuilderStore } from "@/lib/store/builderStore";
import { findBlock } from "@/lib/blockTreeUtils";
import { canDrop, isTypeAllowedInContent } from "@/lib/blockSchemas";
import { Blocks, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: BlockCategory[] = [
    "Slides",
    "Contenu",
    "Structure",
    "Listes",
    "Code",
    "Médias",
    "Composants",
];

function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-bridge-500 dark:text-bridge-300 mb-1.5">
            {children}
        </p>
    );
}

interface BlockInsertDialogProps {
    open: boolean;
    onClose: () => void;
    parentId: string | null;
    index?: number;
}

export function BlockInsertDialog({ open, onClose, parentId, index }: BlockInsertDialogProps) {
    const insertBlock = useBuilderStore((s) => s.insertBlock);
    const selectBlock = useBuilderStore((s) => s.selectBlock);
    const setEditingBlock = useBuilderStore((s) => s.setEditingBlock);
    const blocks = useBuilderStore((s) => s.blocks);
    const moduleColor = useBuilderStore((s) => s.moduleColorLight);

    const contentType = useBuilderStore((s) => s.contentType);
    const allDefs = getAllBlockDefinitions();

    const [query, setQuery] = useState("");

    /** Ferme le dialog en repartant d'une recherche vierge. */
    const close = () => { setQuery(""); onClose(); };

    const parentBlock = parentId ? findBlock(blocks, parentId) : null;
    const parentType = parentBlock?.type ?? null;

    // Deux filtres : l'imbrication (ce parent accepte-t-il ce bloc ?) et
    // l'univers (un bloc de cours n'a rien à faire dans une slide, et le
    // filtrage par catégorie masquait « Colonnes » et « Diagramme » alors que
    // les slides les acceptent).
    const defs = allDefs.filter((def) =>
        canDrop(def.type, parentType) && isTypeAllowedInContent(def.type, contentType)
    );

    const needle = query.trim().toLowerCase();
    const visibleDefs = needle
        ? defs.filter((d) =>
            d.label.toLowerCase().includes(needle) || d.type.toLowerCase().includes(needle))
        : defs;

    const grouped = useMemo(
        () => CATEGORY_ORDER.reduce<{ cat: BlockCategory; items: typeof defs }[]>(
            (acc, cat) => {
                const items = visibleDefs.filter((d) => d.category === cat);
                if (items.length > 0) acc.push({ cat, items });
                return acc;
            },
            []
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [visibleDefs, contentType]
    );

    function handleInsert(type: string) {
        const def = allDefs.find((d) => d.type === type);
        if (!def) return;
        const block = createBlockInstance(def);
        insertBlock(block, parentId, index);
        selectBlock(block.id);
        // Le bloc arrive vide : sans ouvrir son éditeur, la barre de formatage
        // s'affichait (elle suit la sélection) alors qu'aucun champ n'avait le
        // focus, et tout ce qui était tapé partait dans le vide.
        if (def.inlineEditField) setEditingBlock(block.id);
        close();
    }

    /** Entrée dans le champ de recherche : insère l'unique résultat. */
    function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key !== "Enter") return;
        const first = grouped[0]?.items[0];
        if (first) {
            e.preventDefault();
            handleInsert(first.type);
        }
    }

    // `text` couvre les éléments de liste, dont le contexte s'affichait sinon
    // sous son nom technique (« dans "list-item" »).
    const parentName = parentBlock
        ? String(
            parentBlock.props.title
            ?? parentBlock.props.content
            ?? parentBlock.props.text
            ?? allDefs.find((d) => d.type === parentBlock.type)?.label
            ?? parentBlock.type
        ).trim()
        : "";
    const contextLabel = parentBlock
        ? `dans « ${(parentName || parentBlock.type).slice(0, 28)} »`
        : "à la racine du document";

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
            <DialogContent
                // Sans ça, Radix rend le focus au bouton qui a ouvert le
                // dialog : les premières lettres tapées dans le bloc fraîchement
                // inséré étaient perdues, et une barre d'espace « re-cliquait »
                // ce bouton, insérant un second bloc.
                onCloseAutoFocus={(e) => e.preventDefault()}
                className={cn(
                "max-w-sm sm:max-w-md p-0 overflow-hidden",
                "border border-bridge-400/45 dark:border-bridge-500/40",
                "shadow-[0_22px_44px_-14px_rgba(147,97,58,0.32)] dark:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.65)]",
                "[&>button]:text-white/70 [&>button:hover]:text-white [&>button]:ring-offset-transparent [&>button:focus-visible]:ring-white/50",
            )}>
                {/* Header — couleur du module en valeur littérale. Une classe
                    interpolée (`bg-${moduleSlug}`) n'existe pas dans le CSS
                    généré, et `var(--mod-color)` n'est pas héritée ici : le
                    dialog est monté dans un portail hors de l'arbre du builder.
                    L'en-tête restait donc clair, avec son texte blanc illisible. */}
                <div
                    className="relative flex items-center gap-3 px-5 py-3.5 pr-14 overflow-hidden bg-brand-primary"
                    style={moduleColor ? { backgroundColor: moduleColor } : undefined}
                >
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 shrink-0">
                        <Blocks className="w-4 h-4 text-white" aria-hidden="true" />
                    </div>
                    <DialogHeader className="p-0 space-y-0 text-left">
                        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white/60">
                            {contextLabel}
                        </p>
                        <DialogTitle className="text-white font-bold text-base leading-tight">
                            Insérer un bloc
                        </DialogTitle>
                    </DialogHeader>
                </div>

                {/* Recherche */}
                <div className="px-4 pt-3 bg-card">
                    <label className="sr-only" htmlFor="block-search">Rechercher un bloc</label>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-bridge-500 dark:text-bridge-300" aria-hidden="true" />
                        <input
                            id="block-search"
                            type="search"
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Rechercher un bloc…"
                            className="h-9 w-full rounded-md border border-bridge-300/65 bg-transparent pl-8 pr-3 text-sm text-bridge-700 placeholder:text-bridge-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:border-bridge-600/45 dark:text-bridge-200 dark:placeholder:text-bridge-300"
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="px-4 py-3 flex flex-col gap-3 max-h-[65vh] overflow-y-auto bg-card">
                    {grouped.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-5 text-bridge-500 dark:text-bridge-300">
                            <Blocks className="w-6 h-6 opacity-40" />
                            <p className="text-xs text-center">
                                {needle
                                    ? `Aucun bloc ne correspond à « ${query} ».`
                                    : "Aucun bloc disponible dans ce contexte."}
                            </p>
                        </div>
                    ) : (
                        grouped.map(({ cat, items }, gi) => (
                            <div key={cat}>
                                {gi > 0 && (
                                    <div className="h-px bg-bridge-200/70 dark:bg-bridge-700/60 -mx-4 mb-3" />
                                )}
                                <Eyebrow>{cat}</Eyebrow>
                                <div className="grid grid-cols-3 gap-1">
                                    {items.map((def) => {
                                        const Icon = def.icon ?? Blocks;
                                        return (
                                            <Button
                                                key={def.type}
                                                variant="outline"
                                                size="sm"
                                                className="justify-start gap-1.5 text-xs h-8 px-2.5 font-normal cursor-pointer border-bridge-300/65 dark:border-bridge-600/45 text-bridge-700 dark:text-bridge-200 transition-colors duration-150 hover:bg-brand-primary/10 hover:border-brand-primary/40 hover:text-brand-primary dark:hover:bg-brand-primary/16 dark:hover:border-brand-primary/45 dark:hover:text-brand-primary"
                                                onClick={() => handleInsert(def.type)}
                                            >
                                                <Icon className="w-3 h-3 shrink-0 text-bridge-500 dark:text-bridge-300" />
                                                <span className="truncate">{def.label}</span>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
