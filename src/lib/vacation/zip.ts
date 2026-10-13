import {deflateRawSync, inflateRawSync} from "node:zlib";

/**
 * Lecture / écriture ZIP minimale (méthodes « stored » et « deflate »), suffisante pour
 * ouvrir un .xlsx, en modifier quelques parties XML et le réempaqueter — sans dépendance.
 * Code serveur uniquement (node:zlib).
 */

export type ZipEntries = Map<string, Uint8Array>;

const SIG_LOCAL = 0x04034b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_EOCD = 0x06054b50;

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
    }
    return table;
})();

function crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}

export function readZip(buffer: Uint8Array): ZipEntries {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    let eocd = -1;
    for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 22 - 0xffff); i--) {
        if (view.getUint32(i, true) === SIG_EOCD) {
            eocd = i;
            break;
        }
    }
    if (eocd < 0) throw new Error("Archive ZIP invalide (fin de répertoire introuvable)");

    const count = view.getUint16(eocd + 10, true);
    let offset = view.getUint32(eocd + 16, true);
    const decoder = new TextDecoder();
    const entries: ZipEntries = new Map();

    for (let i = 0; i < count; i++) {
        if (view.getUint32(offset, true) !== SIG_CENTRAL) throw new Error("Répertoire ZIP corrompu");
        const method = view.getUint16(offset + 10, true);
        const compressedSize = view.getUint32(offset + 20, true);
        const nameLength = view.getUint16(offset + 28, true);
        const extraLength = view.getUint16(offset + 30, true);
        const commentLength = view.getUint16(offset + 32, true);
        const localOffset = view.getUint32(offset + 42, true);
        const name = decoder.decode(buffer.subarray(offset + 46, offset + 46 + nameLength));

        if (view.getUint32(localOffset, true) !== SIG_LOCAL) throw new Error(`Entrée ZIP corrompue : ${name}`);
        const dataStart = localOffset + 30 + view.getUint16(localOffset + 26, true) + view.getUint16(localOffset + 28, true);
        const raw = buffer.subarray(dataStart, dataStart + compressedSize);

        if (method === 0) entries.set(name, raw.slice());
        else if (method === 8) entries.set(name, new Uint8Array(inflateRawSync(raw)));
        else throw new Error(`Méthode de compression ZIP non gérée (${method}) pour ${name}`);

        offset += 46 + nameLength + extraLength + commentLength;
    }
    return entries;
}

export function writeZip(entries: ZipEntries): Uint8Array {
    const encoder = new TextEncoder();
    const locals: Uint8Array[] = [];
    const centrals: Uint8Array[] = [];
    let offset = 0;

    for (const [name, data] of entries) {
        const nameBytes = encoder.encode(name);
        const compressed = new Uint8Array(deflateRawSync(data));
        const crc = crc32(data);

        const local = new Uint8Array(30 + nameBytes.length);
        const lv = new DataView(local.buffer);
        lv.setUint32(0, SIG_LOCAL, true);
        lv.setUint16(4, 20, true);
        lv.setUint16(6, 0x0800, true); // noms en UTF-8
        lv.setUint16(8, 8, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, compressed.length, true);
        lv.setUint32(22, data.length, true);
        lv.setUint16(26, nameBytes.length, true);
        local.set(nameBytes, 30);

        const central = new Uint8Array(46 + nameBytes.length);
        const cv = new DataView(central.buffer);
        cv.setUint32(0, SIG_CENTRAL, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0x0800, true);
        cv.setUint16(10, 8, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, compressed.length, true);
        cv.setUint32(24, data.length, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint32(42, offset, true);
        central.set(nameBytes, 46);

        locals.push(local, compressed);
        centrals.push(central);
        offset += local.length + compressed.length;
    }

    const centralSize = centrals.reduce((sum, c) => sum + c.length, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, SIG_EOCD, true);
    ev.setUint16(8, entries.size, true);
    ev.setUint16(10, entries.size, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);

    const out = new Uint8Array(offset + centralSize + eocd.length);
    let pos = 0;
    for (const part of [...locals, ...centrals, eocd]) {
        out.set(part, pos);
        pos += part.length;
    }
    return out;
}
