import Link from "next/link";
import {CheckCircle2} from "lucide-react";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {Metadata} from "next";
import {Button} from "@/components/ui/button";

export const metadata: Metadata = generatePageMetadata({
    defaultTitle: "Email confirmé — Cours Web",
    noIndex: true,
});

export default function EmailVerifiePage() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
            <div className="flex flex-col items-center gap-6 max-w-sm text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400"/>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-brand-dark dark:text-brand-light">
                        Email confirmé&nbsp;!
                    </h1>
                    <p className="text-sm text-brand-dark/60 dark:text-brand-light/60">
                        Votre adresse email a bien été vérifiée. Votre compte est maintenant actif.
                    </p>
                </div>

                <Button asChild className="bg-brand-accent-dark hover:bg-brand-accent-dark/90 text-white dark:text-brand-dark">
                    <Link href="/">Accéder aux cours</Link>
                </Button>
            </div>
        </main>
    );
}
