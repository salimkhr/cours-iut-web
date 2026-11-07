import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import {connectToDB} from "@/lib/mongodb";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import RagUsagePanel from "@/components/admin/RagUsagePanel";
import {listUsage, summarizeUsage} from "@/lib/rag/usage";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

export const metadata = generatePageMetadata({
    defaultTitle: "RAG",
    noIndex: true,
});

export default async function AdminRagPage() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        notFound();
    }

    const entries = await listUsage(await connectToDB(), 200);

    return (
        <>
            <AdminPageHeader
                eyebrow="Administration"
                title="Appels RAG"
                description="Chaque appel à l'API d'embedding de Mistral : indexation des cours et recherches. Les 200 plus récents, totaux calculés sur cette liste."
            />
            <RagUsagePanel
                entries={entries.map((entry) => ({...entry, createdAt: entry.createdAt.toISOString()}))}
                summary={summarizeUsage(entries)}
            />
        </>
    );
}
