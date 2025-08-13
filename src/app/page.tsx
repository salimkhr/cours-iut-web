import ModuleCard from "@/components/Cards/ModuleCard";
import Link from "next/link";
import getModules from "@/lib/getModules";
import HeroSection from "@/components/page/HeroSection";
import CoursesSection from "@/components/page/CoursesSection";
import PageFooter from "@/components/page/PageFooter";

export default async function Home() {
    const modules = await getModules();

    return (
        <div className="flex flex-col w-full items-center justify-start min-h-screen">
            <HeroSection
                title="Développement Web"
                description="Maîtriser les bases du développement web front-end et back-end pour exploiter efficacement les frameworks modernes."
                imagePath="/header.svg"
                imageAlt="Développement Web"
            />

            <CoursesSection title="Liste des cours">
                {modules.map((currentModule, index) => (
                    <Link
                        key={`${currentModule.path}_${index}`}
                        className="opacity-0 animate-fade-in-up"
                        style={{animationDelay: `${index * 0.1}s`}}
                        href={currentModule.path}
                    >
                        <ModuleCard currentModule={currentModule}/>
                    </Link>
                ))}
            </CoursesSection>

            <PageFooter imagePath="/footer.svg"/>
        </div>
    );
}