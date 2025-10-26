"use client";

import {ReactNode} from 'react';
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Module from "@/types/module";
import {cn} from "@/lib/utils";
import {useTheme} from "next-themes";

// ----------------------------
// BaseCard
// ----------------------------

interface BaseCardProps {
    currentModule?: Module; // path: 'javascript' | 'php' | 'html' | autres
    header: ReactNode;
    content: ReactNode;
    footer?: ReactNode;
    withMarge?: boolean;
    withHover?: boolean;
    withLed?: boolean;
    className?: string;
}

export default function BaseCard({
                                     currentModule,
                                     header,
                                     content,
                                     footer,
                                     withMarge = true,
                                     withHover = true,
                                     withLed = true,
                                     className = ""
                                 }: BaseCardProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div
            className={cn(
                "group",
                withHover ? 'hover:shadow-xl transition-all duration-300 hover:scale-105' : '',
                className
            )}
        >
            <Card
                className={cn(
                    "w-full h-full text-center flex flex-col justify-between border-2 p-0 rounded-lg shadow-lg overflow-hidden transition-colors duration-300",
                    `border-${currentModule ? currentModule.path : 'module'}`
                )}
            >
                <CardHeader
                    className={cn(
                        "flex flex-row justify-between items-center p-4 transition-all duration-300 group-hover:brightness-110",
                        withHover && (isDark ? 'group-hover:brightness-125' : ''),
                        `bg-${currentModule ? currentModule.path : 'module'}`
                    )}
                >
                    {withLed ? <LEDIndicator isDark={isDark} /> : null}
                    {header}
                </CardHeader>

                <CardContent
                    className={cn(
                        withMarge ? 'p-6' : '',
                        "flex-grow flex flex-col items-center justify-center"
                    )}
                >
                    {content}
                </CardContent>

                {footer && (
                    <CardFooter
                        className={cn(
                            "p-4 border-t transition-colors duration-300",
                            isDark ? 'border-gray-700' : 'border-gray-200'
                        )}
                    >
                        {footer}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

// ----------------------------
// LEDIndicator
// ----------------------------

interface LEDProps {
    isDark?: boolean;
}

export function LEDIndicator({ isDark = false }: LEDProps) {
    const shadowClass = isDark ? 'shadow-white/20' : 'shadow-black/20';

    return (
        <div className="flex gap-2">
            <div className={cn("w-2 h-2 rounded-full group-hover:animate-pulse shadow-sm", shadowClass)}></div>
            <div
                className={cn("w-2 h-2 rounded-full group-hover:animate-pulse shadow-sm", shadowClass)}
                style={{ animationDelay: '0.2s' }}
            ></div>
            <div
                className={cn("w-2 h-2 rounded-full group-hover:animate-pulse shadow-sm", shadowClass)}
                style={{ animationDelay: '0.4s' }}
            ></div>
        </div>
    );
}

// ----------------------------
// ActionButton
// ----------------------------

interface ActionButtonProps {
    currentModule?: Module;
    onClick?: (e: React.MouseEvent) => void;
    children: ReactNode;
    className?: string;
    disabled?: boolean;
}

export function ActionButton({
                                 currentModule,
                                 onClick,
                                 children,
                                 className = '',
                                 disabled = false
                             }: ActionButtonProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Texte et bordure selon module
    const textColor = `text-${currentModule ? currentModule.path : 'module'}`;
    const borderColor = `border-${currentModule ? currentModule.path : 'module'}`;

    // Fond selon dark/light
    const bgColor = isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100';

    return (
        <Button
            variant="destructive"
            className={cn(
                "font-semibold border-2 transition-all duration-300",
                textColor,
                borderColor,
                bgColor,
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </Button>
    );
}
