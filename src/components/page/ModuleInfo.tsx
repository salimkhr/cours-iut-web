"use client";

import Link from "next/link";
import {Info, Mail} from "lucide-react";
import Module from "@/types/Module";
import Instructor from "@/types/Instructor";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";

interface ModuleInfoProps {
    currentModule: Module;
}

function Eyebrow({children}: {children: React.ReactNode}) {
    return (
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55 mb-3">
            {children}
        </p>
    );
}

function InstructorRow({firstName, lastName, email, role, modulePath}: Instructor & {role: string; modulePath: string}) {
    const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
    return (
        <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 select-none", `bg-${modulePath}`)}>
                {initials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
                <Link
                    href={`mailto:${email}`}
                    className={cn("text-sm font-semibold leading-tight hover:underline underline-offset-2", `text-${modulePath}`)}
                >
                    {firstName} {lastName}
                </Link>
                <span className="text-[11px] text-bridge-500 dark:text-bridge-400">{role}</span>
            </div>
            <Link href={`mailto:${email}`} aria-label={`Envoyer un mail à ${firstName} ${lastName}`} className="text-bridge-400 dark:text-bridge-500 hover:text-bridge-600 dark:hover:text-bridge-300 transition-colors duration-200 shrink-0">
                <Mail className="w-3.5 h-3.5"/>
            </Link>
        </div>
    );
}

export default function ModuleInfo({currentModule}: ModuleInfoProps) {
    const {path: modulePath} = currentModule;
    const coefficients = currentModule.coefficients?.filter((c) => c.value > 0) ?? [];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="group inline-flex items-center justify-center gap-2 rounded-lg border-2 border-bridge-700/45 dark:border-bridge-300/45 bg-transparent text-brand-dark dark:text-bridge-100 hover:bg-bridge-700/10 hover:border-bridge-700/70 dark:hover:bg-bridge-300/10 dark:hover:border-bridge-300/70 px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 h-auto"
                >
                    Plus d&apos;infos
                    <Info aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:scale-110"/>
                </Button>
            </DialogTrigger>

            <DialogContent
                className={cn(
                    "max-w-md p-0 overflow-hidden",
                    "bg-[#f7ebd9] dark:bg-[#13110d]",
                    "border border-bridge-500/45 dark:border-bridge-500/35",
                    "shadow-[0_22px_44px_-14px_rgba(147,97,58,0.55)] dark:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.75)]",
                    "[&>button]:text-white [&>button]:ring-offset-transparent [&>button:focus-visible]:ring-white/50",
                )}
                style={{"--module-color": `var(--color-${modulePath})`} as React.CSSProperties}
            >
                {/* Header */}
                <div className={cn("relative flex items-center gap-4 px-6 py-5 pr-14 overflow-hidden", `bg-${modulePath}`)}>
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"/>
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 shrink-0">
                        <Info className="w-5 h-5 text-white" aria-hidden="true"/>
                    </div>
                    <DialogHeader className="p-0 space-y-0 text-left">
                        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/60">Module</p>
                        <DialogTitle className="text-white font-bold text-xl leading-tight">
                            {currentModule.title}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-5">

                    {/* Équipe */}
                    <section>
                        <Eyebrow>Équipe pédagogique</Eyebrow>
                        <div className="flex flex-col gap-3">
                            {currentModule.manager && (
                                <InstructorRow
                                    {...currentModule.manager}
                                    role="Responsable"
                                    modulePath={modulePath}
                                />
                            )}
                            {currentModule.instructors?.map((instructor) => (
                                <InstructorRow
                                    key={instructor.email}
                                    {...instructor}
                                    role="Intervenant"
                                    modulePath={modulePath}
                                />
                            ))}
                            {!currentModule.manager && !currentModule.instructors?.length && (
                                <p className="text-sm text-bridge-500 dark:text-bridge-400">Aucun responsable affecté.</p>
                            )}
                        </div>
                    </section>

                    <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                    {/* SAÉ */}
                    <section>
                        <Eyebrow>SAÉ associée</Eyebrow>
                        {currentModule.associatedSae?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {currentModule.associatedSae.map((sae) => (
                                    <span
                                        key={sae}
                                        className="inline-flex items-center font-mono text-[11px] tracking-tight px-2.5 py-1 rounded-md border border-bridge-700/40 dark:border-bridge-400/40 text-brand-dark dark:text-bridge-100"
                                    >
                                        {sae}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-bridge-500 dark:text-bridge-400">Aucune SAÉ pour ce module.</p>
                        )}
                    </section>

                    {/* Coefficients */}
                    {coefficients.length > 0 && (
                        <>
                            <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>
                            <section>
                                <Eyebrow>Coefficients des compétences</Eyebrow>
                                <div className="flex flex-col gap-2">
                                    {coefficients.map((c) => (
                                        <div key={c.competenceName} className="flex items-center justify-between gap-4">
                                            <span className="text-sm font-medium text-brand-dark dark:text-bridge-100 flex-1 min-w-0">
                                                {c.competenceName}
                                            </span>
                                            <span className={cn("text-sm font-bold font-mono tabular-nums shrink-0", `text-${modulePath}`)}>
                                                {c.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
