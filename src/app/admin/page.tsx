import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {cn} from "@/lib/utils";
import {AdminSection} from "@/components/AdminSection";
import getMergedModules from "@/hook/getMergedModules";


export default async function LoginPage() {

    const cookieStore = await cookies();
    const hasSession = cookieStore.has('session');

    if (!hasSession) {
        redirect('/login')
    }
    const modules = getMergedModules();

    return (
        <div className="items-center justify-center p-4 pb-25">
            <h1 className="text-2xl font-bold text-center">Gestion des Modules</h1>
            <Accordion type="multiple" className="w-full">
                {modules.map((mod) => (
                    <AccordionItem key={mod.id} value={mod.id}>
                        <AccordionTrigger className="text-left text-lg font-medium">
                            {mod.title}
                        </AccordionTrigger>
                        <AccordionContent
                            className={cn(
                                "grid gap-4 p-2 sm:p-3 md:p-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
                                `header-${mod?.path}`
                            )}
                        >
                            {mod.sections.map((sec) => (
                                <div
                                    key={sec.id}
                                    className="flex-1  space-y-2"
                                >
                                    <AdminSection
                                        section={sec}
                                        moduleId={mod.id}
                                    />
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}