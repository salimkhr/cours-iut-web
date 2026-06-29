'use client';

import { ChevronLeft, ChevronRight, Copy, Maximize, Minimize, QrCode, Share2, StopCircle, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
    const [copied, setCopied] = useState(false);

    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}`;

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({ url: currentUrl }).catch(() => null);
        } else {
            await navigator.clipboard.writeText(currentUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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
                "flex items-center gap-2 p-2 rounded-xl border backdrop-blur-md transition-opacity",
                hovered ? "opacity-100 bg-background/70" : "opacity-40 bg-background/40"
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
                            <span className={cn(
                                "w-2 h-2 rounded-full shrink-0",
                                isController ? "bg-red-500 animate-pulse" : "bg-green-500"
                            )} />
                            <div className="flex flex-col leading-none">
                                <span className={cn(
                                    "text-xs font-semibold",
                                    isController ? "text-red-500" : "text-green-600 dark:text-green-400"
                                )}>
                                    {isController ? "Leader" : "Suiveur"}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
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
                            <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] cursor-pointer" onClick={takeControl}>
                                Reprendre
                            </Button>
                        )}

                        {isController && (
                            <Button size="icon" variant="ghost" className="cursor-pointer" onClick={stopPresenting} title="Arrêter la présentation">
                                <StopCircle className="text-red-500" />
                            </Button>
                        )}

                        <div className="w-px h-6 bg-border/50" />
                    </>
                ) : startPresenting ? (
                    <>
                        <Button size="icon" variant="ghost" className="cursor-pointer" onClick={startPresenting} title="Démarrer la présentation en direct">
                            <LaptopMinimalCheckIcon size={18} />
                        </Button>
                        <div className="w-px h-6 bg-border/50" />
                    </>
                ) : null}

                {/* ── QR / Partager ───────────────────────────────────────────────── */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button size="icon" variant="ghost" className="cursor-pointer" title="Envoyer le lien sur téléphone">
                            <QrCode />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" className="w-auto p-4 flex flex-col items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrUrl} alt="QR code" width={180} height={180} className="rounded-lg" />
                        <p className="text-xs text-muted-foreground text-center">Scannez pour ouvrir sur votre téléphone</p>
                        <Button size="sm" variant="outline" className="w-full gap-2 cursor-pointer" onClick={handleShare}>
                            {copied ? <Copy className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                            {copied ? "Copié !" : "Partager / Copier"}
                        </Button>
                    </PopoverContent>
                </Popover>

                <div className="w-px h-6 bg-border/50" />

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
