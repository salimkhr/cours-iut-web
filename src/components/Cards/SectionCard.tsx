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
import { Module } from '@/types/module';
import {Section} from "@/types/Section";

interface CourseCardProps {
    section: Section;
    currentModule: Module;
}

export default function SectionCard({ section,currentModule }: CourseCardProps) {

    return (
        <Card className="w-full max-w-sm text-center">
            <CardHeader className="flex flex-col items-center gap-4">
                <CardTitle className="text-2xl">{section.title}</CardTitle>
            </CardHeader>

            <CardContent>
                <p className="text-gray-700">
                    Cours et TP pour maîtriser {section.title}.
                </p>
            </CardContent>

            <CardFooter>
                {section.contents.map((item) => (
                    <Button asChild className="w-full mx-2" key={item.id}>
                        <Link href={'/'+currentModule.path+'/'+section.path+'/'+item.type}>{item.type}</Link>
                    </Button>
                ))}

            </CardFooter>
        </Card>
    );
}
