import {notFound} from 'next/navigation';
import Image from "next/image";
import SectionCard from "@/components/Cards/SectionCard";
import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
import {GlitchText} from "@/components/GlitchText";
import {Badge} from "@/components/ui/badge";
import Section from "@/types/Section";
import getModules from "@/lib/getModules";
import {List, ListItem} from "@/components/ui/List";
import Link from "next/link";
import Heading from "@/components/ui/Heading";


interface ModulePageProps {
    params: Promise<{
        moduleSlug: string;
    }>;
}

export async function generateMetadata({params}: ModulePageProps) {
    const {moduleSlug} = await params;
    const modules = await getModules();
    const currentModule = modules.find(m => m.path === moduleSlug);

    if (!currentModule) {
        return {
            title: 'Module non trouvé'
        };
    }

    return {
        title: currentModule.title,
        description: currentModule.description,
    };
}

export default async function Module({params}: ModulePageProps) {
    const {moduleSlug} = await params;
    const modules = await getModules();
    const currentModule = modules.find(m => m.path === moduleSlug);

    if (!currentModule) {
        notFound();
    }

    // Calcul des statistiques du module
    const totalSections = currentModule.sections.length;
    const totalAvailableSections = currentModule.sections.filter((section: Section) => section.isAvailable).length;
    const progress = totalSections > 0 ? Math.round((totalAvailableSections / totalSections) * 100) : 0;
    const hasAvailableContent = totalAvailableSections > 0;

    const allTags = [...new Set(currentModule.sections.flatMap((section: Section) => section.tags || []))];

    const coefficients = currentModule.coefficients?.filter(c => c.value > 0);

    return (
        <div className="flex flex-col w-full items-center justify-start min-h-screen">
            <BreadcrumbGenerator currentModule={currentModule}/>

            <section
                className="w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between p-4 lg:px-6 gap-4 lg:gap-6 lg:min-h-[45vh]">
                <div className="flex flex-col items-center w-full lg:w-2/3 opacity-0 animate-fade-in">
                    <GlitchText>
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-extrabold mt-10 lg:mb-4 text-center bg-gradient-to-r bg-clip-text">
                            {currentModule.title}
                        </h1>
                    </GlitchText>

                    {currentModule.description && (
                        <p className="text-base sm:text-lg text-gray-600 text-center max-w-2xl leading-relaxed mb-6">
                            {currentModule.description}
                        </p>
                    )}
                    <div className="flex flex-row items-top justify-center w-full opacity-0 animate-fade-in">
                        <div
                            className="flex flex-col items-center justify-center w-full lg:w-1/2 opacity-0 animate-fade-in">
                            <div>
                                <Heading level={4} className="mb-2">Équipe pédagogique</Heading>
                                <div>
                                    <span><Link
                                        className={`text-${currentModule.path} border-b-1 border-${currentModule.path}`}
                                        href={`mailto:${currentModule.manager?.email}`}>M.{currentModule.manager?.firstName} {currentModule.manager?.lastName}</Link>,&nbsp;
                                    </span>
                                    {currentModule.instructors?.map((instructor) => (
                                        <span key={instructor.email}>
                                            <Link
                                                className={`text-${currentModule.path} border-b-1 border-${currentModule.path}`}
                                                href={`mailto:${instructor.email}`}>
                                                M.{instructor.firstName} {instructor.lastName}
                                            </Link>
                                        </span>
                                    ))}
                                </div>

                                <Heading level={4} className="mt-6">SAÉ associée</Heading>
                                <List>
                                    {currentModule.associatedSae?.map((sae) => (
                                        <ListItem key={sae}>
                                            {sae}
                                        </ListItem>
                                    ))}
                                    {currentModule.associatedSae.length === 0 && (
                                        <span>Aucune SAÉ pour ce module</span>)}
                                </List>
                            </div>
                        </div>

                        <div>
                            <Heading level={4} className="mb-2">Coefficients des compétences</Heading>
                            <List>
                                {coefficients?.map(coefficient => (
                                    <ListItem
                                        key={`value_${coefficient.competenceName}`}>{coefficient.competenceName}&nbsp;:&nbsp;{coefficient.value}</ListItem>
                                ))}
                            </List>
                        </div>
                    </div>

                    {allTags.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-8 opacity-0 animate-fade-in-up"
                             style={{animationDelay: '0.3s'}}>
                            {allTags.slice(0, 8).map((tag) => (
                                <Badge key={tag}
                                       className={`border-2 border-${currentModule.title} bg-white text-${currentModule.title} font-mono text-xs hover:bg-${currentModule.title} hover:text-white transition-colors`}>
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>


                <div
                    className="hidden lg:flex items-center justify-center w-full lg:w-1/3 opacity-0 animate-fade-in-right">
                    <Image
                        src={`/header_${currentModule.path}.svg`}
                        alt={currentModule.title}
                        width={1200}
                        height={1200}
                        className="w-full h-auto max-w-xs lg:max-w-sm hover:scale-105 transition-transform duration-300"
                        priority
                    />
                </div>
            </section>


            <section className="w-full px-4 lg:px-8">
                <h2 className="text-4xl lg:text-6xl font-extrabold mb-4 lg:mb-8 text-center opacity-0 animate-fade-in-up">
                    Programme du cours
                </h2>

                <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-7xl mx-auto mb-12 lg:mb-16">
                    {currentModule.sections.map((section, index) => (
                        <div
                            key={section.path}
                            className="opacity-0 animate-fade-in-up"
                            style={{animationDelay: `${index * 0.1}s`}}
                        >
                            <SectionCard currentModule={currentModule} section={section}/>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer avec progression */}
            <section className="w-full px-4 lg:px-8 mb-8">
                <div className="max-w-4xl mx-auto text-center opacity-0 animate-fade-in">
                    <div
                        className={`bg-gradient-to-r rounded-xl p-6 border-2`}
                    >
                        <h4 className="text-xl font-bold mb-2">Prêt à commencer ?</h4>

                        {hasAvailableContent ? (
                            <>
                                <p className="text-gray-600 mb-4">
                                    Parcourez les {totalAvailableSections} sur {totalSections} cours de ce module à
                                    votre
                                    rythme
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`bg-${currentModule.path} h-2 rounded-full transition-all duration-300`}
                                        style={{width: `${progress}%`}}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Progression : {progress}% complété
                                </p>
                            </>
                        ) : (
                            <p className="text-gray-600">
                                Aucun cours n’est encore disponible pour ce module.
                            </p>
                        )}
                    </div>
                </div>
            </section>


            <div className="opacity-0 animate-fade-in">
                <Image
                    src={`/footer_${currentModule.path}.svg`}
                    alt=""
                    width={1000}
                    height={1000}
                    className="hidden md:flex h-100"
                    style={{paddingBottom: '40px', zIndex: 100}}
                />
            </div>
        </div>
    );
}