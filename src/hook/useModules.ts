import {Module} from "@/types/module";

export async function getModules(): Promise<Module[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/modules`)
    // if (!res.ok) throw new Error("Failed to fetch modules");
    return res.json();
}

