import {ReactNode} from "react";

interface CoursesSectionProps {
    title: string;
    children: ReactNode;
    containerClassName?: string;
}

export default function CoursesSection({
                                           title,
                                           children,
                                           containerClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full p-4 lg:px-40 mx-auto mb-12 lg:mb-16"
                                       }: CoursesSectionProps) {
    return (
        <section className="w-full px-4 lg:px-8  z-100">
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-4 lg:mb-8 text-center opacity-0 animate-fade-in-up">
                {title}
            </h2>
            <div className={containerClassName}>{children}</div>
        </section>
    );
}
