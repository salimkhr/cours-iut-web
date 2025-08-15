interface ProgressSectionProps {
    currentModule: any;
    totalSections: number;
    totalAvailableSections: number;
    progress: number;
    hasAvailableContent: boolean;
}

export default function ProgressSection({
                                            currentModule,
                                            totalSections,
                                            totalAvailableSections,
                                            progress,
                                            hasAvailableContent
                                        }: ProgressSectionProps) {
    return (
        <section className="w-full px-4 lg:px-8 mb-8">
            <div className="max-w-4xl mx-auto text-center opacity-0 animate-fade-in">
                <div className="bg-gradient-to-r rounded-xl p-6 border-2 mb-20 lg:mb-5 shadow-lg">
                    <h4 className="text-xl font-bold mb-2">
                        Prêt à commencer ?
                    </h4>

                    {hasAvailableContent ? (
                        <>
                            <p className="text-gray-600 mb-4">
                                Parcourez les {totalAvailableSections} sur {totalSections} cours
                                de ce module à votre rythme
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
                            Aucun cours n'est encore disponible pour ce module.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}