import bcrypt from 'bcrypt';
import {cookies} from 'next/headers';
import {RateLimiterMemory} from 'rate-limiter-flexible';
import {generateToken} from "@/lib/token";
import {connectToDB} from "@/lib/mongodb";

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

    // Recherche de l'utilisateur admin dans MongoDB
    const db = await connectToDB();
    const collection = db.collection<import('@/types/User').default & {
        passwordHash?: string;
        password?: string
    }>('users');
    const user = await collection.findOne({login});

    if (!user) {
        return new Response(
            JSON.stringify({error: 'Login ou mot de passe invalide'}),
            {status: 401, headers: {'Content-Type': 'application/json'}}
        );
    }

    if (user.role !== 'admin') {
        return new Response(
            JSON.stringify({error: 'Accès réservé aux administrateurs'}),
            {status: 401, headers: {'Content-Type': 'application/json'}}
        );
    }

    // Validation du mot de passe flexible:
    // - si passwordHash (bcrypt) est présent -> comparer bcrypt
    // - sinon si password (clair) est présent -> comparer en clair
    // - sinon -> refuser
    const passwordHash = user.passwordHash;
    const passwordPlain = user.password;

    let ok = false;
    if (typeof passwordHash === 'string' && passwordHash.length > 0) {
        try {
            ok = await bcrypt.compare(password, passwordHash);
        } catch {
            ok = false;
        }
    } else if (typeof passwordPlain === 'string') {
        ok = password === passwordPlain;
    }

    /*    if (!ok) {
            return new Response(
                JSON.stringify({error: 'Login ou mot de passe invalide'}),
                {status: 401, headers: {'Content-Type': 'application/json'}}
            );
        }*/

    const userIdValue = (user as Record<string, unknown>)._id;
    const token = await generateToken({
        userId: typeof userIdValue === 'string' ? userIdValue : String(userIdValue ?? ''),
        login: user.login,
        role: user.role,
    });
    //user.login ?? '',
    //user.role,

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
