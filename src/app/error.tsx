"use client";

import {useEffect} from "react";
import ErrorLayout from "@/components/error/ErrorLayout";
import {Button} from "@/components/ui/button";
import {RotateCcw} from "lucide-react";

interface ErrorPageProps {
    error: Error & {digest?: string};
    reset: () => void;
}

export default function ErrorPage({error, reset}: ErrorPageProps) {
    // Trace l'erreur complète dans la console du navigateur (utile en prod où
    // le message est masqué dans l'UI mais reste accessible via le digest).
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <ErrorLayout
            code="500"
            description="Quelque chose s'est mal passé côté serveur. Réessayez dans quelques instants."
            gifTag="fail oops"
            details={<ErrorDetails error={error}/>}
            action={
                <Button variant="outline" className="flex-1 gap-2" onClick={reset}>
                    <RotateCcw size={16}/>
                    Réessayer
                </Button>
            }
        />
    );
}

function ErrorDetails({error}: {error: Error & {digest?: string}}) {
    return (
        <div className="rounded-xl border border-bridge-500/30 bg-bridge-100/40 dark:bg-bridge-800/40 p-4 text-left text-sm">
            {error.digest && (
                <p className="font-mono text-xs text-brand-dark dark:text-bridge-200">
                    <span className="font-semibold">Digest&nbsp;:</span> {error.digest}
                </p>
            )}

            {error.message && (
                <p className="mt-2 break-words font-mono text-xs text-red-700 dark:text-red-300">
                    {error.message}
                </p>
            )}

            {error.stack && (
                <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-semibold text-brand-dark dark:text-bridge-200">
                        Stack trace
                    </summary>
                    <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-brand-dark/90 p-3 font-mono text-[11px] leading-relaxed text-bridge-100">
                        {error.stack}
                    </pre>
                </details>
            )}

            <p className="mt-3 text-[11px] text-brand-gray-500 dark:text-bridge-300">
                En production, Next.js masque le message d&apos;erreur côté client&nbsp;:
                seul le digest est exposé. Le message complet est consultable dans les
                logs serveur (recherchez ce digest).
            </p>
        </div>
    );
}
