"use client";

import {useState} from "react";
import {ExternalLink} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Alert, AlertDescription} from "@/components/ui/alert";
import type Module from "@/types/Module";

interface ReferenceStepProps {
    module: Module;
    onSaved: (patch: Partial<Module>) => void;
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
    const json = await res.json().catch(() => ({})) as {error?: unknown};
    return typeof json.error === "string" ? json.error : fallback;
}

export default function ReferenceStep({module, onSaved}: ReferenceStepProps) {
    const [validating, setValidating] = useState(false);
    const specValidated = module.projectSpec?.status === "validated";
    const repo = module.projectSpec?.referenceRepo;

    const handleValidate = async () => {
        if (!repo) return;
        setValidating(true);
        try {
            const res = await fetch(`/api/admin/modules/${module._id}/validate`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({gate: "referenceRepo"}),
            });

            if (!res.ok) {
                toast.error(await readErrorMessage(res, "Erreur lors de la validation du dépôt de référence."));
                return;
            }

            toast.success("Code de référence validé.");
            onSaved({
                projectSpec: {...module.projectSpec!, referenceRepo: {...repo, status: "validated"}},
            });
        } finally {
            setValidating(false);
        }
    };

    if (!specValidated) {
        return (
            <p className="text-sm text-bridge-600 dark:text-bridge-300">
                Validez d&apos;abord la spec projet.
            </p>
        );
    }

    if (!repo) {
        return (
            <p className="text-sm text-bridge-600 dark:text-bridge-300">
                Aucun code de référence poussé. Demandez à l&apos;assistant de coder le projet, il
                le poussera ici (outil MCP <code>push_project_reference</code>).
            </p>
        );
    }

    const repoLink = (
        <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-dark underline underline-offset-2 dark:text-bridge-200"
        >
            <ExternalLink className="size-4" aria-hidden="true"/>
            {repo.url}
        </a>
    );

    if (repo.status === "validated") {
        return (
            <div className="flex flex-col items-start gap-3">
                <Badge className="bg-bridge-700 text-white dark:bg-bridge-500">Validé</Badge>
                {repoLink}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-4">
            {repoLink}
            <Alert>
                <AlertDescription>
                    Valider ouvre la rédaction des cours et des TP. Les supports seront écrits pour
                    atteindre ce code : relisez-le avant.
                </AlertDescription>
            </Alert>
            <Button type="button" disabled={validating} onClick={handleValidate} className="min-h-11">
                {validating ? "Validation…" : "J'ai relu, valider le code de référence"}
            </Button>
        </div>
    );
}
