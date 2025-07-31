import {Section} from "@/types/Section";

export async function getSections(): Promise<Section[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sections`)
    // if (!res.ok) throw new Error("Failed to fetch modules");
    return res.json();
}

