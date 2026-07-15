"use client";

import {BookOpen, Settings, Users} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import UsersTable from "@/components/admin/users/UsersTable";
import ModulesList from "@/components/admin/ModulesList";
import AdminToolsPanel from "@/components/admin/AdminToolsPanel";
import type {AdminUser} from "@/components/admin/users/UsersTable";
import type Module from "@/types/Module";
import {ADMIN_DEFAULT_TAB, ADMIN_TABS} from "@/components/admin/adminDashboardConfig";

interface AdminTabsProps {
    users: AdminUser[];
    modules: Module[];
}

const TAB_ICONS = {
    modules: BookOpen,
    users: Users,
    tools: Settings,
} as const;

export default function AdminTabs({users, modules}: AdminTabsProps) {
    return (
        <Tabs defaultValue={ADMIN_DEFAULT_TAB} className="gap-6">
            <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-lg border border-bridge-500/30 bg-bridge-100/60 p-1 dark:bg-bridge-800/60">
                {ADMIN_TABS.map((tab) => {
                    const Icon = TAB_ICONS[tab.value];
                    const count = tab.value === "modules" ? modules.length : tab.value === "users" ? users.length : null;
                    return (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="min-h-11 flex-none gap-2 rounded-md px-3 data-[state=active]:bg-brand-primary data-[state=active]:text-white dark:data-[state=active]:text-brand-dark"
                        >
                            <Icon className="size-4" aria-hidden="true"/>
                            {tab.label}
                            {count !== null && (
                                <span className="ml-1 text-[10px] opacity-75">({count})</span>
                            )}
                        </TabsTrigger>
                    );
                })}
            </TabsList>

            <TabsContent value="modules">
                <ModulesList initialModules={modules}/>
            </TabsContent>

            <TabsContent value="users">
                <UsersTable users={users}/>
            </TabsContent>

            <TabsContent value="tools">
                <AdminToolsPanel/>
            </TabsContent>
        </Tabs>
    );
}
