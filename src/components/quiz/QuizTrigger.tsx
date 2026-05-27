import Link from "next/link";
import {ClipboardCheck} from "lucide-react";
import {Button} from "@/components/ui/button";

interface QuizTriggerProps {
    moduleSlug: string;
    sectionSlug: string;
    modulePath: string;
    questionCount: number;
}

export default function QuizTrigger({moduleSlug, sectionSlug, modulePath, questionCount}: QuizTriggerProps) {
    const moduleColor = `var(--color-${modulePath})`;
    return (
        <Button
            asChild
            className="gap-2 text-white dark:text-brand-dark"
            style={{backgroundColor: moduleColor}}
        >
            <Link href={`/${moduleSlug}/${sectionSlug}/quiz`}>
                <ClipboardCheck className="w-4 h-4"/>
                Tester mes connaissances ({questionCount} question{questionCount > 1 ? "s" : ""})
            </Link>
        </Button>
    );
}
