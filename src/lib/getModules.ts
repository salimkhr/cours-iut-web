import {cache} from "react";
import {connectToDB} from "@/lib/mongodb";
import Module from "@/types/Module";
import {WithId} from "mongodb";

// `cache` déduplique les appels au sein d'un même rendu RSC : le layout, la NavBar,
// le footer et la page peuvent appeler getModules() sans multiplier les requêtes DB.
const getModules = cache(async function getModules(): Promise<(Module & { _id: string })[]> {
    const db = await connectToDB();
    const modules: WithId<Module>[] = await db.collection<Module>("modules").find().toArray();

    return modules.map(mod => ({
        ...mod,
        _id: mod._id.toString(),
        updatedAt: mod.updatedAt ? new Date(mod.updatedAt as unknown as Date).toISOString() : undefined,
        sections: mod.sections?.map(({...rest}) => ({
            ...rest,
            _id: mod._id.toString(),
        })) ?? []
    }));
});

export default getModules;