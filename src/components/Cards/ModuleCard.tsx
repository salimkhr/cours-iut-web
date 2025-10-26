import {BookOpen} from 'lucide-react';
import Module from "@/types/module";
import BaseCard, {ActionButton} from "@/components/Cards/BaseCard";
import iconMap from "@/lib/iconMap";


interface ModuleCardProps {
    currentModule: Module;
}

export default function ModuleCard({currentModule}: ModuleCardProps) {
    const {title, description, path, iconName} = currentModule;
    const Icon = iconMap[iconName] || BookOpen;

    const header = (
        <div className="group-hover:rotate-12 transition-transform duration-300" key={path}>
            <Icon size={40} className="text-white dark:text-gray-100"/>
        </div>
    );

    const content = (
        <>
            <h2 className={`text-3xl font-bold mb-3 text-${path} dark:brightness-125`}>
                {title}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-center leading-relaxed transition-colors duration-300">
                {description}
            </p>
        </>
    );

    const footer = (
        <ActionButton currentModule={currentModule} className="w-full">
            Voir les cours
        </ActionButton>
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