'use client';

import {ChevronLeft, ChevronRight, Maximize, MessageSquare, Minimize, StopCircle, Wifi, WifiOff} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {useState} from "react";
import {useSlides} from "@/components/Slides/context/SlidesContext";
import {LaptopMinimalCheckIcon} from "@/components/icons/laptop-minimal-check";

export const SlidesActions = ({className}: { className?: string }) => {
    const {
        currentSlide,
        currentStep,
        slidesCount,
        slideSteps,
        isFullscreen,
        toggleFullscreen,
        prevSlide,
        nextSlide,
        showNotes,
        setShowNotes,
        currentNotes,
        isMobile,
        live,
        startPresenting,
        stopPresenting,
    } = useSlides();

    const [hovered, setHovered] = useState(false);
    const hasNotes = !!currentNotes;

    if (isMobile) return null;

    const isLive = live?.isLive ?? false;
    const isFollower = isLive && live && !live.isPresenter;

    // Décrochage : l'étudiant est en dérive ou a mis en pause le suivi automatique
    const isDetached = isFollower && (live!.paused || live!.drift.direction !== "synced");
    // Perte de connexion SSE
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
            className={cn(
                "absolute bottom-4 left-0 w-full flex justify-center z-50",
                className
            )}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* ── Mode LIVE : étudiant en décrochage ────────────────────────────────── */}
            {isDetached ? (
                <div
                    className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl border backdrop-blur-md transition-opacity",
                        hovered ? "opacity-100 bg-background/80" : "opacity-60 bg-background/50"
                    )}
                >
                    {/* Badge "En direct" */}
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"/>
                        <span className="text-xs font-medium text-red-500">
                            {live!.presenterName ?? "En direct"}
                        </span>
                    </div>

                    {/* Info décrochage */}
                    <div className="w-px h-5 bg-border/50"/>
                    <span className="text-xs text-muted-foreground">
                        {live!.paused && live!.drift.direction === "synced"
                            ? "Navigation libre"
                            : (driftLabel() ?? "En pause")}
                    </span>

                    {/* CTA Rejoindre */}
                    <Button
                        size="sm"
                        variant="default"
                        className="h-7 px-3 text-xs font-medium cursor-pointer"
                        onClick={live!.resync}
                    >
                        Rejoindre
                    </Button>
                </div>
            ) : (
                /* ── Barre d'actions standard ─────────────────────────────────────────── */
                <div
                    className={cn(
                        "flex items-center gap-2 p-2 rounded-xl border backdrop-blur-md transition-opacity",
                        hovered ? "opacity-100 bg-background/70" : "opacity-40 bg-background/40"
                    )}
                >
                    {/* ── Bloc LIVE ─────────────────────────────────────────────────── */}
                    {isLive ? (
                        <>
                            {/* Indicateur connexion SSE perdue */}
                            {isDisconnected && (
                                <span
                                    className="text-amber-500 cursor-default"
                                    title={live!.connection === "reconnecting" ? "Reconnexion…" : "Hors ligne"}
                                >
                                    {live!.connection === "reconnecting"
                                        ? <Wifi className="w-4 h-4 animate-pulse"/>
                                        : <WifiOff className="w-4 h-4"/>}
                                </span>
                            )}

                            {/* Badge "En direct" */}
                            <div className="flex items-center gap-1.5 px-1 select-none">
                                <span className={cn(
                                    "w-2 h-2 rounded-full shrink-0",
                                    live!.isPresenter
                                        ? "bg-red-500 animate-pulse"
                                        : "bg-green-500"
                                )}/>
                                <span className={cn(
                                    "text-xs font-medium",
                                    live!.isPresenter ? "text-red-500" : "text-green-600 dark:text-green-400"
                                )}>
                                    {live!.isPresenter
                                        ? "En direct"
                                        : (live!.presenterName ?? "En direct")}
                                </span>
                            </div>

                            {/* Bouton Stop pour le présentateur */}
                            {live!.isPresenter && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="cursor-pointer"
                                    onClick={stopPresenting}
                                    title="Arrêter la présentation"
                                >
                                    <StopCircle className="text-red-500"/>
                                </Button>
                            )}

                            <div className="w-px h-6 bg-border/50"/>
                        </>
                    ) : startPresenting ? (
                        /* Bouton démarrer (admin uniquement) */
                        <>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="cursor-pointer"
                                onClick={startPresenting}
                                title="Démarrer la présentation en direct"
                            >
                                <LaptopMinimalCheckIcon size={18}/>
                            </Button>
                            <div className="w-px h-6 bg-border/50"/>
                        </>
                    ) : null}

                    {/* ── Notes ─────────────────────────────────────────────────────── */}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="cursor-pointer"
                        disabled={!hasNotes}
                        onClick={() => setShowNotes(!showNotes)}
                    >
                        <MessageSquare/>
                    </Button>

                    <div className="w-px h-6 bg-border/50"/>

                    {/* ── Plein écran ────────────────────────────────────────────────── */}
                    <Button size="icon" variant="ghost" className="cursor-pointer" onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize/> : <Maximize/>}
                    </Button>

                    <div className="w-px h-6 bg-border/50"/>

                    {/* ── Navigation ────────────────────────────────────────────────── */}
                    <Button
                        size="icon"
                        variant="ghost"
                        className={cn("cursor-pointer", isFollower && "opacity-50")}
                        onClick={prevSlide}
                        disabled={currentSlide === 0 && currentStep === 0}
                        title={isFollower ? "Explorer (désactive le suivi automatique)" : undefined}
                    >
                        <ChevronLeft/>
                    </Button>

                    <Button
                        size="icon"
                        variant="ghost"
                        className={cn("cursor-pointer", isFollower && "opacity-50")}
                        onClick={nextSlide}
                        disabled={
                            currentSlide === slidesCount - 1 &&
                            currentStep === (slideSteps[currentSlide] || 0)
                        }
                        title={isFollower ? "Explorer (désactive le suivi automatique)" : undefined}
                    >
                        <ChevronRight/>
                    </Button>
                </div>
            )}
        </div>
    );
};
