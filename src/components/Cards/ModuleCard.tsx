'use client';

import {BookOpen} from 'lucide-react';
import Module from "@/types/Module";
import BaseCard from "@/components/Cards/BaseCard";
import iconMap from "@/lib/iconMap";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";


interface ModuleCardProps {
    currentModule: Module;
}

export default function ModuleCard({currentModule}: ModuleCardProps) {
    const {title, description, path, iconName} = currentModule;
    const Icon = iconMap[iconName] || BookOpen;

    const header = (
        <div className="group-hover:rotate-12 motion-reduce:group-hover:rotate-0 transition-transform duration-300 motion-reduce:transition-none" key={path}>
            <Icon size={40} className="text-white"/>
        </div>
    );

    const content = (
        <>
            <Heading level={2} className={`mt-0 mb-3 text-${path}`}>
                {title}
            </Heading>
            <Text className="text-center leading-relaxed">
                {description}
            </Text>
        </>
    );

    const footer = (
        <Button className={cn(`w-full border-2`, `border-${currentModule.path}`)} variant="outline">
            Voir les cours
        </Button>
    );

    return (
        <BaseCard
            href={path}
            currentModule={currentModule}
            header={header}
            content={content}
            footer={footer}
        />
    );
}