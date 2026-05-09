import {ReactNode} from "react";

interface CoursesSectionProps {
    title: string;
    children: ReactNode;
    containerClassName?: string;
}

export default function CoursesSection({
                                           title,
                                           children,
                                           containerClassName = "grid gap-6 lg:gap-8 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                       }: CoursesSectionProps) {
    return (
        <section className="w-full px-6 lg:pl-12 lg:pr-6 pb-16 lg:pb-24">
            <div className="flex flex-col items-start mb-10 lg:mb-14 opacity-0 animate-fade-in-up">
                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-left text-brand-dark dark:text-brand-light">
                    {title}
                </h2>
                <span aria-hidden="true" className="block w-24 h-1 bg-brand-primary rounded-full mt-4"/>
            </div>
            <div className={containerClassName}>{children}</div>
        </section>
    );
}
