'use client';
import BaseCard from "@/components/Cards/BaseCard";
import Image from "next/image";
import type Module from "@/types/Module";


interface ImageCardProps {
    src: string;
    title?: string;
    alt?: string;
    width?: number;
    height?: number;
    unoptimized?: boolean
    currentModule?: Module;
}

export default function ImageCard({src, title, alt, width = 800, height = 800, unoptimized = true, currentModule}: ImageCardProps) {

    const header = (
        <span className="flex-1 text-center text-sm text-white font-mono">{title}</span>
    );

    const content = (
        <Image
            src={src}
            alt={alt ?? title ?? ''}
            className={"w-full"}
            width={width}
            height={height}
            unoptimized={unoptimized}/>
    );

    return (
        <BaseCard
            header={header}
            content={content}
            currentModule={currentModule}
            withHover={false}
        />
    );
}