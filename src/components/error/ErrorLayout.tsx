"use client";

import {ReactNode} from "react";
import Image from "next/image";
import Link from "next/link";
import {Home} from "lucide-react";
import AuthLayout from "@/components/login/AuthLayout";
import {Button} from "@/components/ui/button";
import useRandomGif from "@/hook/useRandomGif";

interface ErrorLayoutProps {
    code: string;
    description: string;
    gifTag: string;
    action?: ReactNode;
}

export default function ErrorLayout({code, description, gifTag, action}: ErrorLayoutProps) {
    const {gifUrl, loading} = useRandomGif(gifTag);

    return (
        <AuthLayout title={code} description={description}>
            <div className="flex flex-col gap-4">
                {/* GIF — skeleton overlaid pendant le chargement, image conservée lors du refetch */}
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-bridge-200/40 dark:bg-bridge-700/40">
                    {gifUrl && (
                        <Image
                            src={gifUrl}
                            alt="GIF illustrant l'erreur"
                            width={480}
                            height={192}
                            unoptimized
                            className="w-full h-full object-cover rounded-xl"
                        />
                    )}
                    {loading && (
                        <div className="absolute inset-0 animate-pulse bg-bridge-300/50 dark:bg-bridge-600/50 rounded-xl"/>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild variant="outline" className="flex-1 gap-2">
                        <Link href="/">
                            <Home size={16}/>
                            Retour à l&apos;accueil
                        </Link>
                    </Button>
                    {action}
                </div>
            </div>
        </AuthLayout>
    );
}
