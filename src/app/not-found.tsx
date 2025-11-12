'use client';

import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Home} from 'lucide-react';
import ImageCard from "@/components/Cards/ImageCard";
import useRandomGif from "@/hook/useRandomGif";

export default function NotFound() {
    const { gifUrl } = useRandomGif();

    return (
        <div className="py-12 px-4 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-8">404 - Not Found</h1>

            {gifUrl && (
                <div className="mb-8 mx-auto max-w-[500px] w-full">
                    <ImageCard unoptimized src={gifUrl}/>
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
