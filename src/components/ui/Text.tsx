"use client";

import React from "react";
import {cn} from "@/lib/utils";
import {useIsDark} from "@/hook/useIsDark";

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    variant?: "default" | "muted" | "light";
    as?: "p" | "span" | "div";
}

export default function Text({
                         className = "",
                         variant = "default",
                         as: Component = "p",
                         ...props
                     }: TextProps) {
    const isDark = useIsDark();

    const variants: Record<NonNullable<TextProps["variant"]>, string> = {
        // Increased contrast ratios for WCAG AA compliance
        default: isDark ? "text-gray-100" : "text-gray-900",
        muted: isDark ? "text-gray-400" : "text-gray-600",
        light: isDark ? "text-gray-300" : "text-gray-700",
    };

    return (
        <Component
            className={cn(
                variants[variant],
                "transition-colors duration-300",
                "motion-reduce:transition-none",
                className
            )}
            {...props}
        />
    );
}