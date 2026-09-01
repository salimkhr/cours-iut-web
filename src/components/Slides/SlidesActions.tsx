'use client';

import { ChevronLeft, ChevronRight, Maximize, Minimize, StopCircle, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSlides } from "@/components/Slides/context/SlidesContext";
import { LaptopMinimalCheckIcon } from "@/components/icons/laptop-minimal-check";

export const SlidesActions = ({ className }: { className?: string }) => {
    const {
        currentSlide,
        currentStep,
        slidesCount,
        slideSteps,
        isFullscreen,
        toggleFullscreen,
        prevSlide,
        nextSlide,
        live,
        startPresenting,
        stopPresenting,
        takeControl,
    } = useSlides();

    const [hovered, setHovered] = useState(false);

    // Sans ce catch, un echec silencieux (403 role non admin, session expiree)
    // laissait l'interface bloquee sur le bouton de depart sans aucun signal :
    // le clic semblait ne rien faire.
    const handleStart = async () => {
        if (!startPresenting) return;
        try {
            await startPresenting();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Impossible de démarrer la présentation en direct.");
        }
    };

    const handleStop = async () => {
        if (!stopPresenting) return;
        try {
            await stopPresenting();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Impossible d'arrêter la présentation en direct.");
        }
    };

    const isLive = live?.isLive ?? false;
    const isController = live?.isController ?? false;
    const isFollower = isLive && !isController;
    const isDetached = isFollower && live && (live.paused || live.drift.direction !== "synced");
    const isDisconnected = live && live.connection !== "connected";

    const driftLabel = () => {
        if (!live || live.drift.direction === "synced") return null;
        const n = live.drift.delta;
        const unit = n > 1 ? "slides" : "slide";
        return live.drift.direction === "ahead"
            ? `${n} ${unit} en avance`
            : `${n} ${unit} en retard`;
    };

    return (
        <div
            className={cn("absolute bottom-4 left-0 w-full flex justify-center z-50", className)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className={cn(
                "flex items-center gap-2 p-2 rounded-xl border border-bridge-500/40 backdrop-blur-md transition-[background-color,box-shadow]",
                hovered
                    ? "bg-bridge-50/85 shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)] dark:bg-bridge-800/85 dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]"
                    : "bg-bridge-50/55 shadow-[0_1px_8px_-5px_rgba(147,97,58,0.28)] dark:bg-bridge-800/55 dark:shadow-[0_1px_10px_-5px_rgba(0,0,0,0.45)]"
            )}>

                {/* ── Bloc LIVE ──────────────────────────────────────────────────── */}
                {isLive ? (
                    <>
                        {isDisconnected && (
                            <span className="text-amber-500" title={live!.connection === "reconnecting" ? "Reconnexion…" : "Hors ligne"}>
                                {live!.connection === "reconnecting"
                                    ? <Wifi className="w-4 h-4 animate-pulse" />
                                    : <WifiOff className="w-4 h-4" />}
                            </span>
                        )}

                        {/* Badge rôle */}
                        <div className="flex items-center gap-1.5 px-1 select-none">
                            {/* Distinction par teinte ET par forme : le leader pulse
                                sur un disque plein, le suiveur porte un anneau. */}
                            <span className={cn(
                                "w-2 h-2 rounded-full shrink-0",
                                isController
                                    ? "bg-brand-primary dark:bg-brand-accent animate-pulse"
                                    : "border-2 border-bridge-600 dark:border-bridge-300"
                            )} />
                            <div className="flex flex-col leading-none">
                                <span className={cn(
                                    "text-xs font-semibold",
                                    isController
                                        ? "text-brand-primary dark:text-brand-accent"
                                        : "text-bridge-600 dark:text-bridge-300"
                                )}>
                                    {isController ? "Leader" : "Suiveur"}
                                </span>
                                <span className="text-[11px] text-bridge-600/80 dark:text-bridge-300/80">
                                    {isController
                                        ? "Vous contrôlez"
                                        : isDetached
                                            ? (driftLabel() ?? "Navigation libre")
                                            : `Suit ${live!.presenterName ?? "…"}`}
                                </span>
                            </div>
                        </div>

                        {isDetached && (
                            <Button size="sm" variant="default" className="h-6 px-2 text-xs cursor-pointer" onClick={live!.resync}>
                                Rejoindre
                            </Button>
                        )}

                        {takeControl && (
                            <Button size="sm" variant="outline" className="h-6 px-2 text-[11px] cursor-pointer" onClick={takeControl}>
                                Reprendre
                            </Button>
                        )}

                        {isController && (
                            <Button size="icon" variant="ghost" className="cursor-pointer" onClick={handleStop} title="Arrêter la présentation">
                                <StopCircle className="text-brand-primary dark:text-brand-accent" />
                            </Button>
                        )}

                        <div className="w-px h-6 bg-border/50" />
                    </>
                ) : startPresenting ? (
                    <>
                        <Button size="icon" variant="ghost" className="cursor-pointer" onClick={handleStart} title="Démarrer la présentation en direct">
                            <LaptopMinimalCheckIcon size={18} />
                        </Button>
                        <div className="w-px h-6 bg-border/50" />
                    </>
                ) : null}

                {/* ── Plein écran ─────────────────────────────────────────────────── */}
                <Button size="icon" variant="ghost" className="cursor-pointer" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize /> : <Maximize />}
                </Button>

                <div className="w-px h-6 bg-border/50" />

                {/* ── Navigation ──────────────────────────────────────────────────── */}
                <Button
                    size="icon"
                    variant="ghost"
                    className={cn("cursor-pointer", isFollower && "opacity-50")}
                    onClick={prevSlide}
                    disabled={currentSlide === 0 && currentStep === 0}
                    title={isFollower ? "Explorer (désactive le suivi automatique)" : undefined}
                >
                    <ChevronLeft />
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    className={cn("cursor-pointer", isFollower && "opacity-50")}
                    onClick={nextSlide}
                    disabled={currentSlide === slidesCount - 1 && currentStep === (slideSteps[currentSlide] || 0)}
                    title={isFollower ? "Explorer (désactive le suivi automatique)" : undefined}
                >
                    <ChevronRight />
                </Button>
            </div>
        </div>
    );
};
