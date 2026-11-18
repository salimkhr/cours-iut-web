import {describe, expect, test} from "bun:test";
import {isIutNetworkIp, isIutNetworkRequest, parseCidrs} from "@/lib/iutNetwork";

const CIDRS = "193.50.0.0/16, 2001:660:7301::/48";

describe("parseCidrs", () => {
    test("accepte IPv4 et IPv6, ignore les espaces et entrées vides", () => {
        const {invalid} = parseCidrs(" 193.50.0.0/16 ,, 2001:660:7301::/48 , 10.0.0.1 ");
        expect(invalid).toEqual([]);
    });

    test("signale les entrées malformées", () => {
        const {invalid} = parseCidrs("193.50.0.0/33, pas-une-ip, 10.0.0.0/8");
        expect(invalid).toEqual(["193.50.0.0/33", "pas-une-ip"]);
    });

    test("refuse un préfixe IPv6 plus étroit que /64 (better-auth tronque l'IP à /64)", () => {
        const {invalid} = parseCidrs("2001:660:7301:1::/80");
        expect(invalid).toEqual(["2001:660:7301:1::/80"]);
    });
});

describe("isIutNetworkIp", () => {
    test("IPv4 dans la plage", () => {
        expect(isIutNetworkIp("193.50.12.34", CIDRS)).toBe(true);
    });

    test("IPv4 hors plage", () => {
        expect(isIutNetworkIp("8.8.8.8", CIDRS)).toBe(false);
    });

    test("IPv6 sous la forme développée renvoyée par getIP", () => {
        expect(isIutNetworkIp("2001:0660:7301:0042:0000:0000:0000:0000", CIDRS)).toBe(true);
        expect(isIutNetworkIp("2001:0660:7302:0000:0000:0000:0000:0000", CIDRS)).toBe(false);
    });

    test("échoue fermé : IP inconnue, variable vide ou absente", () => {
        expect(isIutNetworkIp(null, CIDRS)).toBe(false);
        expect(isIutNetworkIp("193.50.12.34", "")).toBe(false);
        expect(isIutNetworkIp("193.50.12.34", undefined)).toBe(false);
        expect(isIutNetworkIp("n'importe quoi", CIDRS)).toBe(false);
    });
});

describe("isIutNetworkRequest", () => {
    const options = {advanced: {ipAddress: {ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"]}}};
    const req = (headers: Record<string, string>) => new Request("https://cours.test/", {headers});

    test("lit l'IP posée par Cloudflare", () => {
        expect(isIutNetworkRequest(req({"cf-connecting-ip": "193.50.12.34"}), options, CIDRS)).toBe(true);
        expect(isIutNetworkRequest(req({"cf-connecting-ip": "8.8.8.8"}), options, CIDRS)).toBe(false);
    });

    test("X-Forwarded-For à plusieurs valeurs : IP non fiable, pas d'exemption", () => {
        expect(isIutNetworkRequest(req({"x-forwarded-for": "193.50.12.34, 8.8.8.8"}), options, CIDRS)).toBe(false);
    });
});
