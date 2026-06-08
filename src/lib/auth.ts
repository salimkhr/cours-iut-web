import {betterAuth} from "better-auth";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import {admin, captcha, username} from "better-auth/plugins";
import {oauthProvider} from "@better-auth/oauth-provider";
import {MongoClient} from "mongodb";
import {headers} from "next/headers";
import {Resend} from "resend";

// better-auth a besoin de l'instance Db au moment de la config (module load).
// MongoClient.db() est lazy : la connexion réseau se fait à la première op,
// donc créer le client ici ne bloque pas le démarrage et ne casse pas le build
// (NEXT_PHASE === 'phase-production-build') tant que la variable d'env est fournie.
const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const mongoClient = new MongoClient(uri);
const db = mongoClient.db("cours-iut-web");

const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "no-reply@salimkhraimeche.dev";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const auth = betterAuth({
    appName: "cours-iut-web",
    database: mongodbAdapter(db),

    user: {
        additionalFields: {
            group: {
                type: "string",
                required: false,
                input: true,
            },
        },
    },

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: !!resend,
        minPasswordLength: 7,
        maxPasswordLength: 128,
        sendResetPassword: async ({ user, url }) => {
            if (!resend) return;
            void resend.emails.send({
                from: fromEmail,
                to: user.email,
                subject: "Réinitialisation de votre mot de passe — Cours Web IUT",
                html: `
                    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
                        <h2 style="color:#C2410C">Réinitialisation du mot de passe</h2>
                        <p>Bonjour ${user.name},</p>
                        <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe sur la plateforme de cours de l'IUT.</p>
                        <a href="${url}"
                           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#C2410C;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
                            Réinitialiser mon mot de passe
                        </a>
                        <p style="color:#666;font-size:13px">Ce lien expire dans 1 heure.<br>Si vous n'avez pas demandé de réinitialisation, ignorez cet email.</p>
                    </div>
                `,
            });
        },
    },

    emailVerification: {
        sendVerificationEmail: async ({user, url}) => {
            if (!resend) return;
            await resend.emails.send({
                from: fromEmail,
                to: user.email,
                subject: "Confirmez votre adresse email — Cours Web IUT",
                html: `
                    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
                        <h2 style="color:#C2410C">Confirmez votre email</h2>
                        <p>Bonjour ${user.name},</p>
                        <p>Cliquez sur le bouton ci-dessous pour valider votre compte sur la plateforme de cours de l'IUT.</p>
                        <a href="${url}"
                           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#C2410C;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
                            Valider mon email
                        </a>
                        <p style="color:#666;font-size:13px">Ce lien expire dans 24 heures.<br>Si vous n'avez pas créé de compte, ignorez cet email.</p>
                    </div>
                `,
            });
        },
        autoSignInAfterVerification: true,
        expiresIn: 60 * 60 * 24, // 24 h
        callbackURL: "/email-verifie",
    },

    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 jours
        updateAge: 60 * 60 * 24,      // refresh quotidien
    },

    advanced: {
        // Derrière le proxy Dokploy, la vraie IP client est dans X-Forwarded-For.
        ipAddress: {
            ipAddressHeaders: [
                "cf-connecting-ip",   // Cloudflare (si activé côté Dokploy)
                "x-forwarded-for",    // standard RFC 7239
            ],
        },
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

        // OAuth 2.0 provider : expose les endpoints pour OAuth clients (e.g., Claude.ai).
        // Ajoute /.well-known/openid-configuration, /api/auth/oauth2/authorize,
        // /api/auth/oauth2/token, /api/auth/oauth2/userinfo.
        // Les clients sont enregistrés dynamiquement via /api/auth/oauth2/register
        // ou créés directement en base de données.
        oauthProvider({
            loginPage: "/login",
            consentPage: "/oauth/consent",
        }),
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
