import {ReactNode} from "react";

interface CoursesSectionProps {
    title: string;
    children: ReactNode;
    containerClassName?: string;
}

export default function CoursesSection({
                                           title,
                                           children,
                                           containerClassName="grid gap-6 lg:gap-8 w-full p-4 lg:px-40 mx-auto grid-cols-[repeat(auto-fit,minmax(400px,1fr))]"
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
