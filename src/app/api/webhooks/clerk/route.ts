import {headers} from "next/headers";
import {Webhook} from "svix";
import type {WebhookEvent} from "@clerk/nextjs/server";
import {
    createOrUpdateUser,
    deleteUser,
    ensureUserIndexes,
    logWebhookEvent,
} from "@/lib/users";

// Runtime Node.js obligatoire : svix utilise `crypto` natif (HMAC SHA256),
// indisponible dans le runtime Edge.
export const runtime = "nodejs";
// Force le rendu dynamique : un webhook ne doit jamais être mis en cache,
// chaque POST doit exécuter le handler.
export const dynamic = "force-dynamic";

/**
 * Récupère l'email principal du user Clerk.
 * Clerk autorise plusieurs emails par compte, on cherche celui marqué comme
 * primaire via `primary_email_address_id` ; à défaut, on prend le premier.
 */
function getPrimaryEmail(data: {
    email_addresses?: Array<{id: string; email_address: string}>;
    primary_email_address_id?: string | null;
}): string | null {
    const list = data.email_addresses ?? [];
    if (list.length === 0) return null;
    const primary = data.primary_email_address_id
        ? list.find((e) => e.id === data.primary_email_address_id)
        : undefined;
    return (primary ?? list[0]).email_address;
}

export async function POST(req: Request) {
    // Le secret est partagé avec Clerk : il sert à vérifier la signature
    // HMAC du payload. Sans lui, on ne peut pas prouver que la requête vient
    // bien de Clerk → on refuse de traiter.
    const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!secret) {
        console.error("[clerk-webhook] CLERK_WEBHOOK_SIGNING_SECRET missing");
        return new Response("Server misconfigured", {status: 500});
    }

    // Headers Svix : id unique de delivery, timestamp anti-replay, signature HMAC.
    // En Next 16, headers() est asynchrone.
    const hdrs = await headers();
    const svixId = hdrs.get("svix-id");
    const svixTimestamp = hdrs.get("svix-timestamp");
    const svixSignature = hdrs.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
        return new Response("Missing Svix headers", {status: 400});
    }

    // IMPORTANT : lire le body en texte brut (pas en JSON).
    // La signature HMAC est calculée sur les octets exacts du payload ;
    // un re-stringify après JSON.parse changerait l'ordre des clés ou les
    // espaces et invaliderait la vérification.
    const payload = await req.text();

    // Vérification cryptographique de la signature.
    // Si la requête est falsifiée ou si le timestamp est trop vieux (anti-replay),
    // verify() lève → on répond 401 sans toucher à la DB.
    let evt: WebhookEvent;
    try {
        evt = new Webhook(secret).verify(payload, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        }) as WebhookEvent;
    } catch (err) {
        console.warn("[clerk-webhook] Signature verification failed", err);
        return new Response("Invalid signature", {status: 401});
    }

    // Crée les index uniques (clerkId, eventId) si pas encore faits.
    // L'appel est mémoïsé côté lib/users.ts → exécuté une seule fois par process.
    await ensureUserIndexes();

    // Idempotency : on enregistre le svix-id (unique par delivery) dans
    // webhook_events. Si l'insert échoue avec duplicate key, c'est que Svix
    // a déjà livré ce même event (retry réseau, etc.) → on skip avec 200
    // pour qu'il arrête de retenter.
    const firstSeen = await logWebhookEvent(svixId, evt.type);
    if (!firstSeen) {
        return new Response(JSON.stringify({skipped: "duplicate", eventId: svixId}), {
            status: 200,
            headers: {"content-type": "application/json"},
        });
    }

    try {
        switch (evt.type) {
            // user.created et user.updated sont traités identiquement :
            // upsert sur clerkId. Cela couvre aussi le cas où on rate un
            // user.created (race / downtime) et qu'on reçoit l'updated en premier.
            case "user.created":
            case "user.updated": {
                const data = evt.data;
                const email = getPrimaryEmail(data);
                if (!email) {
                    // 422 : payload techniquement valide mais inutilisable.
                    // Pas de retry utile, l'event reste loggé.
                    console.warn("[clerk-webhook] User without email", {clerkId: data.id});
                    return new Response("User missing email", {status: 422});
                }
                await createOrUpdateUser({
                    clerkId: data.id,
                    email,
                    firstName: data.first_name ?? undefined,
                    lastName: data.last_name ?? undefined,
                    imageUrl: data.image_url ?? undefined,
                });
                break;
            }
            case "user.deleted": {
                // Sur deletion, Clerk n'envoie que `id` et `deleted: true`.
                const clerkId = evt.data.id;
                if (!clerkId) {
                    return new Response("Missing user id", {status: 422});
                }
                await deleteUser(clerkId);
                break;
            }
            default:
                // Tout autre type d'event (session.*, organization.*, etc.) est
                // acquitté mais pas traité ici. Ajouter un case si besoin.
                break;
        }

        return new Response(JSON.stringify({ok: true, type: evt.type}), {
            status: 200,
            headers: {"content-type": "application/json"},
        });
    } catch (err) {
        // 5xx : on signale l'échec à Svix qui va retenter (backoff exponentiel
        // jusqu'à ~24h). L'event reste dans webhook_events, mais le prochain
        // retry sera court-circuité par le check d'idempotency. Pour vraiment
        // permettre un re-traitement, il faudrait supprimer la ligne en cas
        // d'erreur — choix volontaire ici : on préfère ne pas re-jouer un event
        // qui a planté pour une raison métier (corrompt potentiellement la DB).
        console.error("[clerk-webhook] Handler error", {type: evt.type, err});
        return new Response("Handler error", {status: 500});
    }
}
