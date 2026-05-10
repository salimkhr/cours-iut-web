import Link from "next/link";
import {ArrowLeft, ArrowRight, NotebookPen} from "lucide-react";
import {cn} from "@/lib/utils";
import Section from "@/types/Section";

interface SectionNavCardProps {
    href: string;
    direction: "prev" | "next";
    section: Section;
}

export default function SectionNavCard({href, direction, section}: SectionNavCardProps) {
    const isPrev = direction === "prev";

    return (
        <Link
            href={href}
            className={cn(
                "group/nav flex items-center gap-3 rounded-xl",
                "w-full min-w-0",
                "bg-bridge-300 border border-bridge-500/45",
                "dark:bg-bridge-800 dark:border-bridge-500/35",
                "px-3 py-2 h-[52px]",
                "hover:bg-bridge-200 dark:hover:bg-bridge-700",
                "transition-all duration-300"
            )}
        >
            {isPrev && (
                <ArrowLeft className="w-4 h-4 shrink-0 text-brand-dark dark:text-bridge-100"/>
            )}

            <div className={cn(
                "flex flex-col leading-tight min-w-0 flex-1 overflow-hidden",
                !isPrev && "items-end text-right"
            )}>
                <span className={cn(
                    "text-[10px] uppercase tracking-wider text-brand-dark/60 dark:text-bridge-200/60 flex items-center gap-1 shrink-0",
                    !isPrev && "flex-row-reverse"
                )}>
                    <NotebookPen className="w-3 h-3 shrink-0"/>
                    {isPrev ? "Précédente" : "Suivante"}
                </span>

                <span className="text-sm font-semibold text-brand-dark dark:text-bridge-50 truncate w-full">
                    {section.order}. {section.title}
                </span>
            </div>

            {!isPrev && (
                <ArrowRight className="w-4 h-4 shrink-0 text-brand-dark dark:text-bridge-100"/>
            )}
        </Link>
    );
}
