import {notFound} from "next/navigation";
import {BookOpen, FileCheck2, Lock, Users} from "lucide-react";
import {getServerSession} from "@/lib/auth";
import getModules from "@/lib/getModules";
import getAdminUsers from "@/lib/admin/getAdminUsers";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import StatCard from "@/components/admin/ui/StatCard";

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

        </>
    );
}
