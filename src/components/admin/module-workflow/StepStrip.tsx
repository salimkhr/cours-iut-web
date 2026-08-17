"use client";

import {Check} from "lucide-react";
import {cn} from "@/lib/utils";
import type {ModuleStep, StepId} from "@/lib/pedagogy/moduleProgress";

interface StepStripProps {
    steps: ModuleStep[];
    currentId: StepId;
    onSelect: (id: StepId) => void;
}

export default function StepStrip({steps, currentId, onSelect}: StepStripProps) {
    return (
        <nav aria-label="Étapes de conception du module" className="flex flex-col gap-2">
            <ol className="flex flex-wrap items-center gap-1.5">
                {steps.map((step, index) => {
                    const active = step.id === currentId;
                    const done = step.state === "done";
                    return (
                        <li key={step.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(step.id)}
                                aria-current={active ? "step" : undefined}
                                aria-label={`${step.label} — ${done ? "franchie" : "à faire"}`}
                                className={cn(
                                    "inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm font-semibold",
                                    "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2",
                                    "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                                    active
                                        ? "bg-brand-primary text-white"
                                        : "text-brand-dark hover:bg-bridge-100 dark:text-bridge-200 dark:hover:bg-bridge-900",
                                )}
                            >
                                <span
                                    className={cn(
                                        "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                                        active
                                            ? "bg-white/25 text-white"
                                            : done
                                                ? "bg-brand-accent-dark text-white dark:bg-brand-primary"
                                                : "bg-bridge-200 text-brand-dark dark:bg-bridge-700 dark:text-bridge-200",
                                    )}
                                    aria-hidden="true"
                                >
                                    {done ? <Check className="size-3"/> : index + 1}
                                </span>
                                {step.label}
                            </button>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
