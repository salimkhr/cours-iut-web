import getModules from '@/lib/getModules';
import { generatePageMetadata } from '@/lib/generatePageMetadata';
import { Badge } from '@/components/ui/badge';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import { ADMIN_CARD } from '@/components/admin/ui/adminStyles';

export const metadata = generatePageMetadata({
    defaultTitle: 'Pédagogie — briefs & curriculums',
    noIndex: true,
});

function Lines({ items }: { items?: string[] }) {
    if (!items || items.length === 0) {
        return <p className="text-sm italic text-bridge-400 dark:text-bridge-500">—</p>;
    }
    return (
        <ul className="list-disc pl-4 space-y-0.5">
            {items.map((item, i) => (
                <li key={i} className="text-sm text-brand-dark dark:text-bridge-100">{item}</li>
            ))}
        </ul>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55 mb-1">
            {children}
        </p>
    );
}

export default async function PedagogiePage() {
    const modules = await getModules();
    const withPedagogy = modules
        .filter((mod) => (mod.sections ?? []).some((s) => s.brief || s.curriculum || s.courseIntroMinutes !== undefined))
        .sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));

    return (
        <>
            <AdminPageHeader
                eyebrow="Administration"
                title="Pédagogie"
                description="Consultation des briefs (le prévu, écrit par module-design) et des curriculums (le réalisé, mis à jour par content-writer) de chaque section."
            />

            {withPedagogy.length === 0 && (
                <p className="text-sm italic text-bridge-400 dark:text-bridge-500">Aucun module avec brief ou curriculum.</p>
            )}

            {withPedagogy.map((mod) => {
                const sections = [...(mod.sections ?? [])].sort((a, b) => a.order - b.order);
                const totalSeances = sections.reduce((sum, s) => sum + (s.totalDuration ?? 0), 0);
                return (
                    <section key={mod.path} className="mb-12">
                        <div className="flex flex-wrap items-baseline gap-3 mb-1">
                            <h2 className="text-xl font-bold text-brand-dark dark:text-bridge-100">{mod.title}</h2>
                            <Badge variant="outline">{totalSeances} séance{totalSeances > 1 ? 's' : ''}</Badge>
                            {mod.sessionDurationMinutes !== undefined && (
                                <Badge variant="outline">{mod.sessionDurationMinutes} min / séance</Badge>
                            )}
                        </div>
                        {mod.universe && (
                            <p className="text-sm text-bridge-500 dark:text-bridge-400 mb-5">
                                Univers : <strong>{mod.universe.name}</strong> — {mod.universe.description}
                            </p>
                        )}

                        <div className="flex flex-col gap-5">
                            {sections.map((s) => (
                                <article
                                    key={s.path}
                                    className={`${ADMIN_CARD} p-5`}
                                >
                                    <div className="flex flex-wrap items-baseline gap-2 mb-3">
                                        <h3 className="font-semibold text-brand-dark dark:text-bridge-100">
                                            {s.order}. {s.title}
                                        </h3>
                                        <Badge variant="secondary">
                                            {s.totalDuration} séance{s.totalDuration > 1 ? 's' : ''}
                                        </Badge>
                                        {s.courseIntroMinutes !== undefined && (
                                            <Badge variant="secondary">{s.courseIntroMinutes} min de cours</Badge>
                                        )}
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm font-semibold text-brand-dark dark:text-bridge-100 mb-2">
                                                Brief <span className="font-normal text-bridge-500">(le prévu)</span>
                                            </p>
                                            <div className="flex flex-col gap-3">
                                                <div>
                                                    <FieldLabel>Objectifs</FieldLabel>
                                                    <Lines items={s.brief?.objectives}/>
                                                </div>
                                                <div>
                                                    <FieldLabel>Notions à couvrir</FieldLabel>
                                                    <Lines items={s.brief?.notions}/>
                                                </div>
                                                <div>
                                                    <FieldLabel>Étape fil rouge</FieldLabel>
                                                    {s.brief?.filRougeStep
                                                        ? <p className="text-sm text-brand-dark dark:text-bridge-100">{s.brief.filRougeStep}</p>
                                                        : <p className="text-sm italic text-bridge-400 dark:text-bridge-500">—</p>}
                                                </div>
                                                {s.brief?.notes && (
                                                    <div>
                                                        <FieldLabel>Notes</FieldLabel>
                                                        <p className="text-sm text-brand-dark dark:text-bridge-100">{s.brief.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-brand-dark dark:text-bridge-100 mb-2">
                                                Curriculum <span className="font-normal text-bridge-500">(le réalisé)</span>
                                            </p>
                                            <div className="flex flex-col gap-3">
                                                <div>
                                                    <FieldLabel>Notions enseignées</FieldLabel>
                                                    <Lines items={s.curriculum?.notions}/>
                                                </div>
                                                <div>
                                                    <FieldLabel>APIs vues</FieldLabel>
                                                    <Lines items={s.curriculum?.apis}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                );
            })}
        </>
    );
}
