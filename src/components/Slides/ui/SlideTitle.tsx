'use client';

import React from 'react';
import Module from "@/types/Module";
import Section from "@/types/Section";
import TagsBadges from "@/components/page/TagsBadges";
import {slideTextSizes} from "@/components/Slides/ui/config/slideConfig";
import {useMounted} from "@/hook/useMounted";

interface SlideTitleProps {
    module: Module;
    section: Section;
}

export const SlideTitle: React.FC<SlideTitleProps> = ({module, section}) => {
    const mounted = useMounted();

    if (!mounted) return null;

    const order = section.order ?? 1;

    return (
        <div className="relative flex w-full h-screen overflow-hidden slide-surface">
            {/* Colonne pont — 36 % de la largeur, fondu vers le fond de slide */}
            <div
                className="relative hidden md:block w-[36%] shrink-0 bg-cover bg-center bg-[url('/images/header/pont-light.png')] dark:bg-[url('/images/header/pont-dark.png')]"
                role="img"
                aria-label="Pont en bois clair traversé par la lumière"
            >
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-bridge-50 dark:to-bridge-900"
                />
                {/* Numéro de section ancré dans l'image, en couleur module */}
                <div className="absolute left-6 bottom-6 z-10">
                    <div
                        className={`${slideTextSizes.title.module} text-brand-dark/75 dark:text-bridge-100/80 mb-1`}
                    >
                        {module.title}
                    </div>
                    <div
                        className="font-mono font-bold leading-[0.85] text-6xl lg:text-7xl text-(--module-color) dark:text-(--module-color-dark)"
                    >
                        {String(order).padStart(2, "0")}
                    </div>
                </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12">
                {/* Sur mobile la colonne pont est masquée : l'identité module
                    revient ici pour ne pas perdre le repère. */}
                <div className={`${slideTextSizes.title.module} text-brand-dark/70 dark:text-bridge-100/75 mb-2 md:hidden`}>
                    {module.title}
                </div>

                <h2 className={`${slideTextSizes.title.section} !text-brand-dark dark:!text-brand-light`}>
                    {section.title}
                    <span className="text-(--module-color) dark:text-(--module-color-dark)">.</span>
                </h2>

                <span
                    aria-hidden="true"
                    className="block h-1 w-16 mt-4 rounded-full bg-(--module-color) dark:bg-(--module-color-dark)"
                />

                {section.description && (
                    <p className={`${slideTextSizes.title.description} mt-5 max-w-2xl leading-relaxed text-bridge-600 dark:text-bridge-300`}>
                        {section.description}
                    </p>
                )}

                {section.tags && section.tags.length > 0 && (
                    <div className="mt-8 [&>div]:!justify-start">
                        <TagsBadges tags={section.tags} moduleTheme={module.title}/>
                    </div>
                )}
            </div>
        </div>
    );
};
