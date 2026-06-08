/**
 * seed-oauth-client.ts
 *
 * Registers the Claude.ai OAuth client in MongoDB for the oauthProvider plugin.
 *
 * Usage:
 *   bun run scripts/seed-oauth-client.ts
 *
 * Required env vars (in .env.local):
 *   MONGODB_URI       — MongoDB connection string
 *   MCP_CLIENT_ID     — OAuth client ID for Claude.ai
 *   MCP_CLIENT_SECRET — OAuth client secret (will be SHA-256 hashed before storage,
 *                       matching the oauthProvider default storeClientSecret strategy)
 */

import "../src/scripts/load-env";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_ID = process.env.MCP_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.MCP_CLIENT_SECRET ?? "";

if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI environment variable is required.");
    process.exit(1);
}

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("Error: MCP_CLIENT_ID and MCP_CLIENT_SECRET environment variables are required.");
    process.exit(1);
}

/**
 * Hashes the client secret using the same algorithm as oauthProvider's defaultHasher:
 * SHA-256, base64url-encoded without padding.
 *
 * Source: @better-auth/oauth-provider/dist/utils-DoYEeMrg.mjs — defaultHasher
 */
async function hashClientSecret(secret: string): Promise<string> {
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
    // base64url encode without padding
    return Buffer.from(hash)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

const client = new MongoClient(MONGODB_URI!);

try {
    await client.connect();
    const db = client.db("cours-iut-web");

    // The oauthProvider plugin uses modelName "oauthClient" for the MongoDB collection.
    const collection = db.collection("oauthClient");

    const existing = await collection.findOne({ clientId: CLIENT_ID });
    if (existing) {
        console.log(`Claude.ai OAuth client "${CLIENT_ID}" is already registered. Nothing to do.`);
        process.exit(0);
    }

    const hashedSecret = await hashClientSecret(CLIENT_SECRET);

    await collection.insertOne({
        clientId: CLIENT_ID,
        clientSecret: hashedSecret,
        name: "Claude.ai",
        // redirectUris is string[] in the schema
        redirectUris: ["https://claude.ai/oauth/callback"],
        // Skip the consent page for Claude.ai (trusted first-party MCP client)
        skipConsent: true,
        disabled: false,
        type: "web",
        // Grant types required for the OAuth 2.0 authorization code flow with PKCE
        grantTypes: ["authorization_code", "refresh_token"],
        responseTypes: ["code"],
        tokenEndpointAuthMethod: "client_secret_basic",
        requirePKCE: true,
        scopes: ["openid", "profile", "email", "offline_access"],
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    console.log(`Claude.ai OAuth client "${CLIENT_ID}" registered successfully.`);
} finally {
    await client.close();
}
