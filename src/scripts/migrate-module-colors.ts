import { connectToDB } from "@/lib/mongodb";

/** Couleurs historiques de globals.css → seed en base (aucun changement visuel). */
const COLORS: Record<string, { colorLight: string; colorDark: string }> = {
    "html-css":   { colorLight: "#C13B1A", colorDark: "#FF8568" },
    "php":        { colorLight: "#3B3F7A", colorDark: "#9198E5" },
    "javascript": { colorLight: "#7A6200", colorDark: "#FFD93D" },
    "brainfuck":  { colorLight: "#6B21A8", colorDark: "#C07AF8" },
};

async function main() {
    const db = await connectToDB();
    for (const [path, colors] of Object.entries(COLORS)) {
        const res = await db.collection("modules").updateOne(
            { path },
            { $set: colors },
        );
        console.log(`${path}: matched=${res.matchedCount} modified=${res.modifiedCount}`);
    }
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
