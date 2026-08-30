'use client';

import React from 'react';
import Image from "next/image";
import {cn} from "@/lib/utils";

interface SlideImageProps {
    src: string;
    title?: string;
    alt?: string;
    className?: string;
}

/**
 * Image projetée. Distincte d'`ImageCard` (le bloc des cours), qui s'inscrit
 * dans le flux d'une page et occupe toute la largeur disponible : sur une slide,
 * la contrainte qui compte est la HAUTEUR, puisque le contenu doit tenir dans un
 * écran sans défilement. D'où `max-h` plutôt qu'une largeur imposée, et le
 * `h-auto`/`w-auto` qui laisse le ratio intact.
 */
export const SlideImage: React.FC<SlideImageProps> = ({src, title, alt, className}) => {
    const url = src.trim();
    if (!url) return null;

    return (
        <figure className={cn("flex min-h-0 flex-col items-center gap-3 mb-6", className)}>
            <Image
                src={url}
                alt={alt ?? title ?? ''}
                width={1600}
                height={1200}
                unoptimized
                className="h-auto w-auto max-h-[55vh] max-w-full rounded-lg object-contain shadow-lg"
            />
            {title && (
                <figcaption className="text-center text-lg text-bridge-600 dark:text-bridge-300">
                    {title}
                </figcaption>
            )}
        </figure>
    );
};
