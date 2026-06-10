"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { BuilderPage as BuilderPageType } from "@/components/builder/BuilderPage";

const BuilderPage = dynamic(
    () => import("@/components/builder/BuilderPage").then((m) => m.BuilderPage),
    { ssr: false }
);

export function BuilderPageDynamic(props: ComponentProps<typeof BuilderPageType>) {
    return <BuilderPage {...props} />;
}
