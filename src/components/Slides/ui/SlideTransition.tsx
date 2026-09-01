'use client';

import React from 'react';
import {cn} from "@/lib/utils";

interface SlideTransitionProps {
    /** Numéro de partie ou étiquette courte, posée au-dessus du titre. */
    eyebrow?: string;
    title: string;
    /** Sous-titre, sous le filet. Une ligne, pas un paragraphe. */
    subtitle?: string;
    className?: string;
}

/**
 * Écran d'annonce entre deux parties du deck. Il ne porte aucun contenu
 * pédagogique : sa fonction est de marquer une rupture, comme la page de garde
 * d'un chapitre.
 *
 * Reprend la direction artistique de `SlideTitle`, la garde de section : même
 * photo de pont en fond, même dégradé, même titre géant ponctué de la couleur
 * du module, même filet. C'est voulu — une transition est une garde de partie,
 * elle doit se lire comme une petite sœur de la garde de section, pas comme une
 * slide de contenu.
 *
 * Deux écarts assumés avec `SlideTitle` : pas de lignes animées (une transition
 * dure trois secondes, l'animation n'a pas le temps de servir et coûte à qui
 * demande `prefers-reduced-motion`), et une échelle de titre d'un cran en
 * dessous, pour que la garde de section reste le point haut du deck.
 *
 * Occupe toute la surface de la slide. `SlideBlocksRenderer` la rend donc SANS
 * `SlideScreen` quand elle est seule dans sa slide, sinon les deux fonds — le
 * pont discret de `SlideScreen` et celui-ci — se superposeraient.
 */
export const SlideTransition: React.FC<SlideTransitionProps> = ({
                                                                    eyebrow,
                                                                    title,
                                                                    subtitle,
                                                                    className,
                                                                }) => (
    <div
        className={cn(
            "relative flex h-full w-full self-stretch items-center overflow-hidden",
            "bg-bridge-50 bg-cover bg-right-bottom bg-no-repeat bg-[url('/images/header/pont-light.png')]",
            "dark:bg-bridge-900 dark:bg-[url('/images/header/pont-dark.png')]",
            className,
        )}
    >
        {/* Le pont est décoratif : il ne porte aucune information que le texte
            ne donne pas, d'où l'absence de rôle et le retrait du flux a11y. */}
        <div
            aria-hidden="true"
            className="absolute inset-0 z-0 bg-linear-to-b from-bridge-50 via-bridge-50/95 to-bridge-50/76 dark:from-bridge-900 dark:via-bridge-900/96 dark:to-bridge-900/82 lg:bg-linear-to-r lg:from-bridge-50 lg:via-bridge-50/88 lg:to-transparent lg:dark:from-bridge-900 lg:dark:via-bridge-900/90 lg:dark:to-bridge-900/28"
        />

        <div className="relative z-10 w-full max-w-[860px] px-8 md:px-12 lg:px-16 xl:max-w-[920px]">
            {eyebrow && (
                <div className="mb-3 text-3xl font-extrabold uppercase tracking-[-0.01em] text-(--module-color) dark:text-(--module-color-dark) md:text-5xl lg:text-6xl">
                    {eyebrow}
                </div>
            )}

            <h2 className="text-balance text-5xl font-extrabold leading-[0.92] tracking-[-0.025em] !text-brand-dark dark:!text-brand-light md:text-7xl lg:text-8xl">
                {title}
                <span className="text-(--module-color) dark:text-(--module-color-dark)">.</span>
            </h2>

            <span
                aria-hidden="true"
                className="mt-5 block h-1 w-16 rounded-full bg-(--module-color) dark:bg-(--module-color-dark)"
            />

            {subtitle && (
                <p className="mt-6 max-w-3xl text-xl font-light leading-relaxed text-bridge-600 dark:text-bridge-300 md:text-2xl lg:text-3xl">
                    {subtitle}
                </p>
            )}
        </div>
    </div>
);
