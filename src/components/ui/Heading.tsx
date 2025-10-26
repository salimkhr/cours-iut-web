"use client";

import {cn} from "@/lib/utils";
import {JSX, useEffect, useState} from "react";
import {Film} from "lucide-react";
import Text from "./Text";
import {useTheme} from "next-themes";

type HeadingProps = {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
    children: React.ReactNode;
    netflex?: boolean; // Nouvelle prop
};

export default function Heading({
                                    level = 2,
                                    className = "",
                                    children,
                                    netflex = false,
                                }: HeadingProps) {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null; // SSR safe

    const isDark = theme === "dark";

    const styles: Record<number, string> = {
        1: `text-5xl font-bold my-6 ${isDark ? "text-gray-200" : "text-gray-900"}`,
        2: `text-3xl font-bold mt-5 mb-2 ${isDark ? "text-gray-200" : "text-gray-900"}`,
        3: `text-2xl font-bold mt-4 mb-2 ${isDark ? "text-gray-200" : "text-gray-900"}`,
        4: `text-xl font-semibold mt-3 mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`,
        5: `text-lg font-semibold my-2 ${isDark ? "text-gray-300" : "text-gray-700"}`,
        6: `text-base font-medium my-2 ${isDark ? "text-gray-300" : "text-gray-700"}`,
    };

    return (
        <Tag className={cn(styles[level], className)}>
            {children}
            {netflex && (
                <Text className="inline-block ml-2" variant="muted">
                    <Film className="inline-block" />
                </Text>
            )}
        </Tag>
    );
}
