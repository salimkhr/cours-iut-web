"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { BuilderPage as BuilderPageType } from "@/components/builder/BuilderPage";

function BuilderSkeleton() {
    return (
        <div className="flex flex-col h-[calc(100dvh-var(--navbar-h))] overflow-hidden animate-pulse">
            {/* Toolbar */}
            <header className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-bridge-500/20 dark:border-bridge-500/35 bg-bridge-50/90 dark:bg-bridge-900/90">
                <div className="h-3.5 w-10 rounded bg-bridge-300/60 dark:bg-bridge-700/50" />
                <div className="w-px h-8 bg-bridge-400/25 dark:bg-bridge-500/30 shrink-0" />
                <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-36 rounded bg-bridge-300/60 dark:bg-bridge-700/50" />
                    <div className="h-2.5 w-20 rounded bg-bridge-300/50 dark:bg-bridge-700/40" />
                </div>
                <div className="ml-auto h-8 w-28 rounded-md bg-bridge-300/60 dark:bg-bridge-700/50" />
            </header>

            {/* Builder area */}
            <div className="flex flex-1 min-h-0">
                {/* Canvas */}
                <div className="flex-1 p-4 space-y-3 bg-bridge-100/20 dark:bg-bridge-900/40">
                    <div className="h-20 rounded-lg bg-bridge-300/40 dark:bg-bridge-700/35" />
                    <div className="h-14 rounded-lg bg-bridge-300/40 dark:bg-bridge-700/35" />
                    <div className="h-28 rounded-lg bg-bridge-300/40 dark:bg-bridge-700/35" />
                    <div className="h-16 rounded-lg bg-bridge-300/40 dark:bg-bridge-700/35" />
                </div>

                {/* PropsPanel */}
                <div className="w-64 border-l border-bridge-500/20 dark:border-bridge-500/35 bg-bridge-50/80 dark:bg-bridge-900/80 flex-shrink-0 p-4 space-y-3">
                    <div className="h-3.5 w-28 rounded bg-bridge-300/60 dark:bg-bridge-700/50" />
                    <div className="h-px bg-bridge-400/20 dark:bg-bridge-600/20" />
                    <div className="h-8 rounded bg-bridge-300/40 dark:bg-bridge-700/35" />
                    <div className="h-8 rounded bg-bridge-300/40 dark:bg-bridge-700/35" />
                    <div className="h-8 rounded bg-bridge-300/40 dark:bg-bridge-700/35" />
                    <div className="mt-2 h-px bg-bridge-400/20 dark:bg-bridge-600/20" />
                    <div className="h-6 w-20 rounded bg-bridge-300/40 dark:bg-bridge-700/35" />
                    <div className="h-6 w-16 rounded bg-bridge-300/40 dark:bg-bridge-700/35" />
                </div>
            </div>
        </div>
    );
}

const BuilderPage = dynamic(
    () => import("@/components/builder/BuilderPage").then((m) => m.BuilderPage),
    { ssr: false, loading: () => <BuilderSkeleton /> }
);

export function BuilderPageDynamic(props: ComponentProps<typeof BuilderPageType>) {
    return <BuilderPage {...props} />;
}
