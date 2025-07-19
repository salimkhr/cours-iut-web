'use client';

import React, {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Home} from 'lucide-react';
import ImageCard from "@/components/Cards/ImageCard";

export default function NotFound() {
    interface GifData {
        images: {
            original: {
                url: string;
            };
        };
    }

    const [gifUrl, setGifUrl] = useState<string>('');

    useEffect(() => {
        const fetchGif = async () => {
            try {
                const response = await fetch("https://api.giphy.com/v1/gifs/random?api_key=V1lkx88QRDG9DnAdryMooFePC01U9WTa&tag=404-not-found&rating=g");
                const {data} = (await response.json()) as { data: GifData };

                setGifUrl(data.images.original.url);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                setGifUrl('https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTg3ejJ6dTBucnNpYmR5bnE1N3A1Mm9ocGw5MzUwM3Q0Yjh4bnB6MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lJnAXeJO8tE7E37mxq/giphy.gif');
            }
        };

        fetchGif();
    }, []);

    return (
        <div className="py-12 px-4 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-8">404 - Not Found</h1>

            {gifUrl && (
                <div className="mb-8 mx-auto max-w-[500px] w-full">
                    <ImageCard src={gifUrl}/>
                </div>
            )}

            <Link href="/" passHref>
                <Button className="inline-flex items-center gap-2 border border-gray-300">
                    <Home size={20}/>
                    Retour à l&apos;accueil
                </Button>
            </Link>
        </div>
    );
}
