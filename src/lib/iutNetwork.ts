import {BlockList, isIPv4, isIPv6} from "node:net";
import {getIP} from "@better-auth/core/utils/ip";
import type {BetterAuthOptions} from "@better-auth/core";

/**
 * Réseau de l'IUT : plages d'IP publiques par lesquelles sortent les postes des salles.
 *
 * En salle d'examen, le réseau ne laisse passer que le site : `challenges.cloudflare.com`
 * est bloqué, le captcha Turnstile ne se charge pas et la connexion devient impossible.
 * Depuis ces plages, on n'exige donc pas le captcha (voir `@/lib/captchaExemption`).
 *
 * Plages lues dans `IUT_NETWORK_CIDRS` (variable runtime, jamais `NEXT_PUBLIC_`), séparées
 * par des virgules : `193.50.0.0/16, 2001:660:7301::/48`. Variable vide ou absente : aucune
 * exemption. L'IP est résolue par `getIP` de better-auth, la même que celle envoyée à
 * Turnstile et enregistrée sur les sessions.
 *
 * Serveur uniquement.
 */

// better-auth tronque les IPv6 à leur /64 avant de les renvoyer : une plage plus étroite
// ne correspondrait jamais.
const MAX_IPV6_PREFIX = 64;

type ParsedCidrs = {blockList: BlockList | null; invalid: string[]};

function parseEntry(blockList: BlockList, entry: string): boolean {
    const slash = entry.indexOf("/");
    const address = slash === -1 ? entry : entry.slice(0, slash);
    const prefixPart = slash === -1 ? null : entry.slice(slash + 1);
    const family = isIPv4(address) ? "ipv4" : isIPv6(address) ? "ipv6" : null;
    if (!family) return false;

    const maxPrefix = family === "ipv4" ? 32 : 128;
    if (prefixPart !== null && !/^\d+$/.test(prefixPart)) return false;
    const prefix = prefixPart === null ? maxPrefix : Number(prefixPart);
    if (prefix > maxPrefix) return false;
    if (family === "ipv6" && prefix > MAX_IPV6_PREFIX) return false;

    blockList.addSubnet(address, prefix, family);
    return true;
}

/** Analyse la liste de plages. Les entrées malformées sont écartées et renvoyées dans `invalid`. */
export function parseCidrs(raw: string | undefined): ParsedCidrs {
    const entries = (raw ?? "").split(",").map((e) => e.trim()).filter(Boolean);
    const blockList = new BlockList();
    const invalid: string[] = [];
    let valid = 0;
    for (const entry of entries) {
        if (parseEntry(blockList, entry)) valid++;
        else invalid.push(entry);
    }
    return {blockList: valid > 0 ? blockList : null, invalid};
}

let cache: {raw: string | undefined; parsed: ParsedCidrs} | null = null;

function cidrsFor(raw: string | undefined): ParsedCidrs {
    if (cache && cache.raw === raw) return cache.parsed;
    const parsed = parseCidrs(raw);
    if (parsed.invalid.length > 0) {
        console.error(`[iutNetwork] IUT_NETWORK_CIDRS : entrées ignorées, invalides : ${parsed.invalid.join(", ")}`);
    }
    cache = {raw, parsed};
    return parsed;
}

const envCidrs = () => process.env.IUT_NETWORK_CIDRS;

/** `true` si l'IP appartient au réseau de l'IUT. Échoue fermé : IP inconnue ou liste vide → `false`. */
export function isIutNetworkIp(ip: string | null | undefined, raw: string | undefined = envCidrs()): boolean {
    if (!ip) return false;
    const {blockList} = cidrsFor(raw);
    if (!blockList) return false;
    const family = isIPv4(ip) ? "ipv4" : isIPv6(ip) ? "ipv6" : null;
    return family !== null && blockList.check(ip, family);
}

/** `true` si la requête (ou ses en-têtes) vient du réseau de l'IUT. */
export function isIutNetworkRequest(
    req: Request | Headers,
    options: BetterAuthOptions,
    raw: string | undefined = envCidrs(),
): boolean {
    return isIutNetworkIp(getIP(req, options), raw);
}
