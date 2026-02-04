import ModuleCard from "@/components/Cards/ModuleCard";
import Link from "next/link";
import getModules from "@/lib/getModules";
import HeroSection from "@/components/page/HeroSection";
import CoursesSection from "@/components/page/CoursesSection";
import PageFooter from "@/components/page/PageFooter";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Développement Web | Apprenez le front-end et le back-end",
    description: "Maîtrisez les bases du développement web front-end et back-end avec nos cours interactifs et complets.",
    openGraph: {
        title: "Développement Web | Apprenez le front-end et le back-end",
        description: "Maîtrisez les bases du développement web front-end et back-end avec nos cours interactifs et complets.",
        url: "https://salimkhraimeche.dev", // Remplace par l'URL de ton site
        siteName: "Salim Khraimeche",
        images: [
            {
                url: "https://salimkhraimeche.dev/images/header.png",
                width: 1200,
                height: 630,
                alt: "Développement Web",
            },
        ],
        locale: "fr_FR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Développement Web | Apprenez le front-end et le back-end",
        description: "Maîtrisez les bases du développement web front-end et back-end avec nos cours interactifs et complets.",
        images: ["https://salimkhraimeche.dev/images/header.png"],
    },
};

export default async function Home() {
    const modules = await getModules();

    return (
        <div className="flex flex-col w-full items-center justify-start min-h-screen mb-10 lg:mb-0">
            <HeroSection
                title="Développement Web"
                description="Maîtriser les bases du développement web front-end et back-end pour exploiter efficacement les frameworks modernes."
                imagePath="images/header/header.svg"
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

            <PageFooter/>
        </div>
    );
}