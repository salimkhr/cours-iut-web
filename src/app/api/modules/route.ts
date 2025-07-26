import {NextResponse} from 'next/server';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const modules = await prisma.module.findMany({
            include: {
                sections: {
                    include: {
                        contents: true,
                    },
                },
            },
        });
        return NextResponse.json(modules);
    } catch (error) {
        console.error('GET /api/modules error:', error);
        return NextResponse.json({error: 'Failed to fetch modules'}, {status: 500});
    }
}

/*export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Exemple basique, adapte selon ton interface Module
        const newModule = await prisma.module.create({
            data: {
                title: data.title,
                path: data.path,
                iconName: data.iconName,
                description: data.description || null,
                color: data.color,
                sections: {
                    create: data.sections || [], // sections avec relation
                },
            },
            include: {sections: true},
        });

        return NextResponse.json(newModule, {status: 201});
    } catch (error) {
        console.error('POST /api/modules error:', error);
        return NextResponse.json({error: 'Failed to create module'}, {status: 500});
    }
}*/
