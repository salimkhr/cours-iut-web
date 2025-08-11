import bcrypt from 'bcrypt';
import {cookies} from 'next/headers';
import {RateLimiterMemory} from 'rate-limiter-flexible';
import {generateToken} from "@/lib/token";

const ADMIN_LOGIN = process.env.ADMIN_LOGIN;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

const isDev = process.env.NODE_ENV === 'development';

// Rate limiter par IP : max 5 tentatives / 5 min
const rateLimiter = new RateLimiterMemory({
    points: isDev ? 100 : 5,
    duration: 300,
});

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('remote_addr') || 'unknown';

    try {
        await rateLimiter.consume(ip);
    } catch {
        return new Response(
            JSON.stringify({error: 'Trop de tentatives, réessayez plus tard'}),
            {status: 429, headers: {'Content-Type': 'application/json'}}
        );
    }

    const {login, password} = await req.json();

    // Validation simple
    if (typeof login !== 'string' || typeof password !== 'string' || !login || !password) {
        return new Response(
            JSON.stringify({error: 'Login et mot de passe requis'}),
            {status: 400, headers: {'Content-Type': 'application/json'}}
        );
    }

    if (login !== ADMIN_LOGIN) {
        return new Response(
            JSON.stringify({error: 'Login ou mot de passe invalide'}),
            {status: 401, headers: {'Content-Type': 'application/json'}}
        );
    }

    const hash = Buffer.from(ADMIN_PASSWORD_HASH ?? '', 'base64').toString();
    const isValidPassword = await bcrypt.compare(password, hash || '');

    if (!isValidPassword) {
        return new Response(
            JSON.stringify({error: 'Login ou mot de passe invalide'}),
            {status: 401, headers: {'Content-Type': 'application/json'}}
        );
    }

    const token = await generateToken({login});

    // Met le token dans un cookie HttpOnly sécurisé
    const response = new Response(
        JSON.stringify({success: true}),
        {
            status: 200,
            headers: {'Content-Type': 'application/json'},
        }
    );

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600, // 1h
        path: '/',
    });

    return response;
}
