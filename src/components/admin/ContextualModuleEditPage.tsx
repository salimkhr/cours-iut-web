"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {ArrowLeft} from "lucide-react";
import type Module from "@/types/Module";
import {Button} from "@/components/ui/button";
import CadrageStep from "@/components/admin/module-workflow/steps/CadrageStep";

interface ContextualModuleEditPageProps {
    module: Module;
}

export default function ContextualModuleEditPage({module}: ContextualModuleEditPageProps) {
    const router = useRouter();

    return (
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 lg:px-10 lg:py-12">
            <div>
                <Button asChild variant="ghost" className="-ml-3 gap-2">
                    <Link href={`/${module.path}`}>
                        <ArrowLeft className="size-4" aria-hidden="true"/>
                        Retour au module
                    </Link>
                </Button>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
                    Administration
                </p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-dark dark:text-brand-light lg:text-4xl">
                    Modifier {module.title}
                </h1>
                <p className="mt-2 text-sm text-bridge-600 dark:text-bridge-300">
                    Mettez à jour les informations affichées sur la page publique du module.
                </p>
            </div>

            <section className="rounded-2xl border border-bridge-500/35 bg-bridge-50 p-5 shadow-sm dark:bg-bridge-800 sm:p-7">
                <CadrageStep
                    module={module}
                    onSaved={() => {
                        router.push(`/${module.path}`);
                        router.refresh();
                    }}
                />
            </section>
        </main>
    );
}
