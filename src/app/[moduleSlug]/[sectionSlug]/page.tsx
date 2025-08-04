import {notFound} from 'next/navigation';
import Image from "next/image";
import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
import {GlitchText} from "@/components/GlitchText";
import {Badge} from "@/components/ui/badge";
import ContentCard from "@/components/Cards/ContentCard";
import getMergedModules from "@/lib/getMergedModules";
import {getSectionParams} from "../../../../config/ routes";


interface ModulePageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
    }>;
}

export async function generateStaticParams() {
    return getSectionParams();
}

export async function generateMetadata({params}: ModulePageProps) {
    const {moduleSlug, sectionSlug} = await params;

    const modules = getMergedModules();
    const currentModule = modules.find(m => m.path === moduleSlug);
    const currentSection = currentModule?.sections.find(s => s.path === sectionSlug);

    if (!currentModule) {
        return {
            title: 'Module non trouvé'
        };
    }

    if (!currentSection) {
        return {
            title: 'Section non trouvé'
        };
    }

    return {
        title: `${currentModule.title} | ${currentSection.title}`,
        description: currentModule.description
    };
}

export default async function Module({params}: ModulePageProps) {
    const {moduleSlug, sectionSlug} = await params;
    const modules = getMergedModules();
    const currentModule = modules.find(m => m.path === moduleSlug);
    if (!currentModule) notFound();

    const currentSection = currentModule.sections.find(s => s.path === sectionSlug);
    if (!currentSection) notFound();

    return (
        <div className="flex flex-col w-full items-center justify-start min-h-screen">
            <BreadcrumbGenerator currentModule={currentModule}/>

            <section
                className="w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between p-4 lg:px-6 gap-4 lg:gap-6 lg:min-h-[45vh]">
                <div className="flex flex-col items-center justify-center w-full lg:w-2/3 opacity-0 animate-fade-in">
                    <GlitchText>
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-extrabold mt-10 lg:mb-4 text-center bg-gradient-to-r bg-clip-text">
                            {currentSection.order}. {currentSection.title}
                        </h1>
                    </GlitchText>

                    {currentModule.description && (
                        <p className="text-base sm:text-lg text-gray-600 text-center max-w-2xl leading-relaxed mb-6">
                            {currentSection.description}
                        </p>
                    )}

                    {/* Tags du module */}
                    {currentSection.tags.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-8 opacity-0 animate-fade-in-up"
                             style={{animationDelay: '0.3s'}}>
                            {currentSection.tags.slice(0, 8).map((tag) => (
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
                    {currentSection.contents.map((content, index) => (
                        <div
                            key={content.type}
                            className="opacity-0 animate-fade-in-up"
                            style={{animationDelay: `${index * 0.1}s`}}
                        >
                            <ContentCard section={currentSection} currentModule={currentModule} content={content}/>
                        </div>
                    ))}
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