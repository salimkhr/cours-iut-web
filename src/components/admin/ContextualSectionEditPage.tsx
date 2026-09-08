"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {ArrowLeft} from "lucide-react";
import type Module from "@/types/Module";
import type Section from "@/types/Section";
import {Button} from "@/components/ui/button";
import InlineSectionRow from "@/components/admin/module-workflow/InlineSectionRow";
import SectionPedagogyPanel from "@/components/admin/SectionPedagogyPanel";

interface ContextualSectionEditPageProps {
    module: Module;
    section: Section;
}

export default function ContextualSectionEditPage({module, section}: ContextualSectionEditPageProps) {
    const router = useRouter();
    const sectionHref = `/${module.path}/${section.path}`;

    return (
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 lg:px-10 lg:py-12">
            <div>
                <Button asChild variant="ghost" className="-ml-3 gap-2">
                    <Link href={sectionHref}>
                        <ArrowLeft className="size-4" aria-hidden="true"/>
                        Retour à la section
                    </Link>
                </Button>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">Administration</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-dark dark:text-brand-light lg:text-4xl">
                    Modifier {section.title}
                </h1>
            </div>

            <section className="rounded-2xl border border-bridge-500/35 bg-bridge-50 p-5 shadow-sm dark:bg-bridge-800 sm:p-7">
                <InlineSectionRow
                    module={module}
                    section={section}
                    onDone={(saved) => {
                        if (!saved) {
                            router.push(sectionHref);
                            return;
                        }
                        router.push(`/${module.path}/${saved.path}`);
                        router.refresh();
                    }}
                />
            </section>

            <SectionPedagogyPanel section={section}/>
        </main>
    );
}
