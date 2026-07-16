import Link from "next/link";
import {notFound} from "next/navigation";
import {BookOpen, ChevronRight, EyeOff, FileCheck2, Lock, Users} from "lucide-react";
import {getServerSession} from "@/lib/auth";
import getModules from "@/lib/getModules";
import getAdminUsers from "@/lib/admin/getAdminUsers";
import iconMap from "@/lib/iconMap";
import {moduleColor} from "@/lib/moduleColor";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import StatCard from "@/components/admin/ui/StatCard";
import Eyebrow from "@/components/admin/ui/Eyebrow";
import {ADMIN_CARD} from "@/components/admin/ui/adminStyles";

export default async function AdminOverviewPage() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        notFound();
    }

    const [modules, users] = await Promise.all([getModules(), getAdminUsers()]);

    const sections = modules.flatMap((mod) => mod.sections ?? []);
    const hiddenModules = modules.filter((mod) => mod.isVisible === false).length;
    const publishedSections = sections.filter((s) => s.isAvailable).length;
    const examSections = sections.filter((s) => s.contents?.some((c) => c.type === "examen"));
    const lockedExams = examSections.filter((s) => s.examenIsLock).length;
    const adminCount = users.filter((u) => u.role === "admin").length;

    return (
        <>
            <AdminPageHeader
                eyebrow="Administration"
                title="Vue d'ensemble"
                description="L'état du site en un coup d'œil : contenus, comptes et outils."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={BookOpen}
                    label="Modules"
                    value={modules.length}
                    detail={hiddenModules > 0 ? `dont ${hiddenModules} masqué${hiddenModules > 1 ? "s" : ""}` : "tous visibles"}
                    href="/admin/modules"
                />
                <StatCard
                    icon={FileCheck2}
                    label="Sections"
                    value={`${publishedSections}/${sections.length}`}
                    detail="publiées"
                    href="/admin/modules"
                />
                <StatCard
                    icon={Lock}
                    label="Examens"
                    value={`${lockedExams}/${examSections.length}`}
                    detail="verrouillés"
                    href="/admin/modules"
                />
                <StatCard
                    icon={Users}
                    label="Comptes"
                    value={users.length}
                    detail={`dont ${adminCount} admin${adminCount > 1 ? "s" : ""}`}
                    href="/admin/utilisateurs"
                />
            </div>

            <section className="mt-8 space-y-3">
                <div>
                    <Eyebrow>Contenu pédagogique</Eyebrow>
                    <h2 className="mt-1 text-xl font-bold text-brand-dark dark:text-bridge-100">
                        Modules
                    </h2>
                </div>
                <ul className={`${ADMIN_CARD} divide-y divide-bridge-500/15 overflow-hidden`}>
                    {modules.map((mod) => {
                        const Icon = iconMap[mod.iconName] || BookOpen;
                        const modSections = mod.sections ?? [];
                        const published = modSections.filter((s) => s.isAvailable).length;
                        const hidden = mod.isVisible === false;
                        return (
                            <li key={mod.path}>
                                <Link
                                    href="/admin/modules"
                                    className="flex min-h-11 items-center gap-3 px-4 py-3 transition-colors hover:bg-bridge-100/50 dark:hover:bg-bridge-900/30"
                                >
                                    <span
                                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
                                        style={{backgroundColor: moduleColor(mod)}}
                                    >
                                        <Icon className="size-4" aria-hidden="true"/>
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-brand-dark dark:text-bridge-100">
                                            {mod.title}
                                        </p>
                                        <p className="text-xs text-bridge-600 dark:text-bridge-300">
                                            {modSections.length} section{modSections.length > 1 ? "s" : ""} · {published} publiée{published > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                    {hidden && (
                                        <span className="flex shrink-0 items-center gap-1 rounded-md bg-bridge-200/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-bridge-700 dark:bg-bridge-700/60 dark:text-bridge-300">
                                            <EyeOff className="size-3" aria-hidden="true"/>
                                            Masqué
                                        </span>
                                    )}
                                    <ChevronRight className="size-4 shrink-0 text-bridge-500" aria-hidden="true"/>
                                </Link>
                            </li>
                        );
                    })}
                    {modules.length === 0 && (
                        <li className="px-4 py-8 text-center text-sm text-bridge-500 dark:text-bridge-400">
                            Aucun module. Créez-en un depuis « Modules & sections ».
                        </li>
                    )}
                </ul>
            </section>
        </>
    );
}
