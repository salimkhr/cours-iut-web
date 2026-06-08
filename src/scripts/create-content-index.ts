import "./load-env";
import { connectToDB } from "@/lib/mongodb";

async function createIndex() {
    const db = await connectToDB();
    await db.collection("course_content").createIndex(
        { moduleSlug: 1, sectionSlug: 1, contentType: 1 },
        { unique: true, name: "unique_content_ref" }
    );
    console.log("Index course_content créé.");
    process.exit(0);
}

createIndex().catch((err) => {
    console.error("Erreur :", err);
    process.exit(1);
});
