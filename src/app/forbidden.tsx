import ErrorLayout from "@/components/error/ErrorLayout";
import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function Forbidden() {
    return (
        <ErrorLayout
            code="403"
            description="Vous n'avez pas les droits pour accéder à cette ressource."
            gifTag="access denied"
            action={
                <Button asChild variant="outline" className="flex-1">
                    <Link href="/login">Se connecter</Link>
                </Button>
            }
        />
    );
}
