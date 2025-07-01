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
        <Card className="w-full max-w-sm text-center">
            <CardHeader className="flex flex-col items-center gap-4">
                <Icon className="w-20 h-20" />
                <CardTitle className="text-2xl">{title}</CardTitle>
            </CardHeader>

            <CardContent>
                <p className="text-gray-700">
                    Cours et TP pour maîtriser {title}.
                </p>
            </CardContent>

            <CardFooter>
                <Button asChild className="w-full">
                    <Link href={path}>Voir les cours</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
