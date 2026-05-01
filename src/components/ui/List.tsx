"use client";

import React from "react";
import {cn} from "@/lib/utils";
import {useIsDark} from "@/hook/useIsDark";

type ListProps = React.HTMLAttributes<HTMLUListElement | HTMLOListElement> & {
    ordered?: boolean;
    className?: string;
    type?: "square" | "decimal" | "disc";
    start?: number;
    spacing?: "compact" | "default" | "relaxed";
};

export function List({
                         ordered = false,
                         className = "",
                         type,
                         spacing = "default",
                         ...props
                     }: ListProps) {
    const Component = ordered ? "ol" : "ul";

    const spacingClasses = {
        compact: "space-y-1",
        default: "space-y-2",
        relaxed: "space-y-3"
    };

    const baseClasses = type !== undefined
        ? `list-[${type}] pl-6 marker:text-current`
        : ordered
            ? "list-decimal pl-6 marker:text-current"
            : "list-disc pl-6 marker:text-current";

    return (
        <Component
            className={cn(
                baseClasses,
                spacingClasses[spacing],
                "motion-reduce:transition-none",
                className
            )}
            {...props}
        />
    );
}

type ListItemProps = React.LiHTMLAttributes<HTMLLIElement> & {
    variant?: "default" | "muted";
};

export function ListItem({
                             className = "",
                             variant = "default",
                             ...props
                         }: ListItemProps) {
    const isDark = useIsDark();

    const variants = {
        default: isDark ? "text-gray-100" : "text-gray-900",
        muted: isDark ? "text-gray-400" : "text-gray-600"
    };

    return (
        <li
            className={cn(
                variants[variant],
                "leading-relaxed", // Améliore la lisibilité
                "transition-colors duration-300",
                "motion-reduce:transition-none",
                className
            )}
            {...props}
        />
    );
}