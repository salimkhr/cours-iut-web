import {NextRequest, NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';


export async function GET(req: NextRequest) {
    try {
        const {searchParams} = new URL(req.url);
        const pathToRevalidate = searchParams.get('path');

        if (!pathToRevalidate) {
            return NextResponse.json({error: 'Missing path parameter'}, {status: 400});
        }

        revalidatePath(pathToRevalidate);

        return NextResponse.json({revalidated: pathToRevalidate});
    } catch (err) {
        console.error('Error during revalidation:', err);
        return NextResponse.json({error: 'Failed to revalidate'}, {status: 500});
    }
}
