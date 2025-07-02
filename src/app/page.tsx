import ModuleCard from "@/components/Cards/ModuleCard";
import modules from "../../data/modules";
import Marquee from "@/components/ui/marquee";
import Modules from "../../data/modules";

export default function Home() {

    const items = Modules.map( m => m.title);

    return (
        <div className="flex flex-col w-full items-center justify-start">

            {/* Section des cours */}
            <section className="w-full text-center flex flex-col lg:flex-row">
                <div className="flex flex-col w-full items-center justify-start h-80 bg-red-200"></div>
                <div className="flex flex-col w-full items-center justify-start h-80 bg-green-200"></div>
            </section>

            <section className="w-full text-center mb-8">
                <Marquee items={[...items,...items, ...items]} />
            </section>

            <section className="w-full text-center mb-8">
                <h1 className="text-4xl font-extrabold mb-4 text-center">
                    Liste des cours
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full mx-auto mb-20 px-4">
                    {modules.map((currentModule) => (
                        <div key={currentModule.id}>
                            <ModuleCard currentModule={currentModule}/>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

