'use client';

import { useState } from "react";
import { ChevronLeft, ChevronRight, List, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSlides } from "@/components/Slides/context/SlidesContext";
import { runLiveAction } from "@/components/Slides/utils/liveActionFeedback";
import { LaptopMinimalCheckIcon } from "@/components/icons/laptop-minimal-check";

/**
 * Vue mobile d'un admin : pas le deck, juste de quoi piloter à distance une
 * présentation projetée ailleurs. Toujours affichée à la place du deck sur
 * petit écran pour un admin (voir `SlidesScreen`), live ou pas — avant le
 * démarrage, elle ne montre qu'un bouton « Démarrer ».
 *
 * ‹ › et le sélecteur de slide restent visibles mais desactives tant
 * qu'aucune session n'est live, avec un message explicite : pas de raison de
 * cacher la mise en page, juste de dire pourquoi elle ne répond pas encore.
 */
export const RemoteControlView = () => {
    const {
        currentSlide,
        currentStep,
        slidesCount,
        slideSteps,
        currentSlideTitle,
        slideTitles,
        currentNotes,
        prevSlide,
        nextSlide,
        goToSlide,
        live,
        startPresenting,
        stopPresenting,
        takeControl,
    } = useSlides();

    const [pickerOpen, setPickerOpen] = useState(false);
    // Sans cette garde, un double-tap pendant l'aller-retour reseau (start/stop)
    // pouvait declencher deux requetes ; le bouton reste actif visuellement,
    // rien ne signalait qu'un appel etait deja en cours.
    const [pending, setPending] = useState(false);

    const isLive = live?.isLive ?? false;
    const isController = live?.isController ?? false;

    const handleStart = async () => {
        if (!startPresenting || pending) return;
        setPending(true);
        await runLiveAction(startPresenting, "Impossible de démarrer la présentation en direct.");
        setPending(false);
    };
    const handleStop = async () => {
        if (!stopPresenting || pending) return;
        setPending(true);
        await runLiveAction(stopPresenting, "Impossible d'arrêter la présentation en direct.");
        setPending(false);
    };

    // Sur une télécommande, un appui doit piloter tout de suite : prendre la
    // main si besoin (no-op une fois déjà contrôleur, takeControl devient
    // alors undefined) avant d'avancer/reculer/sauter.
    const handlePrev = () => { takeControl?.(); prevSlide(); };
    const handleNext = () => { takeControl?.(); nextSlide(); };
    const handleJumpTo = (index: number) => {
        takeControl?.();
        goToSlide(index);
        setPickerOpen(false);
    };

    const atStart = currentSlide === 0 && currentStep === 0;
    const atEnd = currentSlide === slidesCount - 1 && currentStep === (slideSteps[currentSlide] || 0);

    return (
        <div className="flex h-[calc(100dvh-var(--navbar-h))] w-full flex-col bg-bridge-50 p-6 dark:bg-bridge-900">
            {/* ── Statut ────────────────────────────────────────────────── */}
            <div className="flex w-full shrink-0 items-center justify-between">
                {isLive ? (
                    <div className="flex items-center gap-1.5 select-none">
                        <span className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            isController
                                ? "bg-brand-primary dark:bg-brand-accent animate-pulse"
                                : "border-2 border-bridge-600 dark:border-bridge-300"
                        )} />
                        <span className="text-lg font-semibold text-bridge-600 dark:text-bridge-300">
                            {isController ? "Vous contrôlez" : `Suit ${live!.presenterName ?? "…"}`}
                        </span>
                    </div>
                ) : (
                    <span className="text-lg font-semibold text-bridge-600/80 dark:text-bridge-300/80">
                        Aucune présentation en cours
                    </span>
                )}

                {isController && (
                    <Button size="icon" variant="ghost" className="cursor-pointer" onClick={handleStop} title="Arrêter la présentation">
                        <StopCircle className="text-brand-primary dark:text-brand-accent" />
                    </Button>
                )}
            </div>

            {/* ── Slide en cours + notes ────────────────────────────────── */}
            <div className="mt-4 flex min-h-0 flex-1 flex-col items-center gap-3 overflow-y-auto text-center">
                <button
                    type="button"
                    // Zone tactile de 44px minimum (recommandation mobile) : le
                    // texte seul, sans marge, ne faisait qu'une vingtaine de px.
                    className={cn(
                        "flex min-h-11 touch-manipulation items-center gap-1.5 px-3 text-sm font-semibold uppercase tracking-[0.18em] text-bridge-600/70 dark:text-bridge-300/70",
                        isLive && "cursor-pointer hover:text-bridge-600 dark:hover:text-bridge-300"
                    )}
                    onClick={() => isLive && setPickerOpen(true)}
                    disabled={!isLive}
                >
                    Slide {currentSlide + 1} / {slidesCount}
                    <List className="size-3.5" />
                </button>
                <h2 className="text-3xl font-extrabold text-brand-dark dark:text-brand-light">
                    {currentSlideTitle || "—"}
                </h2>
                {currentNotes && (
                    <p className="whitespace-pre-line text-left text-lg leading-relaxed text-bridge-700 dark:text-bridge-200">
                        {currentNotes}
                    </p>
                )}
            </div>

            {/* ── Navigation ────────────────────────────────────────────── */}
            <div className="flex w-full shrink-0 flex-col items-center gap-3 pt-4">
                {!isLive && (
                    <Button size="lg" className="w-full cursor-pointer gap-2" onClick={handleStart}>
                        <LaptopMinimalCheckIcon size={18} />
                        Démarrer la présentation
                    </Button>
                )}

                {/* Le suivant domine largement le précédent : c'est celui
                    qu'on tape presque tout le temps en présentant. */}
                <div className="flex w-full gap-3">
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-24 w-20 shrink-0 cursor-pointer"
                        onClick={handlePrev}
                        disabled={!isLive || atStart}
                    >
                        <ChevronLeft className="size-7" />
                    </Button>
                    <Button
                        size="lg"
                        className="h-24 flex-1 cursor-pointer gap-2 text-lg"
                        onClick={handleNext}
                        disabled={!isLive || atEnd}
                    >
                        Suivant
                        <ChevronRight className="size-8" />
                    </Button>
                </div>

                {!isLive && (
                    <p className="text-sm text-bridge-600/70 dark:text-bridge-300/70">
                        Démarrez une présentation pour naviguer.
                    </p>
                )}
            </div>

            {/* ── Sélecteur de slide ────────────────────────────────────── */}
            <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
                <SheetContent side="bottom" className="flex max-h-[80dvh] flex-col">
                    <SheetHeader>
                        <SheetTitle>Aller à une slide</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        {Array.from({ length: slidesCount }).map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                className={cn(
                                    "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left",
                                    i === currentSlide
                                        ? "bg-primary/10 text-primary dark:text-brand-accent"
                                        : "hover:bg-bridge-100 dark:hover:bg-bridge-800"
                                )}
                                onClick={() => handleJumpTo(i)}
                            >
                                <span className="w-7 shrink-0 text-lg font-semibold text-bridge-500">{i + 1}</span>
                                <span className="truncate text-lg">{slideTitles?.[i] || `Slide ${i + 1}`}</span>
                            </button>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};
