'use client';
import {ReactNode} from 'react';
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import Module from "@/types/Module";
import {cn} from "@/lib/utils";
import {useIsDark} from "@/hook/useIsDark";
import {useMounted} from "@/hook/useMounted";
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
    const mounted = useMounted();
    const isDark = useIsDark();
    if (!mounted) return null; // SSR safe

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
                    {withLed && <LEDIndicator/>}
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
            <div className="w-2 h-2 bg-white rounded-full group-hover:animate-pulse"
                 style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-white rounded-full group-hover:animate-pulse"
                 style={{animationDelay: '0.4s'}}></div>
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
    const mounted = useMounted();
    const isDark = useIsDark();
    if (!mounted) return null;

    return (
        <Link
            href={disabled ? '#' : href}
            target={target}
            onClick={e => disabled && e.preventDefault()}
            className={cn(
                `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm 
     [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 
     outline-none cursor-pointer transition-all duration-300
     h-9 px-4 py-2 font-semibold border-2 w-1/3
     has-[>svg]:px-3
     focus-visible:ring-[3px]
     focus-visible:border-ring 
     shadow-xs
     disabled:pointer-events-none disabled:opacity-50
     aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive`,
                // Couleurs dynamiques selon le module
                `bg-destructive hover:bg-destructive/90 dark:bg-destructive/60 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40
     border-${currentModule ? currentModule.path : 'module'} 
     text-${currentModule ? currentModule.path : 'module'}`,
                // Thème sombre / clair
                isDark ? 'text-white' : 'text-black',
                // États désactivés
                disabled
                    ? 'pointer-events-none opacity-50 cursor-not-allowed brightness-75'
                    : 'hover:brightness-110',
                className
            )}
        >
            {children}
        </Link>
    );
}
