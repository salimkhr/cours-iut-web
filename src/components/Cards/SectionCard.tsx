'use client';
import {useRouter} from "next/navigation";
import {Section} from '@/types/Section';
import {Module} from '@/types/module';
import {Badge} from '@/components/ui/badge';
import BaseCard, {ActionButton} from "@/components/Cards/BaseCard";

interface SectionCardProps {
    section: Section;
    currentModule: Module;
}

export default function SectionCard({section, currentModule}: SectionCardProps) {
    const router = useRouter();

    const header = (

        <span className="text-xs font-mono text-black">
            {section.totalDuration} Séance{section.totalDuration > 1 ? 's' : ''}
        </span>
    );

    const content = (
        <>
            <h2 className={`text-2xl font-bold mb-2 text-${currentModule?.path}`}>
                {section.order}. {section.title}
            </h2>
            <p className="text-sm text-gray-700 mb-3">
                {section.description}
            </p>
            <div className="flex flex-wrap justify-center gap-1 mt-2">
                {section.tags?.map((tag) => (
                    <Badge key={tag} className="border border-black bg-white text-black font-mono text-xs">
                        #{tag}
                    </Badge>
                ))}
            </div>
        </>
    );

    const footer = (
        <div className="flex flex-row gap-2 justify-center w-full">
            {section.contents.map((item, index) => (
                <ActionButton
                    key={index}
                    currentModule={currentModule}
                    className="w-1/2"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/${currentModule.path}/${section.path}/${item.type}`);
                    }}
                    disabled={!section.isAvailable}
                >
                    {item.type}
                </ActionButton>
            ))}
            {section.hasCorrection ? <ActionButton
                currentModule={currentModule}
                className="w-1/2"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/${currentModule.path}/${section.path}/correction`);
                }}
                disabled={!section.isAvailable}
            >
                Correction
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
        />
    );
}