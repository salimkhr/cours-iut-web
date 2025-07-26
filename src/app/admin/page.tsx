import React from "react";
import {getModules} from "@/hook/useModules";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ModulesTab from "@/components/admin/ModulesTab";

export default async function AdminDashboard() {
    // const session = await getServerSession(authOptions);

    // if (!session || session.user.role !== "ADMIN") {
    //     redirect("/");
    // }

    const modules = await getModules()

    return (
        <Tabs defaultValue="modules" className="p-10">
            <TabsList>
                <TabsTrigger value="modules">Modules</TabsTrigger>
                {/*<TabsTrigger value="sections">Sections</TabsTrigger>*/}
                {/*<TabsTrigger value="contents">Contenus</TabsTrigger>*/}
            </TabsList>

            <TabsContent value="modules">
                <ModulesTab modules={modules}/>
            </TabsContent>
            {/*<TabsContent value="sections">*/}
            {/*    <SectionsTab/>*/}
            {/*</TabsContent>*/}
            {/*<TabsContent value="contents">*/}
            {/*    <ContentsTab/>*/}
            {/*</TabsContent>*/}
        </Tabs>
    );
}
