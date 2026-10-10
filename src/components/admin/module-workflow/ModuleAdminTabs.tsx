"use client";

import type Module from "@/types/Module";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ModuleWorkflow from "@/components/admin/module-workflow/ModuleWorkflow";
import QuizPanel from "@/components/quiz/admin/QuizPanel";

/** Onglets de l'administration d'un module : workflow de rédaction et quiz live. */
export type ModuleAdminTab = "workflow" | "quiz";

export default function ModuleAdminTabs({module, initialTab = "workflow"}: {module: Module; initialTab?: ModuleAdminTab}) {
    return (
        <Tabs defaultValue={initialTab} className="gap-6">
            <TabsList aria-label="Sections de l'administration du module">
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>
            <TabsContent value="workflow">
                <ModuleWorkflow module={module}/>
            </TabsContent>
            <TabsContent value="quiz">
                <QuizPanel moduleId={String(module._id)}/>
            </TabsContent>
        </Tabs>
    );
}
