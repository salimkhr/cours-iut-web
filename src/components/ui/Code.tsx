"use client";

import React, {useEffect, useState} from "react";
import {useTheme} from "next-themes";
import {cn} from "@/lib/utils";

export default function Code({ className = "", ...props }: React.HTMLAttributes<HTMLElement>) {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const currentTheme = mounted ? (theme === "system" ? systemTheme : theme) : "light";
    const isDark = currentTheme === "dark";

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