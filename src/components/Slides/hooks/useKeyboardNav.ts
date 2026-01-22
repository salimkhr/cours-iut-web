'use client';

import {useEffect} from "react";

interface KeyboardNavOptions {
    next: () => void;
    prev: () => void;
    toggleFullscreen: () => void;
}

export function useKeyboardNav({
                                   next,
                                   prev,
                                   toggleFullscreen,
                               }: KeyboardNavOptions) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case "ArrowRight":
                case "ArrowDown":
                case " ":
                    event.preventDefault();
                    next();
                    break;

                case "ArrowLeft":
                case "ArrowUp":
                    event.preventDefault();
                    prev();
                    break;

                case "f":
                case "F":
                case "F11":
                    event.preventDefault();
                    toggleFullscreen();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [next, prev, toggleFullscreen]);
}
