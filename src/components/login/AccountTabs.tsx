"use client";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {History, Lock, User} from "lucide-react";
import ProfileForm from "@/components/login/ProfileForm";
import PasswordForm from "@/components/login/PasswordForm";
import SessionsPanel from "@/components/login/SessionsPanel";
import {Group} from "@/lib/schemas/register.schema";

type Props = {
    initialFirstName: string;
    initialLastName: string;
    email: string;
    imageUrl: string | null;
    group: Group | null;
};

export default function AccountTabs({initialFirstName, initialLastName, email, imageUrl, group}: Props) {
    return (
        <div className="space-y-5">

            {/* ── Résumé utilisateur ── */}
            <div className="flex items-center gap-3">
                <span className="block w-11 h-11 rounded-full overflow-hidden shrink-0 bg-muted border border-border">
                    {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl} alt="avatar" className="w-full h-full object-cover"/>
                    ) : (
                        <span className="flex items-center justify-center w-full h-full">
                            <User className="w-5 h-5 text-muted-foreground"/>
                        </span>
                    )}
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-dark dark:text-brand-light truncate">
                        {initialFirstName} {initialLastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{email}</p>
                </div>
            </div>

            {/* ── Tabs ── */}
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="profile" className="flex items-center gap-1.5">
                        <User className="h-4 w-4"/>
                        Profil
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-1.5">
                        <Lock className="h-4 w-4"/>
                        Sécurité
                    </TabsTrigger>
                    <TabsTrigger value="sessions" className="flex items-center gap-1.5">
                        <History className="h-4 w-4"/>
                        Sessions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-5 min-h-[380px]">
                    <ProfileForm
                        initialFirstName={initialFirstName}
                        initialLastName={initialLastName}
                        email={email}
                        imageUrl={imageUrl}
                        group={group}
                    />
                </TabsContent>

                <TabsContent value="security" className="mt-5 min-h-[380px]">
                    <PasswordForm/>
                </TabsContent>

                <TabsContent value="sessions" className="mt-5 min-h-[380px]">
                    <SessionsPanel/>
                </TabsContent>
            </Tabs>
        </div>
    );
}
