'use client';
import React from 'react';
import {SlideHeading} from "./ui/SlideHeading";
import {SlideNote} from "./ui/SlideNote";
import {useSlides} from "@/components/Slides/context/SlidesContext";

export interface SlideScreenProps {
    title: string;
    children: React.ReactNode;
}

export const SlideScreen: React.FC<SlideScreenProps> = ({title, children}) => {
    const {moduleTitle, sectionTitle} = useSlides();

    // Filtrer les enfants pour ne pas afficher le composant SlideNote dans le flux principal
    const filteredChildren = React.Children.toArray(children).filter(child => {
        if (React.isValidElement(child)) {
            const type = child.type;
            const isSlideNote = type === SlideNote || (typeof type === 'function' && ('displayName' in type && type.displayName === 'SlideNote' || 'name' in type && type.name === 'SlideNote'));
            return !isSlideNote;
        }
        return true;
    });

    // L'eyebrow n'apparaît que si le contexte porte l'identité (slides d'un
    // module) ; un Slide.tsx rendu hors de ce contexte affiche juste le titre.
    const eyebrow = [moduleTitle, sectionTitle].filter(Boolean).join(" · ");

    return (
        <div className="flex flex-col h-full w-full mx-auto overflow-y-auto slide-surface">
            <header className="slide-banner">
                {eyebrow && (
                    <div className="slide-banner-eyebrow">{eyebrow}</div>
                )}
                <SlideHeading level={1}>
                    {title}
                </SlideHeading>
            </header>

            <div className="flex-1 slide-body overflow-hidden">
                {filteredChildren}
            </div>
        </div>
    );
};
