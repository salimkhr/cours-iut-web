import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import getModules from "@/lib/getModules";
import AdminPageHeader from "@/components/admin/ui/AdminPageHeader";
import ModulesList from "@/components/admin/ModulesList";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

export const metadata = generatePageMetadata({
    defaultTitle: "Modules & sections",
    noIndex: true,
});

export default async function AdminModulesPage() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        notFound();
    }

    const modules = await getModules();

    return (
        <>
            <AdminPageHeader
                eyebrow="Administration"
                title="Modules & sections"
                description="Publiez les sections, ouvrez les corrections et verrouillez les examens."
            />
            <ModulesList initialModules={modules}/>
        </>
    );
}
