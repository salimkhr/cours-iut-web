"use client";

import React from "react";
import {cn} from "@/lib/utils";

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
        compact: "[&>*+*]:mt-1",
        default: "[&>*+*]:mt-2",
        relaxed: "[&>*+*]:mt-3"
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
    const variants = {
        default: "text-brand-dark dark:text-bridge-100",
        muted: "text-brand-dark/60 dark:text-bridge-200/65"
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
