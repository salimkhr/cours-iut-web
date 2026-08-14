"use client";

import type {ReactNode} from "react";
import {Check, ChevronDown, Circle} from "lucide-react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {cn} from "@/lib/utils";
import type {StepState} from "@/lib/pedagogy/moduleProgress";

interface WorkflowStepProps {
    label: string;
    summary?: string;
    state: StepState;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}

export default function WorkflowStep({label, summary, state, open, onOpenChange, children}: WorkflowStepProps) {
    const done = state === "done";
    const Icon = done ? Check : Circle;

    return (
        <Collapsible open={open} onOpenChange={onOpenChange}>
            <section className="rounded-lg border border-bridge-500/45 bg-card">
                <CollapsibleTrigger
                    className={cn(
                        "flex min-h-11 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left",
                        "transition-colors duration-200 hover:bg-bridge-100/40 dark:hover:bg-bridge-900/30",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
                    )}
                >
                    <Icon
                        className={cn("size-4 shrink-0", done ? "text-bridge-700 dark:text-bridge-200" : "text-brand-accent-dark")}
                        aria-hidden="true"
                    />
                    <span className="flex-1 text-sm font-semibold text-brand-dark dark:text-bridge-100">
                        {label}
                    </span>
                    {summary && !open && (
                        <span className="hidden truncate text-xs text-bridge-600 sm:block dark:text-bridge-400">
                            {summary}
                        </span>
                    )}
                    <ChevronDown
                        className={cn("size-4 shrink-0 transition-transform duration-200", open && "rotate-180")}
                        aria-hidden="true"
                    />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t border-bridge-500/20 px-4 py-4">
                    {children}
                </CollapsibleContent>
            </section>
        </Collapsible>
    );
}
