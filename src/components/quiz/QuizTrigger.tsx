'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {ClipboardCheck} from 'lucide-react';
import QuizDialog from '@/components/quiz/QuizDialog';

interface QuizTriggerProps {
    moduleSlug: string;
    sectionSlug: string;
    modulePath: string;
    questionCount: number;
}

export default function QuizTrigger({moduleSlug, sectionSlug, modulePath, questionCount}: QuizTriggerProps) {
    const [open, setOpen] = useState(false);
    const moduleColor = `var(--color-${modulePath})`;

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="gap-2 text-white dark:text-brand-dark"
                style={{backgroundColor: moduleColor}}
            >
                <ClipboardCheck className="w-4 h-4"/>
                Tester mes connaissances ({questionCount} question{questionCount > 1 ? 's' : ''})
            </Button>
            <QuizDialog
                moduleSlug={moduleSlug}
                sectionSlug={sectionSlug}
                modulePath={modulePath}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    );
}
