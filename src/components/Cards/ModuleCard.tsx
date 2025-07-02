'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    BracesIcon,
    CodeXml,
    ServerCog,
    LucideIcon,
} from 'lucide-react';
import { Module } from '@/types/module';

interface ModuleCardProps {
    currentModule: Module;
}

// Mapping string => icône
const iconMap: Record<string, LucideIcon> = {
    CodeXml: CodeXml,
    ServerCog: ServerCog,
    BracesIcon: BracesIcon,
};

export default function ModuleCard({ currentModule }: ModuleCardProps) {

    const {title,path,iconName} = currentModule
    const Icon = iconMap[iconName] || BookOpen;

    return (
        <Card className="w-full h-full text-center flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center text-xl">
                <Icon size={40} />
                <CardTitle className="text-2xl">{title}</CardTitle>
            </CardHeader>

            <CardContent>
                <p className="text-gray-700">

                </p>
            </CardContent>

            <CardFooter className="flex flex-row items-center justify-end gap-4">
                <Button asChild className="">
                    <Link href={path}>Voir les cours</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
