// script/purgeCourseContent.mjs
// Purge ponctuelle des contenus de test (ancien format colSpan/items).
// Usage : bun --env-file=.env.local script/purgeCourseContent.mjs
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("MONGODB_URI manquant (lancer avec --env-file=.env.local)");
    process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db("cours-iut-web");

const res = await db.collection("course_content").deleteMany({});
console.log(`course_content : ${res.deletedCount} documents supprimés`);

// Repointer les sections vers les fichiers .tsx
const mod = await db.collection("modules").updateMany(
    { "sections.contents.source": "db" },
    {
        $set: { "sections.$[].contents.$[c].source": "file" },
        $unset: { "sections.$[].contents.$[c].contentId": "" },
    },
    { arrayFilters: [{ "c.source": "db" }] }
);
console.log(`modules : ${mod.modifiedCount} documents repointés vers source=file`);

await client.close();
