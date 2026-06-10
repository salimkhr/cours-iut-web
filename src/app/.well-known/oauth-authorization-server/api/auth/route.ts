import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

// RFC 8414 — OAuth Authorization Server Metadata
// better-auth builds the discovery URL as:
//   /.well-known/oauth-authorization-server{basePath}
// where basePath = /api/auth. This route satisfies that expectation.
export const { GET } = toNextJsHandler(auth);
