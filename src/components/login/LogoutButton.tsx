'use client';

import {useAuth} from "@/context/AuthContext";
import {LogOut} from "lucide-react";
import {Button} from "@/components/ui/button";

export default function LogoutButton() {
    const {logout} = useAuth();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="flex items-center gap-2"
        >
            <LogOut className="size-5"/>
        </Button>
    );
}
