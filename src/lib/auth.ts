import {betterAuth} from "better-auth";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import {connectToDB} from "./mongodb";
import {admin, captcha} from "better-auth/plugins";

export const auth = betterAuth({
    database: mongodbAdapter(await connectToDB()),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 1,
    },
    plugins: [
        admin(),
        captcha({
            provider: "cloudflare-turnstile",
            secretKey: process.env.TURNSTILE_SECRET_KEY ?? '',
        }),
    ]
});
