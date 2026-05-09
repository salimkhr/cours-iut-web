import ModuleCard from "@/components/Cards/ModuleCard";
import Link from "next/link";
import getModules from "@/lib/getModules";
import HeroSection from "@/components/page/HeroSection";
import CoursesSection from "@/components/page/CoursesSection";
import AboutSection from "@/components/page/AboutSection";
import PageFooter from "@/components/page/PageFooter";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {Metadata} from "next";

export const metadata: Metadata = generatePageMetadata({
    defaultTitle: "Développement Web | Salim Khraimeche",
    noIndex: false,
});

export default async function Home() {
    const modules = await getModules();

    return (
        <div className="flex flex-col w-full items-center justify-start min-h-screen bg-brand-light dark:bg-brand-dark">
            <HeroSection
                title="Développement Web"
                description="Maîtriser les bases du développement web front-end et back-end pour exploiter efficacement les frameworks modernes."
                imagePath="/images/header/pont.png"
                imageAlt="Développement Web"
            >
                <Link
                    href="#cours"
                    className="group inline-flex items-center justify-center gap-2 rounded-lg border-[3px] border-brand-primary text-brand-dark dark:text-brand-light hover:bg-brand-primary hover:text-white px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300"
                >
                    Voir les cours
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4 text-brand-primary group-hover:text-white transition-all duration-300 group-hover:translate-x-1"
                    >
                        <path d="M5 12h14"/>
                        <path d="M13 5l7 7-7 7"/>
                    </svg>
                </Link>
            </HeroSection>

            <div id="cours" className="w-full">
                <CoursesSection title="Liste des cours">
                    {modules.map((currentModule, index) => (
                        <div
                            key={`${currentModule.path}_${index}`}
                            className="opacity-0 animate-fade-in-up"
                            style={{animationDelay: `${index * 0.1}s`}}
                        >
                            <ModuleCard currentModule={currentModule}/>
                        </div>
                    ))}
                </CoursesSection>
            </div>

            <AboutSection/>

            <PageFooter/>
        </div>
    );
}
