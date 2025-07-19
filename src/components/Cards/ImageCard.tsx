'use client';
import BaseCard from "@/components/Cards/BaseCard";
import Image from "next/image";


interface ImageCardProps {
    src: string;
    title?: string;
    width?: number;
    height?: number;
}

export default function ImageCard({src, title, width = 800, height = 800}: ImageCardProps) {

    const header = (

        <>
            <span className="text-sm text-white font-mono">{title}</span>
            {/*Centre le text justify-content tout ça tout ça, ne cherche pas TKT*/}
            <span> </span>
        </>
    );

    const content = (
        <>
            <Image src={src} alt={title ?? ''} className={"w-full"} width={width} height={height}/>
        </>
    );

    return (
        <BaseCard
            header={header}
            content={content}
            withHover={false}
        />
    );
}