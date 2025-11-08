import {BookOpen} from 'lucide-react';
import Module from "@/types/module";
import BaseCard from "@/components/Cards/BaseCard";
import iconMap from "@/lib/iconMap";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";


interface ModuleCardProps {
    currentModule: Module;
}

export default function ModuleCard({currentModule}: ModuleCardProps) {
    const {title, description, path, iconName} = currentModule;
    const Icon = iconMap[iconName] || BookOpen;
    
    const header = (
        <div className="group-hover:rotate-12 transition-transform duration-300" key={path}>
            <Icon size={40} className="text-white"/>
        </div>
    );

    const content = (
        <>
            <h2 className={`text-3xl font-bold mb-3 text-${path}`}>
                {title}
            </h2>
            <p className="text-center leading-relaxed">
                {description}
            </p>
        </>
    );

    const footer = (
        <Button  className={cn(`w-full border-2`, `border-${currentModule.path}`)} variant="outline" >
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