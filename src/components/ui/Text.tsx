"use client";

import React, {useEffect, useState} from "react";
import {useTheme} from "next-themes";
import {cn} from "@/lib/utils";

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    variant: "default" | "muted" | "light";
}

export default function Text({ className = "", variant = "default", ...props }: TextProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null; // SSR safe

    const isDark = theme === "dark";

    const variants: Record<TextProps["variant"], string> = {
        default: isDark ? "text-gray-200" : "text-gray-700",
        muted: isDark ? "text-gray-400" : "text-gray-500",
        light: isDark ? "text-gray-300" : "text-gray-600",
    };

    return (
        <p className={cn(variants[variant], "transition-colors duration-300", className)} {...props} />
    );
}
