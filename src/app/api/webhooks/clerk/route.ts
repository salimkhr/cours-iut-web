import {headers} from "next/headers";
import {Webhook} from "svix";
import type {WebhookEvent} from "@clerk/nextjs/server";
import {
    createOrUpdateUser,
    deleteUser,
    ensureUserIndexes,
    logWebhookEvent,
} from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!secret) {
        console.error("[clerk-webhook] CLERK_WEBHOOK_SIGNING_SECRET missing");
        return new Response("Server misconfigured", {status: 500});
    }

    const hdrs = await headers();
    const svixId = hdrs.get("svix-id");
    const svixTimestamp = hdrs.get("svix-timestamp");
    const svixSignature = hdrs.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
        return new Response("Missing Svix headers", {status: 400});
    }

    const payload = await req.text();

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

    await ensureUserIndexes();

    const firstSeen = await logWebhookEvent(svixId, evt.type);
    if (!firstSeen) {
        return new Response(JSON.stringify({skipped: "duplicate", eventId: svixId}), {
            status: 200,
            headers: {"content-type": "application/json"},
        });
    }

    try {
        switch (evt.type) {
            case "user.created":
            case "user.updated": {
                const data = evt.data;
                const email = getPrimaryEmail(data);
                if (!email) {
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
                const clerkId = evt.data.id;
                if (!clerkId) {
                    return new Response("Missing user id", {status: 422});
                }
                await deleteUser(clerkId);
                break;
            }
            default:
                // Other events are acknowledged but not handled
                break;
        }

        return new Response(JSON.stringify({ok: true, type: evt.type}), {
            status: 200,
            headers: {"content-type": "application/json"},
        });
    } catch (err) {
        console.error("[clerk-webhook] Handler error", {type: evt.type, err});
        // 5xx so Clerk/Svix retries
        return new Response("Handler error", {status: 500});
    }
}
