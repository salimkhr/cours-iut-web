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
            const res = await fetch(`/api/auth/oauth2/consent?${params.toString()}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accept }),
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
                <div className="flex gap-3 pt-2">
                    <Button
                        onClick={() => handleConsent(true)}
                        disabled={loading}
                        className="flex-1"
                    >
                        Autoriser
                    </Button>
                    <Button
                        onClick={() => handleConsent(false)}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
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
