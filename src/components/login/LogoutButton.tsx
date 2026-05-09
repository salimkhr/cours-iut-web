"use client";

import {LogOut} from "lucide-react";
import {SignOutButton} from "@clerk/nextjs";
import {Button} from "@/components/ui/button";

export default function LogoutButton() {
    return (
        <SignOutButton>
            <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
            >
                <LogOut className="size-5" />
            </Button>
        </SignOutButton>
    );
}