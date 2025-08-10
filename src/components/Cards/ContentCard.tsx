'use client';
import {useRouter} from "next/navigation";
import Module from "@/types/module";
import BaseCard, {ActionButton} from "@/components/Cards/BaseCard";
import {Content} from "@/types/content";
import Section from "@/types/Section";

interface SectionCardProps {
    content: Content;
    section: Section;
    currentModule: Module;
}

export default function ContentCard({content, section, currentModule}: SectionCardProps) {
    const router = useRouter();

    const header = (
        <></>
    );

    const contentCard = (
        <>
            <h2 className={`text-2xl font-bold mb-2 text-${currentModule?.path}`}>
                {content.type}
            </h2>
        </>
    );

    const footer = (
        <div className="flex flex-row gap-2 justify-center w-full">
            <ActionButton
                currentModule={currentModule}
                className="w-1/2"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/${currentModule.path}/${section.path}/${content.type}`);
                }}
                disabled={!section.isAvailable}
            >
                {content.type}
            </ActionButton>
        </div>
    );

    return (
        <BaseCard
            href={section.isAvailable ? `/${currentModule.path}/${section.path}` : '#'}
            currentModule={currentModule}
            header={header}
            content={contentCard}
            footer={footer}
        />
    );
}