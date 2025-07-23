import {cookies} from 'next/headers';
import Tokens from 'csrf';

/**
 * Class representing a set of tokens.
 * @constructor
 */
const tokens = new Tokens();

/**
 * Obtient un jeton CSRF à utiliser dans les requêtes sécurisées.
 *
 * Cette fonction retourne une réponse contenant un jeton CSRF au format JSON. Ce jeton est
 * également défini comme un cookie sécurisé dans le navigateur du client pour assurer une
 * protection contre les attaques de type Cross-Site Request Forgery (CSRF).
 *
 * @returns {Response} Un objet `Response` dont :
 *   - le corps contient un jeton CSRF au format JSON,
 *   - l’en-tête `Content-Type` est défini sur `application/json`,
 *   - un cookie HTTP-only est défini avec les attributs `Secure` et `SameSite=Lax` pour renforcer la sécurité.
 */
export async function GET() {
    const secret = tokens.secretSync();
    const token = tokens.create(secret);

    const cookieStore = await cookies();
    cookieStore.set('csrfSecret', secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });

    return new Response(JSON.stringify({csrfToken: token}), {
        headers: {'Content-Type': 'application/json'},
    });
}