import bcrypt from 'bcrypt';
import {cookies} from "next/headers";

const ADMIN_LOGIN = process.env.ADMIN_LOGIN;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export async function POST(req: Request) {
    const {login, password} = await req.json();

    if (login !== ADMIN_LOGIN) {
        return new Response(JSON.stringify({error: 'Login ou mot de passe invalide'}), {
            status: 401,
            headers: {'Content-Type': 'application/json'},
        });
    }

    const hash = Buffer.from(ADMIN_PASSWORD_HASH ?? '', 'base64').toString();
    const isValidPassword = await bcrypt.compare(password, hash || '');

    if (!isValidPassword) {
        return new Response(JSON.stringify({error: 'Login ou mot de passe invalide'}), {
            status: 401,
            headers: {'Content-Type': 'application/json'},
        });
    }

    const sessionToken = `${login}-${Date.now()}`;

    const response = new Response(JSON.stringify({success: true}), {
        status: 200,
        headers: {'Content-Type': 'application/json'},
    });

    const cookieStore = await cookies();

    cookieStore.set('session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600
    });

    return response;
}
