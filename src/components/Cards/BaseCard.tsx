'use client';
import {ReactNode} from 'react';
import Link from 'next/link';
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Module} from '@/types/module';
import {Button} from "@/components/ui/button";

interface BaseCardProps {
    href: string;
    currentModule: Module;
    header: ReactNode;
    content: ReactNode;
    footer: ReactNode;
}

export default function BaseCard({href, currentModule, header, content, footer}: BaseCardProps) {
    return (
        <div className="group hover:scale-105 hover:shadow-xl transition-all duration-300">
            <Link href={href} className="block h-full">
                <Card
                    className={`w-full h-full text-center flex flex-col justify-between border-2 border-${currentModule?.path} bg-white p-0 rounded-lg shadow-lg overflow-hidden`}
                >
                    <CardHeader
                        className={`flex flex-row justify-between items-center p-4 group-hover:brightness-110 transition-all duration-300 bg-${currentModule?.path}`}
                    >
                        <LEDIndicator/>
                        {header}
                    </CardHeader>

                    <CardContent className="flex-grow flex flex-col items-center justify-center p-6">
                        {content}
                    </CardContent>

                    <CardFooter className="p-4">
                        {footer}
                    </CardFooter>
                </Card>
            </Link>
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
    currentModule: Module;
    onClick?: (e: React.MouseEvent) => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean
}

export function ActionButton({currentModule, onClick, children, className = '', disabled = false}: ActionButtonProps) {
    return (
        <Button
            variant="destructive"
            className={`text-black font-semibold hover:brightness-110 transition-all duration-300 border-2 border-${currentModule?.path} text-${currentModule?.path} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </Button>
    );
}