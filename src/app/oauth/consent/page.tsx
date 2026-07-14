"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/login/AuthLayout";

function ConsentForm() {
    const params = useSearchParams();
    const clientId = params.get("client_id") ?? "Application inconnue";
    const scope = params.get("scope") ?? "";
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleConsent(accept: boolean) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/auth/oauth2/consent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accept, oauth_query: params.toString() }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json() as { redirect?: boolean; url?: string };
            if (data.url) {
                window.location.href = data.url;
            } else {
                setLoading(false);
            }
        } catch {
            setLoading(false);
            setError("Une erreur est survenue. Veuillez réessayer.");
        }
    }

    return (
        <AuthLayout
            title="Autoriser l'accès"
            description="Accordez à une application tierce l'accès à votre compte."
        >
            <div className="space-y-4">
                <p className="text-sm text-brand-gray-700 dark:text-brand-gray-300">
                    <strong className="text-brand-dark dark:text-brand-light">{clientId}</strong>{" "}
                    demande l&apos;accès à votre compte.
                </p>
                {scope && (
                    <p className="text-sm text-brand-gray-700 dark:text-brand-gray-300">
                        Portées :{" "}
                        <code className="text-xs bg-bridge-100 dark:bg-bridge-700 px-1.5 py-0.5 rounded">
                            {scope}
                        </code>
                    </p>
                )}
                {error && (
                    <p className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                        {error}
                    </p>
                )}
                <div className="flex flex-col gap-3 pt-2">
                    <Button
                        onClick={() => handleConsent(true)}
                        disabled={loading}
                        size="lg"
                        className="w-full h-auto rounded-lg bg-brand-accent-dark text-white dark:text-brand-dark hover:bg-brand-accent-dark hover:-translate-y-0.5 border-2 border-brand-accent-dark px-6 py-3 text-sm font-semibold tracking-wide shadow-[0_8px_24px_-10px_rgba(194,65,12,0.55)] hover:shadow-[0_14px_36px_-12px_rgba(194,65,12,0.75)] transition-all duration-300"
                    >
                        {loading ? "Traitement…" : "Autoriser"}
                    </Button>
                    <Button
                        onClick={() => handleConsent(false)}
                        disabled={loading}
                        variant="outline"
                        size="lg"
                        className="w-full h-auto rounded-lg border-2 border-brand-accent-dark/40 text-brand-accent-dark hover:bg-brand-accent-dark/10 px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300"
                    >
                        Refuser
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
}

export default function ConsentPage() {
    return (
        <Suspense>
            <ConsentForm />
        </Suspense>
    );
}
