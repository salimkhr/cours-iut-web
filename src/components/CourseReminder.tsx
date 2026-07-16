import {ReactNode} from "react"
import BaseCard from "@/components/Cards/BaseCard";
import {BookTextIcon} from "@/components/icons/book-text";
import type Module from "@/types/Module";

type CourseReminderProps = {
    title?: string
    children?: ReactNode
    currentModule?: Module;
}

// Composant réutilisable pour afficher un rappel de cours
export default function CourseReminder({
                                           title = "Rappel de cours",
                                           children,
                                           currentModule,
                                       }: CourseReminderProps) {

    const header = (
            <div className="flex gap-2">
                <BookTextIcon size={24} className="text-white" />
                <span className="text-sm text-white font-mono">{title}</span>
            </div>
    );
    return (


        <BaseCard
            header={header}
            content={<div className="text-base text-left leading-relaxed">{children}</div>}
            currentModule={currentModule}
            withHover={false}
            withLed={false}
        />
    )
}
