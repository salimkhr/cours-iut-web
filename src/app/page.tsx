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

const SHOW_HOME_ABOUT_SECTION = false;

export default async function Home() {
    const session = await getServerSession();
    const isAuthed = !!session;

    const allModules = await getModules();
    const isAdmin = session?.user.role === 'admin';
    const programModules = isAuthed ? allModules.filter(m => !m.isExtra && (isAdmin || m.isVisible !== false)) : [];
    const extraModules   = isAuthed ? allModules.filter(m => m.isExtra  && (isAdmin || m.isVisible !== false)) : [];

    return (
        <main className="flex flex-col w-full items-center justify-start min-h-screen bg-background">
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
                        className="group h-auto rounded-lg border-2 border-brand-accent-dark bg-transparent text-brand-dark dark:text-brand-light hover:bg-brand-accent-dark hover:text-bridge-50 dark:hover:text-brand-dark hover:border-brand-accent-dark px-6 py-3 text-sm font-semibold tracking-wide shadow-none transition-all duration-300"
                    >
                        <Link href="#cours">
                            Voir les cours
                            <ArrowRight
                                className="size-4 text-brand-accent-dark group-hover:text-bridge-50 dark:group-hover:text-brand-dark transition-all duration-300 group-hover:translate-x-1"/>
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
                    {programModules.map((currentModule, index) => {
                        const hidden = isAdmin && currentModule.isVisible === false;
                        return (
                            <div
                                key={`${currentModule.path}_${index}`}
                                className="relative opacity-0 animate-fade-in-up w-full"
                                style={{animationDelay: `${index * 0.1}s`}}
                            >
                                {hidden && (
                                    <span className="absolute top-2 right-2 z-10 rounded-md bg-brand-primary/90 px-2 py-0.5 text-[10px] font-bold text-bridge-50 shadow-[0_8px_18px_-12px_rgba(147,97,58,0.65)] pointer-events-none">
                                        Masqué
                                    </span>
                                )}
                                <ModuleCard currentModule={currentModule} isAuthed={isAuthed} isAdmin={isAdmin}/>
                            </div>
                        );
                    })}
                </CoursesSection>
            </div>

            {isAuthed && extraModules.length > 0 && (
                <ExtraModulesSection modules={extraModules} isAdmin={isAdmin} />
            )}

            {!isAuthed && (
                <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 -mt-8 lg:-mt-12 mb-16 lg:mb-24 flex flex-col items-center gap-5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark/60 dark:text-bridge-200/60">
                        <Lock className="size-3"/>
                        Accessible après connexion
                    </span>
                    <AuthCTAPair className="justify-center"/>
                </section>
            )}

            {session?.user.role === 'admin' && <AdminHomeFab />}

            {SHOW_HOME_ABOUT_SECTION && (
                <AboutSection modules={allModules} isAuthed={isAuthed} />
            )}

            <PageFooter/>
        </main>
    );
}
