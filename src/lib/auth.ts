import {betterAuth} from "better-auth";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import {admin, captcha, username} from "better-auth/plugins";
import {MongoClient} from "mongodb";
import {headers} from "next/headers";

// better-auth a besoin de l'instance Db au moment de la config (module load).
// MongoClient.db() est lazy : la connexion réseau se fait à la première op,
// donc créer le client ici ne bloque pas le démarrage et ne casse pas le build
// (NEXT_PHASE === 'phase-production-build') tant que la variable d'env est fournie.
const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const mongoClient = new MongoClient(uri);
const db = mongoClient.db("cours-iut-web");

const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

export const auth = betterAuth({
    appName: "cours-iut-web",
    database: mongodbAdapter(db),

    emailAndPassword: {
        enabled: true,
        // Pas de vérification email en self-hosted éducatif : on garde simple.
        requireEmailVerification: false,
        // Règles password. À ajuster selon la politique souhaitée.
        // Pour de la complexité (majuscule + chiffre + symbole), passer
        // par `password.hash` custom ou valider côté form avant submit.
        minPasswordLength: 7,
        maxPasswordLength: 128,
    },

    session: {
        // Cookie persistant côté client. Refresh de session géré côté serveur.
        expiresIn: 60 * 60 * 24 * 7, // 7 jours
        updateAge: 60 * 60 * 24, // refresh quotidien
    },

    plugins: [
        // Plugin admin : ajoute un champ `role` sur user (default: "user"),
        // un champ `banned` et expose les endpoints de management
        // (/admin/list-users, /admin/set-role, etc.).
        admin({
            defaultRole: "user",
            adminRoles: ["admin"],
        }),

        // Plugin username : permet le sign-in via username OU email.
        // Ajoute un champ `username` sur user (unique).
        username({
            minUsernameLength: 3,
            maxUsernameLength: 32,
        }),

        // Captcha Turnstile : protège sign-in/sign-up contre les bots.
        // Le client doit envoyer le token Turnstile dans l'en-tête `x-captcha-response`.
        // Si la clé n'est pas définie (dev local sans Turnstile), on retire le plugin.
        ...(turnstileSecret
            ? [
                captcha({
                    provider: "cloudflare-turnstile",
                    secretKey: turnstileSecret,
                }),
            ]
            : []),
    ],
});

export type Session = typeof auth.$Infer.Session;

/**
 * Helper pour Server Components / Route Handlers : récupère la session
 * courante depuis les cookies de la requête.
 */
export async function getServerSession() {
    return auth.api.getSession({headers: await headers()});
}
