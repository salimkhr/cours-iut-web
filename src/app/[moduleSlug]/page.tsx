import {notFound} from 'next/navigation';
import SectionCard from "@/components/Cards/SectionCard";
import BreadcrumbGenerator from "@/components/BreadcrumbGenerator";
import modules from "@/config";
import {GlitchText} from "@/components/GlitchText";

// Interface pour les props de la page
interface ModulePageProps {
    params: Promise<{
        moduleSlug: string;
    }>;
}

// Génération statique des paramètres (optionnel mais recommandé)
export async function generateStaticParams() {
    return modules.map((module) => ({
        moduleSlug: module.path, // Assurez-vous que vos modules ont une propriété 'slug'
    }));
}

// Génération des métadonnées (optionnel)
export async function generateMetadata({params}: ModulePageProps) {
    const {moduleSlug} = await params;
    const currentModule = modules.find(m => m.path === moduleSlug);

    if (!currentModule) {
        return {
            title: 'Module non trouvé'
        };
    }

    return {
        title: currentModule.title,
    };
}

export default async function Module({params}: ModulePageProps) {

    // Récupération du paramètre de manière asynchrone
    const {moduleSlug} = await params;

    // Récupération du module basé sur le slug
    const currentModule = modules.find(m => m.path === moduleSlug);

    // Si le module n'existe pas, afficher une page 404
    if (!currentModule) {
        notFound();
    }

    return (
        <div>
            <BreadcrumbGenerator currentModule={currentModule}></BreadcrumbGenerator>

            <div className="flex flex-col w-full items-center justify-start">
                {/* Section du titre du module */}
                <section className="max-w-4xl text-center mb-8">
                    <GlitchText>
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-extrabold mt-10 lg:mb-4 text-center bg-gradient-to-r bg-clip-text">
                            {currentModule.title}
                        </h1>
                    </GlitchText>
                    {currentModule.description && (
                        <p className="text-lg text-gray-600 mb-6">
                            {currentModule.description}
                        </p>
                    )}
                </section>

                <section className="flex flex-wrap justify-center gap-10 max-w-7xl w-full mb-20 px-4">
                    {currentModule.sections.map((section) => (
                        <div className="w-full max-w-sm" key={section.id}>
                            <SectionCard currentModule={currentModule} section={section}/>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}