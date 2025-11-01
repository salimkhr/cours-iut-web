'use client';
import {ReactNode, useEffect, useState} from 'react';
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import Module from "@/types/module";
import {cn} from "@/lib/utils";
import {useTheme} from "next-themes";
import {Button} from "@/components/ui/button";

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
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null; // SSR safe

    const isDark = theme === 'dark';

    return (
        <div
            className={cn(
                "group h-full flex flex-col", // 🟢 Force la hauteur complète
                withHover ? "hover:shadow-xl transition-all duration-300 hover:scale-105" : "",
                className
            )}
        >
            <Card
                className={cn(
                    // 🟢 Étend la carte sur toute la hauteur disponible
                    "w-full h-full flex flex-col justify-between text-center border-2 rounded-lg shadow-lg overflow-hidden",
                    `border-${currentModule ? currentModule.path : 'module'}`,
                    isDark ? "bg-gray-800" : "bg-white"
                )}
            >
                <CardHeader
                    className={cn(
                        "flex flex-row justify-between items-center p-4 group-hover:brightness-110 transition-all duration-300",
                        `bg-${currentModule ? currentModule.path : 'module'}`
                    )}
                >
                    {withLed && <LEDIndicator />}
                    {header}
                </CardHeader>

                <CardContent
                    className={cn(
                        withMarge ? "p-6" : "",
                        "flex-grow flex flex-col items-center justify-center", // 🟢 permet à content de s’étirer et de centrer verticalement
                        isDark ? "bg-footer" : "bg-white"
                    )}
                >
                    {content}
                </CardContent>

                {footer && (
                    <CardFooter
                        className={cn("p-4 mt-auto", isDark ? "bg-footer" : "bg-white")}
                    >
                        {footer}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

export function LEDIndicator() {
    return (
        <div className="flex gap-2">
            <div className="w-2 h-2 bg-white rounded-full group-hover:animate-pulse"></div>
            <div className="w-2 h-2 bg-white rounded-full group-hover:animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full group-hover:animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
    );
}

interface ActionButtonProps {
    currentModule?: Module;
    onClick?: (e: React.MouseEvent) => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

export function ActionButton({ currentModule, onClick, children, className = '', disabled = false }: ActionButtonProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const isDark = theme === 'dark';

    return (
        <Button
            variant="destructive"
            className={cn(
                `font-semibold hover:brightness-110 transition-all duration-300 border-2 border-${currentModule ? currentModule.path : 'module'} text-${currentModule ? currentModule.path : 'module'}`,
                isDark ? 'text-white' : 'text-black',
                className
            )}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </Button>
    );
}
