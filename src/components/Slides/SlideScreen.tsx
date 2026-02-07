'use client';
import React from 'react';
import {SlideHeading} from "./ui/SlideHeading";
import {SlideNote} from "./ui/SlideNote";

export interface SlideScreenProps {
    title: string;
    children: React.ReactNode;
}

export const SlideScreen: React.FC<SlideScreenProps> = ({title, children}) => {
    // Filtrer les enfants pour ne pas afficher le composant SlideNote dans le flux principal
    const filteredChildren = React.Children.toArray(children).filter(child => {
        if (React.isValidElement(child)) {
            const type = child.type;
            const isSlideNote = type === SlideNote || (typeof type === 'function' && ('displayName' in type && type.displayName === 'SlideNote' || 'name' in type && type.name === 'SlideNote'));
            return !isSlideNote;
        }
        return true;
    });

    return (
        <div className="flex flex-col h-full w-full mx-auto text-card-foreground overflow-y-auto">
            <header className="p-6">
                <SlideHeading level={1}>
                    {title}
                </SlideHeading>
            </header>

            <div className="flex-1 space-y-10 p-6 overflow-hidden">
                {filteredChildren}
            </div>
        </div>
    );
};
