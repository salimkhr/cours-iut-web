'use client';

import { ChevronLeft, ChevronRight, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
 * ‹ › restent visibles mais desactives tant qu'aucune session n'est live,
 * avec un message explicite : pas de raison de cacher la mise en page,
 * juste de dire pourquoi elle ne repond pas encore.
 */
export const RemoteControlView = () => {
    const {
        currentSlide,
        currentStep,
        slidesCount,
        slideSteps,
        currentSlideTitle,
        prevSlide,
        nextSlide,
        live,
        startPresenting,
        stopPresenting,
        takeControl,
    } = useSlides();

    const isLive = live?.isLive ?? false;
    const isController = live?.isController ?? false;

    const handleStart = () => startPresenting && runLiveAction(startPresenting, "Impossible de démarrer la présentation en direct.");
    const handleStop = () => stopPresenting && runLiveAction(stopPresenting, "Impossible d'arrêter la présentation en direct.");

    // Sur une télécommande, un appui doit piloter tout de suite : prendre la
    // main si besoin (no-op une fois déjà contrôleur, takeControl devient
    // alors undefined) avant d'avancer/reculer.
    const handlePrev = () => { takeControl?.(); prevSlide(); };
    const handleNext = () => { takeControl?.(); nextSlide(); };

    const atStart = currentSlide === 0 && currentStep === 0;
    const atEnd = currentSlide === slidesCount - 1 && currentStep === (slideSteps[currentSlide] || 0);

    return (
        <div className="flex h-[calc(100dvh-var(--navbar-h)-1.5rem)] min-h-[420px] w-full flex-col items-center justify-between rounded-2xl border border-bridge-500/45 bg-bridge-50 p-6 dark:border-bridge-500/35 dark:bg-bridge-900">
            {/* ── Statut ────────────────────────────────────────────────── */}
            <div className="flex w-full items-center justify-between">
                {isLive ? (
                    <div className="flex items-center gap-1.5 select-none">
                        <span className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            isController
                                ? "bg-brand-primary dark:bg-brand-accent animate-pulse"
                                : "border-2 border-bridge-600 dark:border-bridge-300"
                        )} />
                        <span className="text-sm font-semibold text-bridge-600 dark:text-bridge-300">
                            {isController ? "Vous contrôlez" : `Suit ${live!.presenterName ?? "…"}`}
                        </span>
                    </div>
                ) : (
                    <span className="text-sm font-semibold text-bridge-600/80 dark:text-bridge-300/80">
                        Aucune présentation en cours
                    </span>
                )}

                {isController && (
                    <Button size="icon" variant="ghost" className="cursor-pointer" onClick={handleStop} title="Arrêter la présentation">
                        <StopCircle className="text-brand-primary dark:text-brand-accent" />
                    </Button>
                )}
            </div>

            {/* ── Slide en cours ────────────────────────────────────────── */}
            <div className="flex flex-col items-center gap-2 text-center px-4">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-bridge-600/70 dark:text-bridge-300/70">
                    Slide {currentSlide + 1} / {slidesCount}
                </span>
                <h2 className="text-2xl font-extrabold text-brand-dark dark:text-brand-light">
                    {currentSlideTitle || "—"}
                </h2>
            </div>

            {/* ── Navigation ────────────────────────────────────────────── */}
            <div className="flex w-full flex-col items-center gap-3">
                {!isLive && (
                    <Button size="lg" className="w-full cursor-pointer gap-2" onClick={handleStart}>
                        <LaptopMinimalCheckIcon size={18} />
                        Démarrer la présentation
                    </Button>
                )}

                <div className="flex w-full gap-4">
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-20 flex-1 cursor-pointer"
                        onClick={handlePrev}
                        disabled={!isLive || atStart}
                    >
                        <ChevronLeft className="size-8" />
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-20 flex-1 cursor-pointer"
                        onClick={handleNext}
                        disabled={!isLive || atEnd}
                    >
                        <ChevronRight className="size-8" />
                    </Button>
                </div>

                {!isLive && (
                    <p className="text-xs text-bridge-600/70 dark:text-bridge-300/70">
                        Démarrez une présentation pour naviguer.
                    </p>
                )}
            </div>
        </div>
    );
};
