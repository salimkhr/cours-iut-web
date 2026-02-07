import {betterAuth} from "better-auth";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import {connectToDB} from "./mongodb";
import {admin} from "better-auth/plugins";

export const auth = betterAuth({
    database: mongodbAdapter(await connectToDB()),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 1,
    },
    plugins: [
        admin()
    ]
});
