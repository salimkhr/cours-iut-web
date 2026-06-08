"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ConsentForm() {
    const params = useSearchParams();
    const clientId = params.get("client_id") ?? "Application inconnue";
    const scope = params.get("scope") ?? "";
    const [loading, setLoading] = useState(false);

    async function handleConsent(accept: boolean) {
        setLoading(true);
        const res = await fetch("/api/auth/oauth2/consent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accept }),
        });
        const data = await res.json() as { redirectURI?: string };
        if (data.redirectURI) {
            window.location.href = data.redirectURI;
        } else {
            setLoading(false);
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
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={() => handleConsent(true)}
                        disabled={loading}
                        className="flex-1 bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
                    >
                        Autoriser
                    </button>
                    <button
                        onClick={() => handleConsent(false)}
                        disabled={loading}
                        className="flex-1 border rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
                    >
                        Refuser
                    </button>
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
