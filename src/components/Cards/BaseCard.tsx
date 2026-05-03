import {ReactNode} from 'react';
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
    return (
        <div
            className={cn(
                "group h-full flex flex-col",
                withHover
                    ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    : "",
                className
            )}
        >
            <Card
                className={cn(
                    "relative w-full h-full flex flex-col justify-between text-center border-2 rounded-lg shadow-md overflow-hidden",
                    "bg-white dark:bg-gray-800",
                    "text-gray-900 dark:text-gray-100",
                    "transition-shadow duration-300",
                    `border-${currentModule ? currentModule.path : 'module'}`
                )}
            >
                {overlay}
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
                        "flex-grow flex flex-col items-center justify-center",
                        "bg-white dark:bg-footer"
                    )}
                >
                    {content}
                </CardContent>

                {footer && (
                    <CardFooter className="p-4 mt-auto bg-white dark:bg-footer">
                        {footer}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

export function LEDIndicator() {
    return (
        <div className="flex gap-2" aria-hidden="true">
            <div className="w-2 h-2 bg-white rounded-full group-hover:animate-pulse motion-reduce:group-hover:animate-none"></div>
            <div className="w-2 h-2 bg-white rounded-full group-hover:animate-pulse motion-reduce:group-hover:animate-none"
                 style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-white rounded-full group-hover:animate-pulse motion-reduce:group-hover:animate-none"
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
