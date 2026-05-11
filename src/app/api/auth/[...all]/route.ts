import {toNextJsHandler} from "better-auth/next-js";
import {auth} from "@/lib/auth";

export const runtime = "nodejs";

// Catch-all route : tous les endpoints better-auth (/api/auth/sign-in,
// /api/auth/sign-up, /api/auth/sign-out, /api/auth/session, etc.) passent ici.
export const {POST, GET} = toNextJsHandler(auth);
