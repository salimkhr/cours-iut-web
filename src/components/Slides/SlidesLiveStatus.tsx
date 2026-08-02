'use client';

import { useState } from "react";
import { StopCircle, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSlides } from "@/components/Slides/context/SlidesContext";
import { LaptopMinimalCheckIcon } from "@/components/icons/laptop-minimal-check";

export const SlidesLiveStatus = () => {
    const { live, startPresenting, stopPresenting, takeControl } = useSlides();
    const [hovered, setHovered] = useState(false);

    if (!live && !startPresenting) return null;

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
            className="absolute bottom-4 left-4 z-40"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className={cn(
                "flex flex-row items-center gap-2 px-3 py-2 rounded-xl border border-bridge-500/40 backdrop-blur-md transition-opacity",
                "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)] dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
                hovered
                    ? "opacity-100 bg-bridge-50/85 dark:bg-bridge-800/85"
                    : "opacity-45 bg-bridge-50/55 dark:bg-bridge-800/55"
            )}>
                {isLive ? (
                    <>
                        {/* Indicateur connexion SSE */}
                        {isDisconnected && (
                            <span
                                className="text-amber-500"
                                title={live!.connection === "reconnecting" ? "Reconnexion…" : "Hors ligne"}
                            >
                                {live!.connection === "reconnecting"
                                    ? <Wifi className="w-4 h-4 animate-pulse" />
                                    : <WifiOff className="w-4 h-4" />}
                            </span>
                        )}

                        {/* Badge rôle */}
                        <div className="flex items-center gap-1.5 select-none">
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
                                <span className="text-[10px] text-bridge-600/80 dark:text-bridge-300/80">
                                    {isController
                                        ? "Vous contrôlez"
                                        : `Suit ${live!.presenterName ?? "…"}`}
                                </span>
                            </div>
                        </div>

                        {/* Décrochage follower */}
                        {isDetached && (
                            <>
                                <div className="w-px h-5 bg-border/50" />
                                <span className="text-[10px] text-bridge-600/80 dark:text-bridge-300/80">
                                    {live!.paused && live!.drift.direction === "synced"
                                        ? "Navigation libre"
                                        : (driftLabel() ?? "En pause")}
                                </span>
                                <Button
                                    size="sm"
                                    variant="default"
                                    className="h-6 px-2 text-xs cursor-pointer"
                                    onClick={live!.resync}
                                >
                                    Rejoindre
                                </Button>
                            </>
                        )}

                        {/* Reprendre le contrôle */}
                        {takeControl && (
                            <>
                                <div className="w-px h-5 bg-border/50" />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-[10px] cursor-pointer"
                                    onClick={takeControl}
                                    title="Reprendre le contrôle sans redémarrer"
                                >
                                    Reprendre
                                </Button>
                            </>
                        )}

                        {/* Stop */}
                        {isController && (
                            <>
                                <div className="w-px h-5 bg-border/50" />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="cursor-pointer w-7 h-7"
                                    onClick={stopPresenting}
                                    title="Arrêter la présentation"
                                >
                                    <StopCircle className="text-brand-primary dark:text-brand-accent w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </>
                ) : startPresenting ? (
                    /* Pas de session : bouton démarrer */
                    <Button
                        size="sm"
                        variant="ghost"
                        className="cursor-pointer h-7 px-2 gap-1.5 text-xs"
                        onClick={startPresenting}
                        title="Démarrer la présentation en direct"
                    >
                        <LaptopMinimalCheckIcon size={14} />
                        En direct
                    </Button>
                ) : null}
            </div>
        </div>
    );
};
