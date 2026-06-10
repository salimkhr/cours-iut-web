"use client";

import {cn} from "@/lib/utils";
import {JSX} from "react";
import {Film} from "lucide-react";
import Text from "./Text";
import {useIsDark} from "@/hook/useIsDark";

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

    const isDark = useIsDark();

    const textColor = isDark ? "text-brand-light" : "text-brand-dark";
    const textColorMuted = isDark ? "text-brand-light/90" : "text-brand-dark/90";
    const styles: Record<number, string> = {
        1: `text-3xl sm:text-4xl md:text-5xl font-bold my-6 ${textColor}`,
        2: `text-2xl sm:text-3xl font-bold mt-5 mb-2 ${textColor}`,
        3: `text-xl sm:text-2xl font-bold mt-4 mb-2 ${textColor}`,
        4: `text-lg sm:text-xl font-semibold mt-3 mb-2 ${textColorMuted}`,
        5: `text-base sm:text-lg font-semibold my-2 ${textColorMuted}`,
        6: `text-sm sm:text-base font-medium my-2 ${textColorMuted}`,
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