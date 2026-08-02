import { connectToDB } from "@/lib/mongodb";
import { ensureIndexes } from "@/lib/db/indexes";

async function main() {
    const db = await connectToDB();
    const created = await ensureIndexes(db);
    console.log(`Index en place : ${created.join(", ")}`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Erreur :", err);
    process.exit(1);
});
