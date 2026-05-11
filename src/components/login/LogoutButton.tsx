"use client";

import {LogOut} from "lucide-react";
import {useRouter} from "next/navigation";
import {authClient} from "@/lib/auth-client";
import {Button} from "@/components/ui/button";

export default function LogoutButton() {
    const router = useRouter();

    async function handleSignOut() {
        await authClient.signOut();
        router.push("/");
        router.refresh();
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2"
        >
            <LogOut className="size-5"/>
        </Button>
    );
}
