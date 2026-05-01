"use client";

import React from "react";
import {cn} from "@/lib/utils";
import {useIsDark} from "@/hook/useIsDark";

export default function Code({ className = "", ...props }: React.HTMLAttributes<HTMLElement>) {
    const isDark = useIsDark();

    const styles = isDark
        ? "bg-gray-800 text-gray-100"
        : "bg-gray-200 text-gray-900";

    return (
        <code
            className={cn(
                "text-sm px-1.5 py-0.5 rounded font-mono",
                "inline-block",
                "transition-colors duration-300",
                "motion-reduce:transition-none",
                styles,
                className
            )}
            {...props}
        />
    );
}