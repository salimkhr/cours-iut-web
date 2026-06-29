'use client';

import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight, LaptopMinimalCheck, Maximize, Minimize, StopCircle, Wifi, WifiOff} from "lucide-react";
import {useSlides} from "@/components/Slides/context/SlidesContext";
import {NotesRenderer} from "@/components/Slides/ui/NotesRenderer";
import {cn} from "@/lib/utils";

export const SlidesMobileView = () => {
    const {
        currentSlide,
        currentStep,
        slideSteps,
        slidesCount,
        currentNotes,
        prevSlide,
        nextSlide,
        toggleFullscreen,
        isFullscreen,
        live,
        startPresenting,
        stopPresenting,
        takeControl,
    } = useSlides();

    const vibrate = (ms: number) => navigator.vibrate?.(ms);

    const maxStep = slideSteps[currentSlide] || 0;
    const isLive = live?.isLive ?? false;
    const isController = live?.isController ?? false;
    const isFollower = isLive && !isController;
    const isDisconnected = live && live.connection !== "connected";

    return (
        <div className="flex flex-col h-full relative bg-bridge-50 dark:bg-bridge-900">
            {/* Header */}
            <div className="px-6 py-3 border-b bg-bridge-50/80 dark:bg-bridge-900/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
                <span className="text-sm font-bold uppercase">
                    Slide {currentSlide + 1} / {slidesCount}
                </span>

                {/* Statut live */}
                {live && isLive ? (
                    <div className="flex items-center gap-2">
                        {isDisconnected && (
                            <span className="text-amber-500" title={live.connection === "reconnecting" ? "Reconnexion…" : "Hors ligne"}>
                                {live.connection === "reconnecting"
                                    ? <Wifi className="w-3.5 h-3.5 animate-pulse"/>
                                    : <WifiOff className="w-3.5 h-3.5"/>}
                            </span>
                        )}
                        <span className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            isController ? "bg-red-500 animate-pulse" : "bg-green-500"
                        )}/>
                        <span className={cn(
                            "text-xs font-medium",
                            isController ? "text-red-500" : "text-green-600 dark:text-green-400"
                        )}>
                            {isController ? "Leader" : (live.presenterName ?? "En direct")}
                        </span>
                    </div>
                ) : takeControl ? (
                    /* Admin qui a rechargé la page : reprendre le contrôle */
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 gap-1.5 text-xs text-green-600"
                        onClick={takeControl}
                    >
                        Reprendre
                    </Button>
                ) : startPresenting ? (
                    /* Admin sans session active : bouton démarrer */
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 gap-1.5 text-xs"
                        onClick={startPresenting}
                        title="Démarrer la présentation en direct"
                    >
                        <LaptopMinimalCheck className="w-3.5 h-3.5"/>
                        Démarrer
                    </Button>
                ) : null}
            </div>

            {/* Notes */}
            <div className={cn(
                "flex-1 overflow-y-auto p-6",
                isController
                    ? "pb-[calc(12rem+env(safe-area-inset-bottom,0px))]"
                    : "pb-[calc(8rem+env(safe-area-inset-bottom,0px))]"
            )}>
                {currentNotes ? (
                    <NotesRenderer notes={currentNotes} variant="mobile"/>
                ) : (
                    <div className="italic text-muted-foreground text-center">
                        Aucune note
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-bridge-50/90 dark:bg-bridge-900/90 backdrop-blur-sm border-t z-20 flex flex-col gap-3">
                {/* Bouton Stop si contrôleur actif */}
                {isController && stopPresenting && (
                    <Button
                        onClick={stopPresenting}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 text-red-500 border-red-200 hover:bg-red-50"
                    >
                        <StopCircle className="w-4 h-4"/>
                        Arrêter la présentation
                    </Button>
                )}

                {/* Badge décrochage follower */}
                {isFollower && live!.paused && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                        <span>Navigation libre</span>
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={live!.resync}>
                            Rejoindre
                        </Button>
                    </div>
                )}

                {/* Ligne du haut : Précédent + Fullscreen */}
                <div className="flex gap-3">
                    <Button
                        onClick={() => { vibrate(40); prevSlide(); }}
                        disabled={currentSlide === 0 && currentStep === 0}
                        className="flex-1 flex items-center justify-center gap-2"
                        variant="outline"
                    >
                        <ChevronLeft/> Précédent
                    </Button>

                    <Button
                        onClick={toggleFullscreen}
                        className="flex-1 flex items-center justify-center gap-2"
                        variant="outline"
                    >
                        {isFullscreen ? <Minimize/> : <Maximize/>}
                        {isFullscreen ? "Réduire" : "Fullscreen"}
                    </Button>
                </div>

                {/* Gros bouton en dessous : Suivant */}
                <Button
                    onClick={() => { vibrate(40); nextSlide(); }}
                    disabled={currentSlide === slidesCount - 1 && currentStep === maxStep}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 text-lg font-bold py-6"
                >
                    Suivant<ChevronRight/>
                </Button>
            </div>
        </div>
    );
};
