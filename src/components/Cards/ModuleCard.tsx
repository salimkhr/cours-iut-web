'use client';

import {BookOpen} from 'lucide-react';
import Module from "@/types/Module";
import iconMap from "@/lib/iconMap";
import {cn} from "@/lib/utils";


interface ModuleCardProps {
    currentModule: Module;
}

export default function ModuleCard({currentModule}: ModuleCardProps) {
    const {title, description, path, iconName} = currentModule;
    const Icon = iconMap[iconName] || BookOpen;

    return (
        <article
            className={cn(
                "group relative h-full flex flex-col gap-5 p-6 lg:p-8",
                "bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark",
                "rounded-2xl border border-brand-gray-700/60 dark:border-brand-gray-300/60",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1 hover:shadow-xl hover:border-transparent",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            )}
        >
            <div
                className={cn(
                    "flex items-center justify-center w-14 h-14 rounded-xl text-white shadow-sm",
                    `bg-${path}`
                )}
            >
                <Icon size={28}/>
            </div>

            <div className="flex flex-col gap-2 flex-grow">
                <h3 className={cn("text-2xl font-bold tracking-tight", `text-${path}`)}>
                    {title}
                </h3>
                {description && (
                    <p className="text-sm leading-relaxed text-brand-gray-300 dark:text-brand-gray-700">
                        {description}
                    </p>
                )}
            </div>

            <span
                className="inline-flex items-center justify-center gap-2 rounded-lg border-[3px] border-brand-primary text-brand-light dark:text-brand-dark group-hover:bg-brand-primary group-hover:text-white px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 mt-auto">
                Voir les cours
                <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4 text-brand-primary group-hover:text-white transition-all duration-300 group-hover:translate-x-1"
                >
                    <path d="M5 12h14"/>
                    <path d="M13 5l7 7-7 7"/>
                </svg>
            </span>
        </article>
    );
}
