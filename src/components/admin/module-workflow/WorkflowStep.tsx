"use client";

import type {ReactNode} from "react";
import {Check, Circle} from "lucide-react";
import {cn} from "@/lib/utils";
import type {StepState} from "@/lib/pedagogy/moduleProgress";

interface WorkflowStepProps {
    label: string;
    state: StepState;
    /** Prompt MCP (skill module-design) qui pilote cette étape, si un agent doit la prendre en charge. */
    promptId?: string;
    promptDescription?: string;
    children: ReactNode;
}

export default function WorkflowStep({label, state, promptId, promptDescription, children}: WorkflowStepProps) {
    const done = state === "done";
    const Icon = done ? Check : Circle;

    return (
        <section className="rounded-lg border border-bridge-500/45 bg-card">
            <div className="flex min-h-11 flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Icon
                        className={cn("size-4 shrink-0", done ? "text-bridge-700 dark:text-bridge-200" : "text-brand-accent-dark")}
                        aria-hidden="true"
                    />
                    <span className="text-sm font-semibold text-brand-dark dark:text-bridge-100">
                        {label}
                    </span>
                </div>
                {promptId && (
                    <span
                        className="inline-flex shrink-0 items-center rounded-full bg-bridge-100 px-2.5 py-1 font-mono text-[11px] text-bridge-700 dark:bg-bridge-900 dark:text-bridge-200"
                        title={promptDescription ? `Prompt MCP : ${promptDescription}` : "Prompt MCP"}
                    >
                        {promptId}
                    </span>
                )}
            </div>
            <div className="border-t border-bridge-500/20 px-4 py-4">
                {children}
            </div>
        </section>
    );
}
