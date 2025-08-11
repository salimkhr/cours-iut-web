import {cookies} from 'next/headers';
import Tokens from 'csrf';

const tokens = new Tokens();

export async function GET() {
    const secret = tokens.secretSync();
    const token = tokens.create(secret);

    const cookieStore = await cookies();
    cookieStore.set('csrfSecret', secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });

    return new Response(JSON.stringify({csrfToken: token}), {
        headers: {'Content-Type': 'application/json'},
    });
}
