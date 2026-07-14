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
                // Même fond que les cards (sans le pont)
                "bg-bridge-50 dark:bg-bridge-800",
                "border border-bridge-500/45 dark:border-bridge-500/35",
                "px-3 py-2 h-[52px]",
                "hover:border-bridge-500/65 dark:hover:border-bridge-400/55",
                "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)] dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
                "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-14px_rgba(147,97,58,0.5)] active:translate-y-px dark:hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,0.75)]"
            )}
        >
            {isPrev && (
                <ArrowLeft className="size-4 shrink-0 text-brand-dark dark:text-bridge-100"/>
            )}

            <div className={cn(
                "flex flex-col leading-tight min-w-0 flex-1 overflow-hidden",
                !isPrev && "items-end text-right"
            )}>
                <span className={cn(
                    "text-[10px] uppercase tracking-wider text-brand-dark/60 dark:text-bridge-200/60 flex items-center gap-1 shrink-0",
                    !isPrev && "flex-row-reverse"
                )}>
                    <NotebookPen className="size-3 shrink-0"/>
                    {isPrev ? "Précédente" : "Suivante"}
                </span>

                <span className="text-sm font-semibold text-brand-dark dark:text-bridge-50 truncate w-full">
                    {section.order}. {section.title}
                </span>
            </div>

            {!isPrev && (
                <ArrowRight className="size-4 shrink-0 text-brand-dark dark:text-bridge-100"/>
            )}
        </Link>
    );
}
