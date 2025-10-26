"use client";

import React, {useEffect, useState} from "react";
import {useTheme} from "next-themes";
import {cn} from "@/lib/utils";

type ListProps = React.HTMLAttributes<HTMLUListElement | HTMLOListElement> & {
    ordered?: boolean; // true pour <ol>, false ou undefined pour <ul>
    className?: string;
    type?: undefined | "square" | "decimal" | "disc";
    start?: number;
};

export function List({ ordered = false, className = "", type, ...props }: ListProps) {
    const Component = ordered ? "ol" : "ul";
    const baseClasses =
        type !== undefined
            ? `list-[${type}] pl-6`
            : ordered
                ? "list-decimal pl-6"
                : "list-disc pl-6";

    return <Component className={cn(baseClasses, className)} {...props} />;
}

type ListItemProps = React.LiHTMLAttributes<HTMLLIElement>;

export function ListItem({ className = "", ...props }: ListItemProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null; // SSR safe

    const isDark = theme === "dark";
    const textColor = isDark ? "text-gray-300" : "text-gray-700";

    return <li className={cn("mb-2", textColor, className)} {...props} />;
}
