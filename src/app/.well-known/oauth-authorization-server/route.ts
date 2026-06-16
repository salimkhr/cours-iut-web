import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

// RFC 8414 — OAuth Authorization Server Metadata, emplacement standard.
// Les clients OAuth génériques (dont Claude.ai) suivent la RFC et requêtent
// /.well-known/oauth-authorization-server à la racine du domaine — pas
// /.well-known/oauth-authorization-server/api/auth, qui est la convention
// interne de better-auth (cf. route voisine ./api/auth/route.ts, conservée
// pour la cohérence interne de la lib). Sans cette route, un client qui suit
// la RFC ne trouve aucune découverte et retombe sur des chemins par défaut
// (ex: /authorize) qui n'existent pas ici → 404.
export const { GET } = toNextJsHandler(auth);
