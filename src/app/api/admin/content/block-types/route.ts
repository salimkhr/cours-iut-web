import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/withAdmin";
import { blockDefs } from "@/lib/blockDefs";

export const GET = withAdmin(async () => {
    const types = blockDefs.map(({ type, label, defaultProps, fields }) => ({
        type,
        label,
        defaultProps,
        fields,
    }));
    return NextResponse.json({ types });
});
