'use client';
import {useRouter} from "next/navigation";
import Section from "@/types/Section";
import Module from "@/types/module";
import {Badge} from '@/components/ui/badge';
import BaseCard, {ActionButton} from "@/components/Cards/BaseCard";
import {BookOpen, CodeXml, FolderCode, Gitlab, GraduationCap} from "lucide-react";

interface SectionCardProps {
    section: Section;
    currentModule: Module;
}

export default function SectionCard({section, currentModule}: SectionCardProps) {
    const router = useRouter();

    const header = (
        <span className="text-xs font-mono text-white dark:text-gray-100">
            {section.totalDuration} Séance{section.totalDuration > 1 ? 's' : ''}
        </span>
    );

    const content = (
        <>
            <h2 className={`text-2xl font-bold mb-2 text-${currentModule?.path} dark:brightness-125`}>
                {section.order}. {section.title}
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                {section.description}
            </p>
            <div className="flex flex-wrap justify-center gap-1 mt-2">
                {section.tags?.map((tag) => (
                    <Badge
                        key={tag}
                        className="border border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-gray-200 font-mono text-xs transition-colors duration-300"
                    >
                        #{tag}
                    </Badge>
                ))}
            </div>
        </>
    );

    const footer = (
        <div className="flex flex-row gap-2 justify-center w-full">
            {section.contents.sort((a, b) => a.localeCompare(b)).map((item, index) => (
                <ActionButton
                    key={index}
                    currentModule={currentModule}
                    className="w-1/3"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/${currentModule.path}/${section.path}/${item}`);
                    }}
                    disabled={!section.isAvailable}
                >
                    <span className="hidden md:inline">{item.charAt(0).toUpperCase() + item.slice(1)}</span>
                    {item === 'cours' && <BookOpen className="w-4 h-4"/>}
                    {item === 'TP' && <CodeXml className="w-4 h-4"/>}
                    {item === 'projet' && <FolderCode className="w-4 h-4"/>}
                    {item === 'examen' && <GraduationCap className="w-4 h-4"/>}
                </ActionButton>
            ))}
            {section.hasCorrection ? <ActionButton
                currentModule={currentModule}
                className="w-1/3"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(`https://gitlab.com/iut3334332/${currentModule.path}/${section.path}`, '_blank');
                }}
                disabled={!section.correctionIsAvailable}
            >
                <span className="hidden md:inline">Correction</span> <Gitlab className="w-4 h-4"/>
            </ActionButton> : null}
        </div>
    );

    return (
        <BaseCard
            href={section.isAvailable ? `/${currentModule.path}/${section.path}` : '#'}
            currentModule={currentModule}
            header={header}
            content={content}
            footer={footer}
            withHover={false}
        />
    );
}