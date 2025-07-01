import ModuleCard from "@/components/Cards/ModuleCard";
import modules from "../../data/modules";

export default function Home() {
    return (
        <div className="flex flex-col w-full items-center justify-start">
            
            {/* Section des cours */}
            <section className="max-w-4xl text-center mb-8">
                <h1 className="text-4xl font-extrabold mb-4">
                    Liste des cours
                </h1>
            </section>

            <section className="flex flex-wrap justify-center gap-10 max-w-7xl w-full mb-20 px-4">
                {modules.map((currentModule) => (
                    <div className="w-full max-w-sm" key={currentModule.id}>
                        <ModuleCard currentModule={currentModule} />
                    </div>
                ))}
            </section>
        </div>
    );
}

