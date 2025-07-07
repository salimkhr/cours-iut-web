import ModuleCard from "@/components/Cards/ModuleCard";
import modules from "../../data/modules";
import Image from "next/image";
import * as React from "react";

export default function Home() {
    return (
        <div className="flex flex-col w-full items-center justify-start">
            {/* Header Section - Hauteur réduite */}
            <section className="w-full flex lg:flex-row items-center justify-between p-4 lg:p-6 gap-4 lg:gap-6 min-h-[40vh] lg:min-h-[50vh]">
                {/* Left Side: Text */}
                <div className="flex flex-col items-center justify-center w-full lg:w-2/3">
                    <h1 className="text-5xl lg:text-7xl xl:text-8xl font-extrabold mb-3 lg:mb-4 text-center">
                        Développement Web
                    </h1>
                    <p className="text-lg text-gray-600 mb-3 lg:mb-4 text-center max-w-2xl">
                        Maîtriser les bases du développement web front-end et back-end pour exploiter efficacement les frameworks modernes.
                    </p>
                </div>

                {/* Right Side: Image */}
                <div className="flex items-center justify-center w-full lg:w-1/3">
                    <Image
                        src={"header.svg"}
                        alt={"Développement Web"}
                        width={600}
                        height={600}
                        className="w-full h-auto max-w-xs lg:max-w-sm"
                        style={{marginBottom: '-20px', zIndex: 100}}
                    />
                </div>
            </section>

            {/* Modules Section - Plus visible et mieux positionnée */}
            <section className="w-full px-4 lg:px-8 py-8 lg:py-12">
                <h2 className="text-4xl lg:text-6xl font-extrabold mb-4 lg:mb-8 text-center">
                    Liste des cours
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-7xl mx-auto mb-12 lg:mb-16">
                    {modules.map((currentModule) => (
                        <div key={currentModule.id}>
                            <ModuleCard currentModule={currentModule}/>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer Image */}
            <Image
                src={"footer.svg"}
                alt={""}
                width={1000}
                height={1000}
                className={"w-full h-100"}
                style={{marginBottom: '-20px', zIndex: 100}}
            />
        </div>
    );
}