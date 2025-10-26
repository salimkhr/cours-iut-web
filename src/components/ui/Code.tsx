"use client";

import React, {useEffect, useState} from "react";
import {useTheme} from "next-themes";
import {cn} from "@/lib/utils";

export default function Code({ className = "", ...props }: React.HTMLAttributes<HTMLElement>) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const isDark = theme === "dark";
    const bgColor = isDark ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-800";

    return <code className={cn("text-sm px-1 rounded font-mono", bgColor, className)} {...props} />;
}
