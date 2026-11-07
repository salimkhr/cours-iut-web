import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import {connectToDB} from "@/lib/mongodb";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import RagUsagePanel from "@/components/admin/RagUsagePanel";
import {listUsage, summarizeUsage} from "@/lib/rag/usage";
import {DEFAULT_COLLECTION, getLastSync} from "@/lib/rag/runSync";
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

    const db = await connectToDB();
    const [entries, lastSyncAt] = await Promise.all([listUsage(db, 200), getLastSync(db, DEFAULT_COLLECTION)]);

    return (
        <>
            <AdminPageHeader
                eyebrow="Administration"
                title="Appels RAG"
                description="Mise à jour de l'index et chaque appel à l'API d'embedding de Mistral : indexation, synchros et recherches. Les 200 plus récents, totaux calculés sur cette liste."
            />
            <RagUsagePanel
                entries={entries.map((entry) => ({...entry, createdAt: entry.createdAt.toISOString()}))}
                summary={summarizeUsage(entries)}
                lastSyncAt={lastSyncAt?.toISOString() ?? null}
            />
        </>
    );
}
