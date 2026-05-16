"use client";

import {ReactNode} from "react";
import Image from "next/image";
import Link from "next/link";
import {Home, RefreshCw} from "lucide-react";
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
    const {gifUrl, loading, refetch} = useRandomGif(gifTag);

    return (
        <AuthLayout title={code} description={description}>
            <div className="flex flex-col gap-4">
                {/* GIF */}
                <div className="w-full h-48 rounded-xl overflow-hidden bg-bridge-200/40 dark:bg-bridge-700/40">
                    {loading && (
                        <div className="w-full h-full animate-pulse bg-bridge-300/50 dark:bg-bridge-600/50 rounded-xl"/>
                    )}
                    {!loading && gifUrl && (
                        <Image
                            src={gifUrl}
                            alt="GIF illustrant l'erreur"
                            width={480}
                            height={192}
                            unoptimized
                            className="w-full h-full object-cover rounded-xl"
                        />
                    )}
                </div>

                {/* Reload GIF */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={refetch}
                    className="self-center gap-1.5 text-brand-gray-500 hover:text-brand-accent-dark"
                >
                    <RefreshCw size={13}/>
                    Autre GIF
                </Button>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                        <Link href="/">
                            <Home size={15} className="mr-2"/>
                            Retour à l&apos;accueil
                        </Link>
                    </Button>
                    {action}
                </div>
            </div>
        </AuthLayout>
    );
}
