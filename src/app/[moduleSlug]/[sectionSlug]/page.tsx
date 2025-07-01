import { notFound } from 'next/navigation';
import modules from "../../../../data/modules";
import SectionCard from "@/components/Cards/SectionCard";

// Interface pour les props de la page
interface ModulePageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
    }>;
}

export async function generateStaticParams() {
    const params: { moduleSlug: string; sectionSlug: string }[] = [];

    modules.forEach((module) => {
        module.sections.forEach((section) => {
            params.push({
                moduleSlug: module.path,
                sectionSlug: section.path // Fallback pour les sections root
            });
        });
    });

    return params;
}


// Génération des métadonnées (optionnel)
export async function generateMetadata({ params }: ModulePageProps) {
    const { moduleSlug } = await params;
    const currentModule = modules.find(m => m.path === moduleSlug);

    if (!currentModule) {
        return {
            title: 'Module non trouvé'
        };
    }

    return {
        title: currentModule.title,
        description: currentModule.description || `Apprenez ${currentModule.title}`,
    };
}

export default async function Module({ params }: ModulePageProps) {

    // Récupération du paramètre de manière asynchrone
    const { moduleSlug } = await params;

    // Récupération du module basé sur le slug
    const currentModule = modules.find(m => m.path === moduleSlug);

    // Si le module n'existe pas, afficher une page 404
    if (!currentModule) {
        notFound();
    }

    return (
        <div className="flex flex-col w-full items-center justify-start">
            {/* Section du titre du module */}
            <section className="max-w-4xl text-center mb-8">
                <h1 className="text-4xl font-extrabold mb-4">
                    {currentModule.title}
                </h1>
                {currentModule.description && (
                    <p className="text-lg text-gray-600 mb-6">
                        {currentModule.description}
                    </p>
                )}
            </section>

            <section className="flex flex-wrap justify-center gap-10 max-w-7xl w-full mb-20 px-4">
                {currentModule.sections.map((section) => (
                    <div className="w-full max-w-sm" key={section.id}>
                        <SectionCard currentModule={currentModule} section={section} />
                    </div>
                ))}
            </section>
        </div>
    );
}