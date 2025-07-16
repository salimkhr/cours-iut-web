import {BookOpen, Braces, Code, type LucideIcon, Server} from 'lucide-react';
import {Module} from '@/types/module';
import BaseCard, {ActionButton} from "@/components/Cards/BaseCard";


interface ModuleCardProps {
    currentModule: Module;
}

const iconMap: Record<string, LucideIcon> = {
    Code: Code,
    Server: Server,
    Braces: Braces,
    BookOpen: BookOpen,
    CodeXml: Code,
    ServerCog: Server,
    BracesIcon: Braces,
};

export default function ModuleCard({currentModule}: ModuleCardProps) {
    const {title, description, path, iconName} = currentModule;
    const Icon = iconMap[iconName] || BookOpen;

    const header = (
        <div className="group-hover:rotate-12 transition-transform duration-300">
            <Icon size={40} className="text-white"/>
        </div>
    );

    const content = (
        <>
            <h2 className={`text-3xl font-bold mb-3 text-${path}`}>
                {title}
            </h2>
            <p className="text-gray-700 text-center leading-relaxed">
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