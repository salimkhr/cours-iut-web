import Link from "next/link";
import {notFound} from "next/navigation";
import {ArrowLeft} from "lucide-react";
import {getServerSession} from "@/lib/auth";
import getModules from "@/lib/getModules";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import QuizResultsTable from "@/components/quiz/admin/QuizResultsTable";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

export const metadata = generatePageMetadata({defaultTitle: "Résultats du quiz", noIndex: true});

/** Relevé des notes du quiz live d'un module : page à part, l'onglet Quiz ne gère que les questions. */
export default async function AdminQuizResultsPage({params}: {params: Promise<{slug: string}>}) {
    const session = await getServerSession();
    if (session?.user.role !== "admin") notFound();

    const {slug} = await params;
    const modules = await getModules();
    const mod = modules.find((candidate) => candidate.path === slug);
    if (!mod) notFound();

    return (
        <>
            <Link href={`/admin/modules/${mod.path}?onglet=quiz`}
                  className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-bridge-600 underline-offset-4 hover:underline dark:text-bridge-300">
                <ArrowLeft className="size-4" aria-hidden="true"/>
                Quiz {mod.title}
            </Link>
            <AdminPageHeader
                eyebrow="Quiz"
                title={`Résultats · ${mod.title}`}
                description="Une ligne par étudiant et par session. Dépliez « Détail des réponses » pour voir chaque question."
            />
            <QuizResultsTable moduleId={String(mod._id)}/>
        </>
    );
}
