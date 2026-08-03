"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { ZoomedSlide } from "@/components/builder/ZoomedSlide";
import { useReducedMotion } from "@/components/builder/useReducedMotion";
import { computeSlideOrders } from "@/components/Slides/utils/slideOrder";
import type { Block } from "@/types/CourseContent";

interface SlideThumbnailListProps {
    slides: Block[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onAdd: () => void;
    /** Remonte / descend une slide dans le deck. */
    onMove: (id: string, direction: "up" | "down") => void;
}

export function SlideThumbnailList({ slides, activeId, onSelect, onAdd, onMove }: SlideThumbnailListProps) {
    const reduced = useReducedMotion();
    // Le badge suit le titre, pas la position : plusieurs slides d'affilée
    // peuvent développer une même section.
    const orders = computeSlideOrders(slides.map((s) => String(s.props.title ?? "")));

    // Déplacer une slide la fait changer de rang : le bouton resté sous le
    // curseur appartient désormais à une AUTRE slide, et un second clic
    // déplacerait la mauvaise. On ne peut pas bouger le pointeur (le web ne
    // l'autorise pas), mais on redonne le focus au même bouton à sa nouvelle
    // place : les déplacements s'enchaînent alors à l'Entrée.
    const [focusAfterMove, setFocusAfterMove] = useState<{ id: string; direction: "up" | "down" } | null>(null);

    const handleMove = useCallback((id: string, direction: "up" | "down") => {
        onMove(id, direction);
        setFocusAfterMove({ id, direction });
    }, [onMove]);

    const clearFocusIntent = useCallback(() => setFocusAfterMove(null), []);

    return (
        <div className="flex w-[208px] shrink-0 flex-col border-r border-bridge-200 bg-bridge-50 dark:border-bridge-700 dark:bg-bridge-900">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                {slides.map((slide, i) => (
                    <Thumbnail
                        key={slide.id}
                        slide={slide}
                        index={i}
                        order={orders[i]}
                        active={slide.id === activeId}
                        reduced={reduced}
                        onSelect={() => onSelect(slide.id)}
                        onMoveUp={i > 0 ? () => handleMove(slide.id, "up") : undefined}
                        onMoveDown={i < slides.length - 1 ? () => handleMove(slide.id, "down") : undefined}
                        focusAfterMove={focusAfterMove?.id === slide.id ? focusAfterMove.direction : null}
                        onFocusHandled={clearFocusIntent}
                    />
                ))}
            </div>
            <button
                type="button"
                onClick={onAdd}
                className="m-3 inline-flex items-center justify-center gap-1 rounded-md border border-dashed border-bridge-300 py-2 text-sm text-bridge-500 hover:border-[var(--mod-color)] hover:text-[var(--mod-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mod-color,#C2410C)] dark:border-bridge-600 dark:text-bridge-400"
            >
                <Plus className="size-4" /> Slide
            </button>
        </div>
    );
}

function Thumbnail({
    slide, index, order, active, reduced, onSelect, onMoveUp, onMoveDown, focusAfterMove, onFocusHandled,
}: {
    slide: Block;
    index: number;
    order: number;
    active: boolean;
    reduced: boolean;
    onSelect: () => void;
    /** Absent aux extrémités du deck. */
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    /** Direction du déplacement qui vient d'avoir lieu sur CETTE slide. */
    focusAfterMove: "up" | "down" | null;
    onFocusHandled: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const upRef = useRef<HTMLButtonElement>(null);
    const downRef = useRef<HTMLButtonElement>(null);
    const selectRef = useRef<HTMLButtonElement>(null);

    // `index` dans les dépendances : après un déplacement la slide change de
    // rang sans changer d'état actif, il faut quand même la ramener à l'écran.
    useEffect(() => {
        if (active) ref.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
    }, [active, reduced, index]);

    useEffect(() => {
        if (!focusAfterMove) return;

        const target = focusAfterMove === "up" ? upRef.current : downRef.current;
        // Arrivée en butée : le bouton se désactive et n'est plus focusable.
        // On garde alors le focus sur la slide plutôt que de le perdre.
        (target && !target.disabled ? target : selectRef.current)?.focus();
        onFocusHandled();
    }, [focusAfterMove, onFocusHandled]);

    // L'aperçu ne peut pas vivre DANS le bouton : une slide rend ses propres
    // contrôles (le « Copier » d'une CodeCard), et un <button> dans un <button>
    // est du HTML invalide — React le signale en erreur d'hydratation. Le bouton
    // devient donc un calque au-dessus de l'aperçu, qui reste inerte.
    return (
        <div
            ref={ref}
            className={[
                "relative overflow-hidden rounded-lg focus-within:ring-2 focus-within:ring-brand-primary",
                active ? "ring-2 ring-[var(--mod-color,#C2410C)]" : "ring-1 ring-bridge-200 dark:ring-bridge-700",
            ].join(" ")}
        >
            <div className="pointer-events-none aspect-video w-full select-none" aria-hidden="true">
                <ZoomedSlide slide={slide} mode="thumbnail" order={order} />
            </div>
            <div className="truncate bg-bridge-50 px-2 py-1 text-left text-[11px] text-brand-dark/70 dark:bg-bridge-800 dark:text-bridge-200">
                {index + 1}. {String(slide.props.title ?? "Sans titre")}
            </div>
            <button
                ref={selectRef}
                type="button"
                onClick={onSelect}
                title={String(slide.props.title ?? "Sans titre")}
                aria-label={`Slide ${index + 1} : ${String(slide.props.title ?? "Sans titre")}`}
                aria-current={active ? "step" : undefined}
                className="absolute inset-0 cursor-pointer rounded-lg focus-visible:outline-none"
            />

            {/* Réordonnancement. Au-dessus du calque de sélection (z-10), sinon
                il capterait le clic. Toujours visibles : les cacher au survol
                les rendrait introuvables, ce qui était précisément le problème. */}
            <div className="absolute right-1 top-1 z-10 flex flex-col gap-1">
                <MoveButton buttonRef={upRef} label={`Remonter la slide ${index + 1}`} onClick={onMoveUp}>
                    <ChevronUp className="size-4" />
                </MoveButton>
                <MoveButton buttonRef={downRef} label={`Descendre la slide ${index + 1}`} onClick={onMoveDown}>
                    <ChevronDown className="size-4" />
                </MoveButton>
            </div>
        </div>
    );
}

function MoveButton({ buttonRef, label, onClick, children }: {
    buttonRef: React.RefObject<HTMLButtonElement | null>;
    label: string;
    onClick?: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            ref={buttonRef}
            type="button"
            aria-label={label}
            title={label}
            disabled={!onClick}
            onClick={(e) => {
                // Sans cela, le clic remonte au calque de sélection en dessous.
                e.stopPropagation();
                onClick?.();
            }}
            // Anneau sur `focus` et pas seulement `focus-visible` : après un clic
            // souris, c'est le seul repère qui indique quel bouton est réarmé à
            // la nouvelle place de la slide.
            className="inline-flex size-7 items-center justify-center rounded-md border border-bridge-500/40 bg-bridge-50/85 text-brand-dark/70 shadow-[0_1px_4px_-2px_rgba(147,97,58,0.4)] backdrop-blur-sm transition-colors hover:bg-bridge-200 hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-[var(--mod-color,#C2410C)] disabled:pointer-events-none disabled:opacity-0 dark:bg-bridge-800/85 dark:text-bridge-200 dark:hover:bg-bridge-700 disabled:dark:opacity-0"
        >
            {children}
        </button>
    );
}
