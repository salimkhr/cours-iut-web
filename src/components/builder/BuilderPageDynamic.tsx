"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { BuilderPage as BuilderPageType } from "@/components/builder/BuilderPage";

function BuilderSkeleton() {
    return (
        <div className="flex flex-col h-[calc(100dvh-var(--navbar-h))] overflow-hidden animate-pulse">
            <header className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-bridge-500/20 dark:border-bridge-500/35 bg-bridge-50/90 dark:bg-bridge-900/90">
                <div className="h-3.5 w-10 rounded bg-bridge-300/60 dark:bg-bridge-700/50" />
                <div className="w-px h-8 bg-bridge-400/25 shrink-0" />
                <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-36 rounded bg-bridge-300/60 dark:bg-bridge-700/50" />
                    <div className="h-2.5 w-20 rounded bg-bridge-300/50 dark:bg-bridge-700/40" />
                </div>
            </header>
            <div className="flex-1 bg-bridge-50/30 dark:bg-bridge-900/20" />
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
