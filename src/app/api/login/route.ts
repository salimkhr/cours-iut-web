import {cookies} from 'next/headers';
import Tokens from 'csrf';
import bcrypt from 'bcrypt';

const tokens = new Tokens();

const ADMIN_LOGIN = process.env.ADMIN_LOGIN;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const secret = cookieStore.get('csrfSecret')?.value;
    const token = req.headers.get('csrf-token');

    if (!secret || !token || !tokens.verify(secret, token)) {
        return new Response(JSON.stringify({error: 'Invalid CSRF token'}), {
            status: 403,
            headers: {'Content-Type': 'application/json'},
        });
    }

    const {login, password} = await req.json();

    if (login !== ADMIN_LOGIN) {
        return new Response(JSON.stringify({error: 'Login ou mot de passe invalide'}), {
            status: 401,
            headers: {'Content-Type': 'application/json'},
        });
    }
     
    const hash = Buffer.from(process.env.ADMIN_PASSWORD_HASH ?? '', 'base64').toString();
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

    response.headers.append(
        'Set-Cookie',
        `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`
    );

    return response;
}
