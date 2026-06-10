import ModuleCard from "@/components/Cards/ModuleCard";
import Link from "next/link";
import {ArrowRight, Lock} from "lucide-react";
import {getServerSession} from "@/lib/auth";
import getModules from "@/lib/getModules";
import HeroSection from "@/components/page/HeroSection";
import CoursesSection from "@/components/page/CoursesSection";
import AboutSection from "@/components/page/AboutSection";
import AuthCTAPair from "@/components/page/AuthCTAPair";
import PageFooter from "@/components/page/PageFooter";
import ExtraModulesSection from "@/components/page/ExtraModulesSection";
import {Button} from "@/components/ui/button";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {Metadata} from "next";
import AdminHomeFab from "@/components/admin/AdminHomeFab";

export const metadata: Metadata = generatePageMetadata({
    defaultTitle: "Développement Web | Salim Khraimeche",
    noIndex: false,
});

export default async function Home() {
    const session = await getServerSession();
    const isAuthed = !!session;

    const allModules = await getModules();
    const programModules = isAuthed ? allModules.filter(m => !m.isExtra) : [];
    const extraModules   = isAuthed ? allModules.filter(m => m.isExtra)  : [];

    return (
        <main className="flex flex-col w-full items-center justify-start min-h-screen bg-brand-light dark:bg-brand-dark">
            <HeroSection
                title="Développement Web"
                description={
                    isAuthed
                        ? "Maîtriser les bases du développement web front-end et back-end pour exploiter efficacement les frameworks modernes."
                        : "Plateforme dédiée aux étudiants de l'IUT. Cours, TP, slides et examens en HTML/CSS, JavaScript, PHP et plus."
                }
                imagePath="/images/header/pont.png"
                imageAlt="Pont en bois clair traversé par la lumière"
            >
                {isAuthed ? (
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="group h-auto rounded-lg border-2 border-brand-accent-dark bg-transparent text-brand-dark dark:text-brand-light hover:bg-brand-accent-dark hover:text-white hover:border-brand-accent-dark px-6 py-3 text-sm font-semibold tracking-wide shadow-none transition-all duration-300"
                    >
                        <Link href="#cours">
                            Voir les cours
                            <ArrowRight
                                className="size-4 text-brand-accent-dark group-hover:text-white transition-all duration-300 group-hover:translate-x-1"/>
                        </Link>
                    </Button>
                ) : (
                    <AuthCTAPair/>
                )}
            </HeroSection>

            <div id="cours" className="w-full mt-8">
                <CoursesSection
                    title="Liste des cours"
                    containerClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full"
                >
                    {programModules.map((currentModule, index) => (
                        <div
                            key={`${currentModule.path}_${index}`}
                            className="opacity-0 animate-fade-in-up w-full"
                            style={{animationDelay: `${index * 0.1}s`}}
                        >
                            <ModuleCard currentModule={currentModule} isAuthed={isAuthed}/>
                        </div>
                    ))}
                </CoursesSection>
            </div>

            {isAuthed && extraModules.length > 0 && (
                <ExtraModulesSection modules={extraModules} />
            )}

            {!isAuthed && (
                <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 -mt-8 lg:-mt-12 mb-16 lg:mb-24 flex flex-col items-center gap-5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark/60 dark:text-bridge-200/60">
                        <Lock className="w-3 h-3"/>
                        Accessible après connexion
                    </span>
                    <AuthCTAPair className="justify-center"/>
                </section>
            )}

            {session?.user.role === 'admin' && <AdminHomeFab />}

            <AboutSection modules={allModules} isAuthed={isAuthed} />

            <PageFooter/>
        </main>
    );
}
