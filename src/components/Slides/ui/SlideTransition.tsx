'use client';

import React, {type CSSProperties} from 'react';
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
 * Reprend aussi les lignes animées de `SlideTitle` — même mécanique CSS
 * (`hero-grid-line-x/y`), qui se désactive déjà d'elle-même sous
 * `prefers-reduced-motion`. Seul écart assumé : une échelle de titre d'un cran
 * en dessous, pour que la garde de section reste le point haut du deck.
 *
 * Occupe toute la surface de la slide. `SlideBlocksRenderer` la rend donc SANS
 * `SlideScreen` quand elle est seule dans sa slide, sinon les deux fonds — le
 * pont discret de `SlideScreen` et celui-ci — se superposeraient.
 */
// Même jeu de variables que `SlideTitle` : `--hero-accent` pilote la couleur
// des lignes, câblée sur le module comme le reste de la slide.
const heroLineEffectsStyle = {
    "--hero-accent": "var(--module-color)",
    "--hero-grid-x-peak": "0.8",
    "--hero-grid-x-mid": "0.38",
    "--hero-grid-y-peak": "0.7",
    "--hero-grid-y-mid": "0.34",
    "--hero-grid-x-travel": "58vw",
    "--hero-grid-y-travel": "92vh",
    maskImage: "linear-gradient(to right, black 0%, black 72%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(to right, black 0%, black 72%, transparent 100%)",
} as CSSProperties & Record<`--${string}`, string>;

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

        <div
            aria-hidden="true"
            className="hidden sm:block absolute inset-0 z-0 pointer-events-none overflow-hidden"
        >
            <div className="absolute inset-y-0 left-0 w-[78%] overflow-hidden sm:w-[68%] lg:w-[56%]" style={heroLineEffectsStyle}>
                <div
                    className="hero-grid-line-x absolute left-0 top-14 h-px w-32"
                    style={{background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--hero-accent) 50%, transparent), transparent)"}}
                />
                <div
                    className="hero-grid-line-x hero-grid-line-delay-1 absolute left-0 top-28 h-px w-44"
                    style={{background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--hero-accent) 58%, transparent), transparent)"}}
                />
                <div
                    className="hero-grid-line-x hero-grid-line-delay-2 absolute left-0 top-[168px] h-px w-36"
                    style={{background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--hero-accent) 44%, transparent), transparent)"}}
                />
                <div
                    className="hero-grid-line-x hero-grid-line-delay-3 absolute left-0 bottom-20 h-px w-52"
                    style={{background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--hero-accent) 52%, transparent), transparent)"}}
                />
                <div
                    className="hero-grid-line-y absolute left-14 top-0 h-32 w-px"
                    style={{background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--hero-accent) 46%, transparent), transparent)"}}
                />
                <div
                    className="hero-grid-line-y hero-grid-line-delay-1 absolute left-28 top-0 h-36 w-px"
                    style={{background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--hero-accent) 52%, transparent), transparent)"}}
                />
                <div
                    className="hero-grid-line-y hero-grid-line-delay-2 absolute left-[168px] top-0 h-40 w-px"
                    style={{background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--hero-accent) 42%, transparent), transparent)"}}
                />
                <div
                    className="hero-grid-line-y hero-grid-line-delay-3 absolute left-[224px] top-0 h-36 w-px"
                    style={{background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--hero-accent) 56%, transparent), transparent)"}}
                />
            </div>
        </div>

        <div className="relative z-10 w-full max-w-[860px] px-8 md:px-12 lg:px-16 xl:max-w-[920px]">
            {eyebrow && (
                <div className="mb-3 text-[1.5rem] font-extrabold uppercase tracking-[-0.01em] text-(--module-color) dark:text-(--module-color-dark) md:text-[2.4rem] lg:text-[3rem]">
                    {eyebrow}
                </div>
            )}

            <h2 className="text-balance text-[2.4rem] font-extrabold leading-[0.92] tracking-[-0.025em] !text-brand-dark dark:!text-brand-light md:text-[3.6rem] lg:text-[4.8rem]">
                {title}
                <span className="text-(--module-color) dark:text-(--module-color-dark)">.</span>
            </h2>

            <span
                aria-hidden="true"
                className="mt-5 block h-1 w-16 rounded-full bg-(--module-color) dark:bg-(--module-color-dark)"
            />

            {subtitle && (
                <p className="mt-6 max-w-3xl text-[1rem] font-light leading-relaxed text-bridge-600 dark:text-bridge-300 md:text-[1.2rem] lg:text-[1.5rem]">
                    {subtitle}
                </p>
            )}
        </div>
    </div>
);
