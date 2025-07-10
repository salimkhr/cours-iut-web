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
    Braces,
    Code,
    Server,
    type LucideIcon,
} from 'lucide-react';
import { Module } from '@/types/module';

interface ModuleCardProps {
    currentModule: Module;
}

// Mapping des icônes
const iconMap: Record<string, LucideIcon> = {
    Code: Code,
    Server: Server,
    Braces: Braces,
    BookOpen: BookOpen,
    CodeXml: Code,
    ServerCog: Server,
    BracesIcon: Braces,
};

export default function ModuleCard({ currentModule }: ModuleCardProps) {
    const { title, description, path, iconName, color } = currentModule;
    const Icon = iconMap[iconName] || BookOpen;

    return (
        <div className="group hover:scale-105 hover:shadow-xl transition-all duration-300">
            <Link href={path} className="block h-full">
                <Card className="w-full h-full text-center flex flex-col justify-between border-2 border-black bg-white p-0 rounded-lg shadow-lg overflow-hidden">
                    <CardHeader
                        className="flex flex-row justify-between items-center p-4 border-b-2 group-hover:brightness-110 transition-all duration-300"
                        style={{ backgroundColor: color }}
                    >
                        <div className="group-hover:rotate-12 transition-transform duration-300">
                            <Icon size={40} className="text-black" />
                        </div>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 bg-black rounded-full animate-pulse group-hover:animate-pulse"></div>
                            <div className="w-2 h-2 bg-black rounded-full animate-pulse group-hover:animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-black rounded-full animate-pulse group-hover:animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-grow flex flex-col items-center justify-center p-6">
                        <h2 className="text-3xl font-bold mb-3">
                            {title}
                        </h2>
                        <p className="text-gray-700 text-center leading-relaxed">
                            {description}
                        </p>
                    </CardContent>

                    <CardFooter className="p-4">
                        <Button
                            variant="destructive"
                            className="w-full text-black font-semibold hover:brightness-110 transition-all duration-300 border-2 border-black"
                            style={{ backgroundColor: color }}
                        >
                            Voir les cours
                        </Button>
                    </CardFooter>
                </Card>
            </Link>
        </div>
    );
}