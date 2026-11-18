import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import getModules from "@/lib/getModules";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import AdminToolsPanel from "@/components/admin/AdminToolsPanel";
import ExamModeCard from "@/components/admin/ExamModeCard";
import {getExamMode} from "@/lib/examMode";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

export const metadata = generatePageMetadata({
    defaultTitle: "Outils techniques",
    noIndex: true,
});

export default async function AdminToolsPage() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        notFound();
    }

    const modules = await getModules();
    const moduleOptions = modules.map((mod) => ({path: mod.path, title: mod.title}));
    const examMode = await getExamMode();

    return (
        <>
            <AdminPageHeader
                eyebrow="Administration"
                title="Outils techniques"
                description="Mode examen, migration des contenus et transfert entre environnements."
            />
            <div className="flex flex-col gap-6">
                <ExamModeCard
                    initial={{
                        active: examMode.active,
                        until: examMode.until?.toISOString() ?? null,
                        enabledBy: examMode.enabledBy,
                    }}
                />
                <AdminToolsPanel modules={moduleOptions}/>
            </div>
        </>
    );
}
