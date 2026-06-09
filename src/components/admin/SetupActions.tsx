"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ActionKey = "migrate-contents-refs" | "create-content-index" | "seed-oauth-client";

const ACTIONS: { key: ActionKey; label: string; desc: string }[] = [
    {
        key: "migrate-contents-refs",
        label: "Migrer les refs de sections",
        desc: "contents: string[] → ContentRef[] dans MongoDB",
    },
    {
        key: "create-content-index",
        label: "Créer l'index course_content",
        desc: "Index unique (moduleSlug, sectionSlug, contentType)",
    },
    {
        key: "seed-oauth-client",
        label: "Enregistrer Claude.ai OAuth",
        desc: "Insère le client MCP_CLIENT_ID dans oauthClient",
    },
];

export default function SetupActions() {
    const [results, setResults] = useState<Record<ActionKey, string | null>>({
        "migrate-contents-refs": null,
        "create-content-index": null,
        "seed-oauth-client": null,
    });
    const [loading, setLoading] = useState<ActionKey | null>(null);

    async function run(key: ActionKey) {
        setLoading(key);
        setResults(r => ({ ...r, [key]: null }));
        try {
            const res = await fetch(`/api/admin/setup/${key}`, { method: "POST" });
            const data = await res.json() as Record<string, unknown>;
            setResults(r => ({
                ...r,
                [key]: res.ok
                    ? `✓ ${JSON.stringify(data)}`
                    : `✗ ${data.error ?? res.status}`,
            }));
        } catch (e) {
            setResults(r => ({ ...r, [key]: `✗ ${String(e)}` }));
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="border border-dashed border-amber-400 rounded-lg p-4 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-amber-600 dark:text-amber-400">
                Actions de setup (temporaire)
            </p>
            {ACTIONS.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center gap-3">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => run(key)}
                        disabled={loading === key}
                    >
                        {loading === key ? "…" : label}
                    </Button>
                    <span className="text-xs text-bridge-500 dark:text-bridge-400">
                        {results[key] ?? desc}
                    </span>
                </div>
            ))}
        </div>
    );
}
