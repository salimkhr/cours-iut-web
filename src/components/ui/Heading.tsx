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
    netflex?: boolean;
    id?: string; // Pour les ancres de navigation
};

export default function Heading({
                                    level = 2,
                                    className = "",
                                    children,
                                    netflex = false,
                                    id,
                                }: HeadingProps) {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Determine actual theme with fallback
    const currentTheme = mounted ? (theme === "system" ? systemTheme : theme) : "light";
    const isDark = currentTheme === "dark";

    const styles: Record<number, string> = {
        1: `text-5xl font-bold my-6 ${isDark ? "text-gray-100" : "text-gray-900"}`,
        2: `text-3xl font-bold mt-5 mb-2 ${isDark ? "text-gray-100" : "text-gray-900"}`,
        3: `text-2xl font-bold mt-4 mb-2 ${isDark ? "text-gray-100" : "text-gray-900"}`,
        4: `text-xl font-semibold mt-3 mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`,
        5: `text-lg font-semibold my-2 ${isDark ? "text-gray-200" : "text-gray-800"}`,
        6: `text-base font-medium my-2 ${isDark ? "text-gray-200" : "text-gray-800"}`,
    };

    return (
        <Tag
            className={cn(
                styles[level],
                "scroll-mt-20", // Espace pour les headers fixes lors de la navigation par ancre
                "transition-colors duration-300",
                "motion-reduce:transition-none",
                className
            )}
            id={id}
        >
            {children}
            {netflex && (
                <Text
                    className="inline-block ml-2 align-middle"
                    variant="muted"
                    aria-label="Netflex logo"
                    as="span"
                >
                    <Film
                        className="inline-block"
                        aria-hidden="true"
                        size={level <= 2 ? 28 : level <= 4 ? 24 : 20}
                    />
                </Text>
            )}
        </Tag>
    );
}