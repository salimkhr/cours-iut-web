import React from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ModulesTab from "@/components/admin/ModulesTab";
import SectionsTab from "@/components/admin/SectionsTab";
import {getModules} from "@/lib/prisma/data";
import {getSections} from "@/hook/useSection";

export default async function AdminDashboard() {
    // const session = await getServerSession(authOptions);

    // if (!session || session.user.role !== "ADMIN") {
    //     redirect("/");
    // }

    const modules = await getModules()
    const sections = await getSections()

    return (
        <Tabs defaultValue="modules" className="p-10">
            <TabsList>
                <TabsTrigger value="modules">Modules</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
                <TabsTrigger value="contents">Contenus</TabsTrigger>
            </TabsList>

            <TabsContent value="modules">
                <ModulesTab modules={modules}/>
            </TabsContent>
            <TabsContent value="sections">
                <SectionsTab sections={sections}/>
            </TabsContent>
            {/*<TabsContent value="contents">*/}
            {/*    <ContentsTab/>*/}
            {/*</TabsContent>*/}
        </Tabs>
    );
}
