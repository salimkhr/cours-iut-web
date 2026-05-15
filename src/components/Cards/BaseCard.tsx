'use client';

import {ReactNode} from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import Module from "@/types/Module";
import {cn} from "@/lib/utils";
import Link from "next/link";

interface BaseCardProps {
    href?: string;
    currentModule?: Module;
    header: ReactNode;
    content: ReactNode;
    footer?: ReactNode;
    withMarge?: boolean;
    withHover?: boolean;
    withLed?: boolean;
    className?: string;
    overlay?: ReactNode;
}

export default function BaseCard({
                                     currentModule,
                                     header,
                                     content,
                                     footer,
                                     withMarge = true,
                                     withHover = true,
                                     withLed = true,
                                     className = "",
                                     overlay
                                 }: BaseCardProps) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.div
            className={cn("group h-full flex flex-col", className)}
            whileHover={withHover && !prefersReducedMotion ? {y: -6} : {}}
            transition={{duration: 0.3, ease: "easeOut"}}
        >
            <Card
                className={cn(
                    "relative w-full h-full flex flex-col justify-between border rounded-2xl overflow-hidden",
                    "bg-bridge-50 dark:bg-bridge-900",
                    "text-bridge-900 dark:text-bridge-100",
                    `border-${currentModule ? currentModule.path : 'module'}`,
                    "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)] dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
                    withHover
                        ? "hover:shadow-[0_22px_44px_-14px_rgba(147,97,58,0.55)] dark:hover:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.75)]"
                        : "",
                    "transition-shadow duration-300",
                )}
            >
                {/* Top edge highlight */}
                <div aria-hidden="true"
                     className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 pointer-events-none"/>

                {overlay}

                <CardHeader
                    className={cn(
                        "flex flex-row justify-between items-center px-4 py-3 transition-brightness duration-300",
                        `bg-${currentModule ? currentModule.path : 'module'}`
                    )}
                >
                    {withLed && <LEDIndicator/>}
                    {header}
                </CardHeader>

                <CardContent
                    className={cn(
                        withMarge ? "p-6" : "p-0",
                        "flex-grow flex flex-col",
                    )}
                >
                    {content}
                </CardContent>

                {footer && (
                    <CardFooter className="p-4 mt-auto border-t border-bridge-400/30 dark:border-bridge-600/30">
                        {footer}
                    </CardFooter>
                )}
            </Card>
        </motion.div>
    );
}

export function LEDIndicator() {
    return (
        <div className="flex gap-1.5 shrink-0" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-white/30 group-hover:bg-white/60 transition-colors duration-300"/>
            <span className="w-2.5 h-2.5 rounded-full bg-white/30 group-hover:bg-white/60 transition-colors duration-300"
                  style={{transitionDelay: '50ms'}}/>
            <span className="w-2.5 h-2.5 rounded-full bg-white/30 group-hover:bg-white/60 transition-colors duration-300"
                  style={{transitionDelay: '100ms'}}/>
        </div>
    );
}

interface ActionButtonProps {
    currentModule?: Module;
    href: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    target?: string;
}

export function ActionButton({
                                 currentModule,
                                 href,
                                 children,
                                 className = '',
                                 disabled = false,
                                 target = '_self'
                             }: ActionButtonProps) {
    const baseClasses = cn(
        `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm
     [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0
     outline-none transition-all duration-300
     h-9 px-4 py-2 font-semibold border-2
     has-[>svg]:px-3
     focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current
     shadow-xs
     aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive`,
        `bg-destructive hover:bg-destructive/90 dark:bg-destructive/60
     border-${currentModule ? currentModule.path : 'module'}
     text-${currentModule ? currentModule.path : 'module'}`,
        "text-black dark:text-white",
        disabled
            ? 'pointer-events-none opacity-50 cursor-not-allowed brightness-75'
            : 'cursor-pointer hover:brightness-110',
        className
    );

    if (disabled) {
        return (
            <span aria-disabled="true" className={baseClasses}>
                {children}
            </span>
        );
    }

    return (
        <Link href={href} target={target} className={baseClasses}>
            {children}
        </Link>
    );
}
