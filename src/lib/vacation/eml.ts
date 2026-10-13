/**
 * Brouillon e-mail au format .eml (RFC 5322 / MIME), avec une pièce jointe.
 * L'en-tête `X-Unsent: 1` fait ouvrir le fichier comme un message en cours de
 * rédaction (Outlook, Thunderbird, Apple Mail) plutôt que comme un message reçu.
 */

export interface EmlAttachment {
    filename: string;
    bytes: Uint8Array;
    mimeType: string;
}

export interface EmlInput {
    to: string;
    subject: string;
    text: string;
    attachment: EmlAttachment;
}

const CRLF = "\r\n";

/** Base64 coupé à 76 caractères, comme l'exige MIME. */
function base64Lines(bytes: Uint8Array): string {
    const b64 = Buffer.from(bytes).toString("base64");
    return (b64.match(/.{1,76}/g) ?? []).join(CRLF);
}

/** En-tête non ASCII → mot encodé RFC 2047 (UTF-8, base64). */
function encodeHeader(value: string): string {
    if (/^[\x20-\x7e]*$/.test(value)) return value;
    return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

/** Repli ASCII d'un nom de fichier (accents retirés, caractères exotiques remplacés). */
function asciiFilename(filename: string): string {
    return filename.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_");
}

/** Retire tout saut de ligne : empêche l'injection d'en-têtes via `to` ou `subject`. */
const singleLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

export function buildEml({to, subject, text, attachment}: EmlInput): string {
    const boundary = `----=_vacation_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    const body = text.replace(/\r?\n/g, CRLF);
    const ascii = asciiFilename(attachment.filename);
    const utf8 = encodeURIComponent(attachment.filename);

    return [
        "X-Unsent: 1",
        `To: ${singleLine(to)}`,
        `Subject: ${encodeHeader(singleLine(subject))}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        base64Lines(Buffer.from(body, "utf8")),
        `--${boundary}`,
        `Content-Type: ${attachment.mimeType};${CRLF} name="${ascii}"`,
        "Content-Transfer-Encoding: base64",
        // En-tête plié (continuation = CRLF + espace) pour rester sous 78 caractères par ligne.
        `Content-Disposition: attachment;${CRLF} filename="${ascii}";${CRLF} filename*=UTF-8''${utf8}`,
        "",
        base64Lines(attachment.bytes),
        `--${boundary}--`,
        "",
    ].join(CRLF);
}

const MOIS = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** « 2026-09 » → « septembre 2026 ». */
export function monthLabel(month: string): string {
    const [year, m] = month.split("-");
    return `${MOIS[Number(m) - 1] ?? m} ${year}`;
}

/** « Khraimeche Salim » (nom du modèle) → « Salim Khraimeche ». */
export function displayName(ficheNom: string): string {
    const parts = ficheNom.trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) return parts.join(" ");
    return `${parts[parts.length - 1]} ${parts.slice(0, -1).join(" ")}`;
}

/** Objet et message type de l'envoi mensuel de la déclaration d'heures. */
export function draftMessage(month: string, ficheNom: string): {subject: string; text: string} {
    const label = monthLabel(month);
    const nom = displayName(ficheNom);
    return {
        subject: `Déclaration d'heures de ${label}`,
        text: [
            "Bonjour,",
            "",
            `Vous trouverez ci-joint ma déclaration d'heures du mois de ${label}.`,
            "",
            "Bien cordialement,",
            ...(nom ? [nom] : []),
        ].join("\n"),
    };
}
