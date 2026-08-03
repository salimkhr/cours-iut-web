'use client';

import React, {type CSSProperties} from 'react';
import Module from "@/types/Module";
import Section from "@/types/Section";
import TagsBadges from "@/components/page/TagsBadges";
import {slideTextSizes} from "@/components/Slides/ui/config/slideConfig";

interface SlideTitleProps {
    module: Module;
    section: Section;
}

export const SlideTitle: React.FC<SlideTitleProps> = ({module, section}) => {
    const order = section.order ?? 1;
    const orderLabel = String(order).padStart(2, "0");
    const keyObjectives = (section.objectives ?? [])
        .map((objective) => objective.trim())
        .filter((objective) => objective.length > 0)
        .slice(0, 2);
    const heroLineEffectsStyle = {
        "--hero-accent": "var(--module-color)",
        "--hero-grid-x-peak": "0.58",
        "--hero-grid-x-mid": "0.26",
        "--hero-grid-y-peak": "0.48",
        "--hero-grid-y-mid": "0.22",
        "--hero-grid-x-travel": "58vw",
        "--hero-grid-y-travel": "92vh",
        maskImage: "linear-gradient(to right, black 0%, black 72%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, black 0%, black 72%, transparent 100%)",
    } as CSSProperties & Record<`--${string}`, string>;

    return (
        <section
            aria-label="Pont en bois clair traverse par la lumiere"
            className="relative flex h-screen w-full overflow-hidden bg-bridge-50 bg-no-repeat bg-right-bottom bg-cover bg-[url('/images/header/pont-light.png')] dark:bg-bridge-900 dark:bg-[url('/images/header/pont-dark.png')]"
        >
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

            <div className="relative z-10 flex min-h-full w-full items-center px-6 py-10 sm:px-10 lg:pl-32 lg:pr-14 xl:pl-44">
                <div className="w-full max-w-[860px] xl:max-w-[920px]">
                    <div className="mb-5 flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-dark/70 dark:text-bridge-100/75 md:text-base lg:text-lg">
                        <span>{module.title}</span>
                        <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full bg-(--module-color) dark:bg-(--module-color-dark)"
                        />
                        <span>Section {orderLabel}</span>
                    </div>

                    <h2 className="max-w-5xl text-balance text-5xl font-extrabold leading-[0.9] tracking-normal !text-brand-dark dark:!text-brand-light sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
                        {section.title}
                        <span className="text-(--module-color) dark:text-(--module-color-dark)">.</span>
                    </h2>

                    <span
                        aria-hidden="true"
                        className="block h-1 w-16 mt-5 rounded-full bg-(--module-color) dark:bg-(--module-color-dark)"
                    />

                    {section.description && (
                        <p className="mt-6 max-w-3xl text-xl font-normal leading-relaxed text-bridge-600 dark:text-bridge-300 md:text-2xl lg:text-3xl">
                            {section.description}
                        </p>
                    )}

                    {keyObjectives.length > 0 && (
                        <div className="mt-10 max-w-4xl border-t border-bridge-500/35 pt-5 dark:border-bridge-400/30">
                            <div className={`${slideTextSizes.title.module} text-brand-dark/60 dark:text-bridge-100/65`}>
                                À retenir
                            </div>
                            <div className="mt-2 grid gap-2 text-lg font-semibold leading-snug text-brand-dark dark:text-brand-light md:text-xl">
                                {keyObjectives.map((objective) => (
                                    <p key={objective}>
                                        {objective}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {section.tags && section.tags.length > 0 && (
                        <div className="mt-8 [&>div]:!animate-none [&>div]:!justify-start [&>div]:!opacity-100">
                            <TagsBadges tags={section.tags} moduleTheme={module.title}/>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
