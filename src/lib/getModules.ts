import {connectToDB} from "@/lib/mongodb";
import Module from "@/types/Module";
import {WithId} from "mongodb";

export default async function getModules(): Promise<(Module & { _id: string })[]> {
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
}