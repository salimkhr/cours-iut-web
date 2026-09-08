import type Section from "@/types/Section";
import {Badge} from "@/components/ui/badge";

interface SectionPedagogyPanelProps {
    section: Section;
}

function Lines({items}: {items?: string[]}) {
    if (!items?.length) {
        return <p className="text-sm italic text-bridge-400 dark:text-bridge-500">Non renseigné</p>;
    }

    return (
        <ul className="list-disc space-y-1 pl-5">
            {items.map((item) => (
                <li key={item} className="text-sm text-brand-dark dark:text-bridge-100">{item}</li>
            ))}
        </ul>
    );
}

function Field({label, children}: {label: string; children: React.ReactNode}) {
    return (
        <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-dark/55 dark:text-bridge-200/55">
                {label}
            </p>
            {children}
        </div>
    );
}

export default function SectionPedagogyPanel({section}: SectionPedagogyPanelProps) {
    return (
        <section className="rounded-2xl border border-bridge-500/35 bg-bridge-50 p-5 shadow-sm dark:bg-bridge-800 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">Pédagogie</p>
                    <h2 className="mt-1 text-xl font-bold text-brand-dark dark:text-brand-light">Prévu et réalisé</h2>
                    <p className="mt-1 text-sm text-bridge-500 dark:text-bridge-400">
                        Consultez le brief de la section et ce qui a réellement été enseigné.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{section.totalDuration} séance{section.totalDuration > 1 ? "s" : ""}</Badge>
                    {section.courseIntroMinutes !== undefined && (
                        <Badge variant="outline">{section.courseIntroMinutes} min de cours</Badge>
                    )}
                </div>
            </div>

            <div className="mt-6 grid gap-6 border-t border-bridge-500/25 pt-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="font-semibold text-brand-dark dark:text-bridge-100">
                        Brief <span className="font-normal text-bridge-500">(le prévu)</span>
                    </h3>
                    <Field label="Objectifs"><Lines items={section.brief?.objectives}/></Field>
                    <Field label="Notions à couvrir"><Lines items={section.brief?.notions}/></Field>
                    <Field label="Étape fil rouge">
                        <p className="text-sm text-brand-dark dark:text-bridge-100">
                            {section.brief?.filRougeStep || "Non renseigné"}
                        </p>
                    </Field>
                    {section.brief?.notes && (
                        <Field label="Notes">
                            <p className="text-sm text-brand-dark dark:text-bridge-100">{section.brief.notes}</p>
                        </Field>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-brand-dark dark:text-bridge-100">
                        Curriculum <span className="font-normal text-bridge-500">(le réalisé)</span>
                    </h3>
                    <Field label="Notions enseignées"><Lines items={section.curriculum?.notions}/></Field>
                    <Field label="APIs vues"><Lines items={section.curriculum?.apis}/></Field>
                </div>
            </div>
        </section>
    );
}
