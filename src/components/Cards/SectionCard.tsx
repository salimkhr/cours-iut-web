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
import { Module } from '@/types/module';
import { Section } from "@/types/Section";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
    section: Section;
    currentModule: Module;
}

export default function SectionCard({ section, currentModule }: CourseCardProps) {
    const { color } = currentModule;
    const router = useRouter();

    return (
        <div className="group hover:scale-105 hover:shadow-xl transition-all duration-300">
            <Link href={`/${currentModule.path}/${section.path}`} className="block h-full">
                <Card className="w-full h-full text-center flex flex-col justify-between border-2 border-black bg-white p-0 rounded-lg shadow-lg overflow-hidden">

                    {/* Header avec "LEDs" et couleur dynamique */}
                    <CardHeader
                        className="flex flex-row justify-between items-center p-4 border-b-2 group-hover:brightness-110 transition-all duration-300"
                        style={{ backgroundColor: color }}
                    >
                        <div className="flex gap-2">
                            <div className="w-2 h-2 bg-black rounded-full group-hover:animate-pulse"></div>
                            <div className="w-2 h-2 bg-black rounded-full group-hover:animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-black rounded-full group-hover:animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-xs font-mono text-black">{section.totalDuration} Séance{section.totalDuration > 1 ?'s':''} </span>
                    </CardHeader>

                    {/* Contenu principal */}
                    <CardContent className="flex-grow flex flex-col items-center justify-center p-6">
                        <h2 className="text-2xl font-bold mb-2">
                            {section.order}. {section.title}
                        </h2>
                        <p className="text-sm text-gray-700 mb-3">
                            {section.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap justify-center gap-1 mt-2">
                            {section.tags?.map((tag) => (
                                <Badge key={tag} className="border border-black bg-white text-black font-mono text-xs">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>

                    {/* Footer avec boutons */}
                    <CardFooter className="p-4 flex flex-wrap gap-2 justify-center">
                        {section.contents.map((item, index) => {
                            return (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className="text-black font-semibold hover:brightness-110 transition-all duration-300 border-2 border-black"
                                    style={{ backgroundColor: color }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        router.push(`/${currentModule.path}/${section.path}/${item.type}`);
                                    }}
                                >
                                    {item.type}
                                </Button>
                            );
                        })}
                    </CardFooter>
                </Card>
            </Link>
        </div>
    );
}
