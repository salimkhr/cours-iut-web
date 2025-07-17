'use client';
import BaseCard from "@/components/Cards/BaseCard";
import Image from "next/image";
import React from "react";

interface ImageCardProps {
    src: string;
    title: string;
}

export default function ImageCard({src, title}: ImageCardProps) {

    const header = (

        <>
            <span className="text-sm text-white font-mono">{title}</span>
            {/*Centre le text justify-content tout ça tout ça, ne cherche pas TKT*/}
            <span> </span>
        </>
    );

    const content = (
        <>
            <Image src={src} alt={title} className={"w-full"} width={800} height={800}/>
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