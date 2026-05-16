'use client';

import { BookOpen, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsersTable from '@/components/admin/users/UsersTable';
import ModulesList from '@/components/admin/ModulesList';
import type { AdminUser } from '@/components/admin/users/UsersTable';
import type Module from '@/types/Module';

interface AdminTabsProps {
    users: AdminUser[];
    modules: Module[];
}

export default function AdminTabs({ users, modules }: AdminTabsProps) {
    return (
        <Tabs defaultValue="users">
            <TabsList className="mb-6 bg-bridge-100/60 dark:bg-bridge-800/60 border border-bridge-500/30">
                <TabsTrigger
                    value="users"
                    className="flex items-center gap-2 data-[state=active]:bg-brand-primary data-[state=active]:text-white"
                >
                    <Users className="w-4 h-4" />
                    Utilisateurs
                    <span className="ml-1 text-[10px] opacity-70">({users.length})</span>
                </TabsTrigger>
                <TabsTrigger
                    value="content"
                    className="flex items-center gap-2 data-[state=active]:bg-brand-primary data-[state=active]:text-white"
                >
                    <BookOpen className="w-4 h-4" />
                    Contenu
                </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
                <UsersTable users={users} />
            </TabsContent>

            <TabsContent value="content">
                <ModulesList initialModules={modules} />
            </TabsContent>
        </Tabs>
    );
}
