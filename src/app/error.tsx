"use client";

import ErrorLayout from "@/components/error/ErrorLayout";
import {Button} from "@/components/ui/button";
import {RotateCcw} from "lucide-react";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({reset}: ErrorPageProps) {
    return (
        <ErrorLayout
            code="500"
            description="Quelque chose s'est mal passé côté serveur. Réessayez dans quelques instants."
            gifTag="fail oops"
            action={
                <Button variant="outline" className="flex-1 gap-2" onClick={reset}>
                    <RotateCcw size={16}/>
                    Réessayer
                </Button>
            }
        />
    );
}
