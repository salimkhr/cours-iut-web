"use client";

import React, {Children, cloneElement, isValidElement, ReactElement, useEffect, useRef, useState,} from "react";
import {SlideProps} from "./SlideScreen";
import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight, Maximize2, Minimize2} from "lucide-react";

type SlidesProps = {
    children: React.ReactNode;
};

const SlidesScreen: React.FC<SlidesProps> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [hovered, setHovered] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const slidesArray = Children.toArray(children).filter(
        (child): child is ReactElement<SlideProps> => isValidElement(child)
    );
    const totalSlides = slidesArray.length;

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem("currentSlide");
        if (saved) setCurrentIndex(parseInt(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("currentSlide", currentIndex.toString());
    }, [currentIndex]);

    // Navigation clavier
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") nextSlide();
            if (e.key === "ArrowLeft") prevSlide();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex]);

    // Écoute les changements de fullscreen
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement === containerRef.current);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const nextSlide = () => setCurrentIndex((prev) => Math.min(prev + 1, totalSlides - 1));
    const prevSlide = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen().catch(console.error);
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative bg-gray-50"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Slides */}
            <div className="flex-1 relative">
                {slidesArray.map((slide, index) =>
                    cloneElement(slide, {
                        className: `absolute inset-0 transition-opacity duration-500 ${
                            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`,
                    })
                )}
            </div>

            {/* Actions en bas à droite */}
            <div
                className={`absolute bottom-4 right-4 flex flex-col items-end gap-2 transition-opacity duration-300 ${
                    hovered ? "opacity-100" : "opacity-0"
                } pointer-events-auto`}
            >
                <div className="flex gap-2">
                    <Button onClick={prevSlide} disabled={currentIndex === 0}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button onClick={nextSlide} disabled={currentIndex === totalSlides - 1}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button onClick={toggleFullscreen}>
                        {isFullscreen ? (
                            <Minimize2 className="w-4 h-4" />
                        ) : (
                            <Maximize2 className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Points de progression verticaux centrés */}
            <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-2">
                {slidesArray.map((_, index) => (
                    <span
                        key={index}
                        className={`block w-3 h-3 rounded-full transition-colors ${
                            index === currentIndex ? "bg-blue-600" : "bg-gray-300"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default SlidesScreen;
