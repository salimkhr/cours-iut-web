'use client';
import {ReactNode} from 'react';
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import Module from "@/types/module";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";


interface BaseCardProps {
    href?: string;
    currentModule?: Module;
    header: ReactNode;
    content: ReactNode;
    footer?: ReactNode;
    withMarge?: boolean
    withHover?: boolean
    withLed?: boolean,
    className?: string
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
    return (
        <div className={cn("group ", withHover ? 'hover:shadow-xl transition-all duration-300 hover:scale-105' : '',className)}>
            <Card
                className={`w-full h-full text-center flex flex-col justify-between border-2 border-${currentModule ? currentModule.path : 'module'} bg-white p-0 rounded-lg shadow-lg overflow-hidden`}
            >
                <CardHeader
                    className={cn("flex flex-row justify-between items-center p-4 group-hover:brightness-110 transition-all duration-300", `bg-${currentModule ? currentModule.path : 'module'}`)}
                >
                    {withLed ? <LEDIndicator/> : null}
                    {header}
                </CardHeader>

                <CardContent
                    className={cn(withMarge ? 'p-6' : '', "flex-grow flex flex-col items-center justify-center")}>
                    {content}
                </CardContent>

                {footer ? <CardFooter className="p-4">
                    {footer}
                </CardFooter> : null}
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
    onClick?: (e: React.MouseEvent) => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean
}

export function ActionButton({currentModule, onClick, children, className = '', disabled = false}: ActionButtonProps) {
    return (
        <Button
            variant="destructive"
            className={`text-black font-semibold hover:brightness-110 transition-all duration-300 border-2 border-${currentModule ? currentModule.path : 'module'} text-${currentModule ? currentModule.path : 'module'} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </Button>
    );
}