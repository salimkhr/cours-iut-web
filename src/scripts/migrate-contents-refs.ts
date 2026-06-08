import "./load-env";
import { connectToDB } from "@/lib/mongodb";
import { ContentRef } from "@/types/CourseContent";

async function migrateContentsRefs() {
    const db = await connectToDB();
    const modules = await db.collection("modules").find().toArray();

    let updated = 0;

    for (const mod of modules) {
        const sections = (mod.sections ?? []).map((section: Record<string, unknown>) => ({
            ...section,
            contents: ((section.contents ?? []) as (string | ContentRef)[]).map((c): ContentRef =>
                typeof c === "string" ? { type: c, source: "file" } : c
            ),
        }));

        await db.collection("modules").updateOne(
            { _id: mod._id },
            { $set: { sections } }
        );
        updated++;
    }

    console.log(`Migration terminée — ${updated} modules mis à jour.`);
    process.exit(0);
}

migrateContentsRefs().catch((err) => {
    console.error("Erreur de migration :", err);
    process.exit(1);
});
