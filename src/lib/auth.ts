import {betterAuth} from "better-auth";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import {connectToDB} from "./mongodb";
import {admin} from "better-auth/plugins";

export const auth = betterAuth({
    database: mongodbAdapter(await connectToDB()),
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 1,
    },
    plugins: [
        admin({
            allowUserToSetRole: true
        })
    ]
});
