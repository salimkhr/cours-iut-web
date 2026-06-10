import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import { getAllBlockDefinitions } from "@/lib/blockRegistry";

export const GET = withAdmin(async () => {
    const definitions = getAllBlockDefinitions();
    const types = definitions.map(({ type, label, defaultProps, fields }) => ({
        type,
        label,
        defaultProps,
        fields,
    }));
    return NextResponse.json({ types });
});
