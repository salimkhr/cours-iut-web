import Link from "next/link";
import {ArrowRight, LogIn, UserPlus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

interface AuthCTAPairProps {
    className?: string;
}

export default function AuthCTAPair({className}: AuthCTAPairProps) {
    return (
        <div className={cn("flex flex-col sm:flex-row gap-3", className)}>
            <Button
                asChild
                size="lg"
                className="group h-auto rounded-lg bg-brand-accent-dark text-white hover:bg-brand-accent-dark hover:-translate-y-0.5 px-6 py-3 text-sm font-semibold tracking-wide shadow-[0_8px_24px_-10px_rgba(194,65,12,0.55)] hover:shadow-[0_14px_36px_-12px_rgba(194,65,12,0.75)] transition-all duration-300"
            >
                <Link href="/login">
                    <LogIn className="w-4 h-4"/>
                    Se connecter
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"/>
                </Link>
            </Button>
            <Button
                asChild
                variant="outline"
                size="lg"
                className="h-auto rounded-lg border-2 border-brand-accent-dark bg-transparent text-brand-dark dark:text-brand-light hover:bg-brand-accent-dark hover:text-white hover:border-brand-accent-dark px-6 py-3 text-sm font-semibold tracking-wide shadow-none transition-all duration-300"
            >
                <Link href="/register">
                    <UserPlus className="w-4 h-4"/>
                    Créer un compte
                </Link>
            </Button>
        </div>
    );
}
