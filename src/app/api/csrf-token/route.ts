import {randomBytes} from 'crypto';

export async function GET() {
    const csrfToken = randomBytes(32).toString('hex');

    return new Response(JSON.stringify({csrfToken}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `csrfToken=${csrfToken}; Path=/; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'};`,
        },
    });
}