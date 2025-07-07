'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
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
import { motion } from "framer-motion";

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

    const {title, description,path,iconName, color} = currentModule
    const Icon = iconMap[iconName] || BookOpen;

    console.log(color.toUpperCase())

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Card
            className="w-full h-full text-center flex flex-col justify-between border-2 border-black bg-white p-0 rounded-base">
                <CardHeader className={`flex flex-row justify-between items-center p-4 rounded-t-base border-b-2`}
                            style={{backgroundColor: color}}>
                    <Icon size={40}/>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-bold">{title}</h2>
                    <p className="text-gray-700 text-center">{description}</p>
                </CardContent>
                <CardFooter className="p-4">
                <Button asChild variant="noShadow" className={`w-full text-black`} style={{backgroundColor: color}}>
                    <Link href={path}>Voir les cours</Link>
                </Button>
            </CardFooter>
        </Card>
        </motion.div>
            );
            }
