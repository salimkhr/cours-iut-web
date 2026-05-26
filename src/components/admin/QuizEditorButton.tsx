'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {ClipboardList} from 'lucide-react';
import QuizEditorSheet from '@/components/admin/QuizEditorSheet';
import Section from '@/types/Section';
import Module from '@/types/Module';

interface QuizEditorButtonProps {
    section: Section;
    modData: Module;
}

export default function QuizEditorButton({section, modData}: QuizEditorButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="outline"
                size="icon"
                className="h-9 w-9 border-bridge-500/40"
                aria-label="Éditer le quiz"
            >
                <ClipboardList className="w-4 h-4"/>
            </Button>
            <QuizEditorSheet
                section={section}
                modData={modData}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    );
}
