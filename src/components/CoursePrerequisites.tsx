"use client"

import React from "react"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface CoursePrerequisitesProps {
    children: React.ReactNode
}

export default function CoursePrerequisites({ children }: CoursePrerequisitesProps) {
    return (
        <Collapsible className="mb-8 rounded-xl border border-bridge-300/50 bg-bridge-100/60 dark:bg-bridge-800/40 dark:border-bridge-600/40">
            <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-4 font-semibold text-brand-dark dark:text-brand-light cursor-pointer">
                À savoir pour ce cours
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-5 pb-5 flex flex-col gap-3">
                {children}
            </CollapsibleContent>
        </Collapsible>
    )
}
