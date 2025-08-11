import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import Tokens from 'csrf';

const tokens = new Tokens();

export async function middleware(req: NextRequest) {
    console.log('Middleware called');
    if (req.method !== 'GET') {
        const cookieStore = req.cookies;
        const secret = cookieStore.get('csrfSecret')?.value;
        const token = req.headers.get('csrf-token');

        if (!secret || !token || !tokens.verify(secret, token)) {
            return NextResponse.json(
                {error: 'Invalid CSRF token'},
                {status: 403}
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*'],
};