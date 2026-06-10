"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";

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
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full border rounded-lg p-6 space-y-4">
                <h1 className="text-xl font-semibold">Autoriser l&apos;accès</h1>
                <p className="text-sm text-muted-foreground">
                    <strong>{clientId}</strong> demande l&apos;accès à votre compte.
                </p>
                {scope && (
                    <p className="text-sm">
                        Portées : <code className="text-xs bg-muted px-1 rounded">{scope}</code>
                    </p>
                )}
                {error && (
                    <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
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
        </div>
    );
}

export default function ConsentPage() {
    return (
        <Suspense>
            <ConsentForm />
        </Suspense>
    );
}
