// /app/api/modules/[path]/route.ts
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma/prisma";

export async function GET(
    req: Request,
    {params}: { params: { path: string } }
) {
    const currentModule = await prisma.module.findFirst({
        where: {path: params.path},
        include: {
            sections: {
                include: {
                    contents: true,
                },
            },
        },
    });

    if (!currentModule) {
        return NextResponse.json({error: "Module not found"}, {status: 404});
    }

    return NextResponse.json(currentModule);
}
