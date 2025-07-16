import ModuleCard from "@/components/Cards/ModuleCard";
import Image from "next/image";
import modules from "@/config";

export default function Home() {
    return (
        <div className="flex flex-col w-full items-center justify-start min-h-screen">
            {/* Hero Section */}
            <section
                className="w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between p-4 lg:px-6 gap-4 lg:gap-6 lg:min-h-[45vh]">
                <div className="flex flex-col items-center justify-center w-full lg:w-2/3 opacity-0 animate-fade-in">
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-extrabold mt-10 lg:mb-4 text-center bg-gradient-to-r bg-clip-text">
                        Développement Web
                    </h1>

                    <p className="text-base sm:text-lg text-gray-600 text-center max-w-2xl leading-relaxed">
                        Maîtriser les bases du développement web front-end et back-end pour exploiter efficacement les
                        frameworks modernes.
                    </p>
                </div>

                <div
                    className="hidden lg:flex items-center justify-center w-full lg:w-1/3 opacity-0 animate-fade-in-right">
                    <Image
                        src="/header.svg"
                        alt="Développement Web"
                        width={600}
                        height={600}
                        className="w-full h-auto max-w-xs lg:max-w-sm hover:scale-105 transition-transform duration-300"
                        style={{marginBottom: '-20px', zIndex: 100}}
                        priority
                    />
                </div>
            </section>
            
            <section className="w-full px-4 lg:px-8">
                <h2 className="text-4xl lg:text-6xl font-extrabold mb-4 lg:mb-8 text-center opacity-0 animate-fade-in-up">
                    Liste des cours
                </h2>

                <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-7xl mx-auto mb-12 lg:mb-16">
                    {modules.map((currentModule, index) => (
                        <div
                            key={currentModule.id}
                            className="opacity-0 animate-fade-in-up"
                            style={{animationDelay: `${index * 0.1}s`}}
                        >
                            <ModuleCard currentModule={currentModule}/>
                        </div>
                    ))}
                </div>
            </section>

            <div className="opacity-0 animate-fade-in">
                <Image
                    src="/footer.svg"
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