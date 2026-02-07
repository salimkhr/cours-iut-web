import {betterAuth} from "better-auth";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import {connectToDB} from "./mongodb";
import {admin, captcha} from "better-auth/plugins";
import {role} from "better-auth/plugins/access";

export const auth = betterAuth({
    database: mongodbAdapter(await connectToDB()),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 1,
    },
    plugins: [
        admin({
            roles: {
                user: role({
                    user: ["set-role"]
                }),
                admin: role({
                    user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password", "get", "update"],
                    session: ["list", "revoke", "delete"]
                })
            }
        }),
        captcha({
            provider: "cloudflare-turnstile",
            secretKey: process.env.TURNSTILE_SECRET_KEY ?? '',
        }),
    ]
});
