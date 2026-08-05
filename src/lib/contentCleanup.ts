// src/lib/contentCleanup.ts
// Nettoyages hérités de la migration .tsx → DB.

/**
 * Décode les entités HTML laissées par la migration. Le décodeur d'origine ne
 * connaissait que neuf entités nommées : tout le reste — accents (`&#xe9;`),
 * guillemets (`&quot;`), dollars des template literals (`&#x24;`), traits
 * d'arborescence (`&#x2500;`), emojis — s'affichait tel quel aux étudiants,
 * y compris à l'intérieur des blocs de code.
 *
 * Un seul passage : `String.replace` ne réexamine pas le texte inséré, donc
 * `&amp;copy;` devient `&copy;` et non `©`. C'est indispensable pour le cours
 * HTML, qui montre les entités elles-mêmes.
 */
const NAMED: Record<string, string> = {
    quot: '"', apos: "'", nbsp: " ", amp: "&", lt: "<", gt: ">",
    copy: "©", reg: "®", trade: "™", hellip: "…", mdash: "—", ndash: "–",
    laquo: "«", raquo: "»", lsquo: "'", rsquo: "'", ldquo: "“", rdquo: "”",
    times: "×", divide: "÷", deg: "°", euro: "€", middot: "·", bull: "•",
    larr: "←", rarr: "→", harr: "↔", darr: "↓", uarr: "↑",
};

export function decodeHtmlEntities(text: string): string {
    return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (whole, body: string) => {
        if (body[0] === "#") {
            const code = body[1] === "x" || body[1] === "X"
                ? parseInt(body.slice(2), 16)
                : parseInt(body.slice(1), 10);
            // Points de code invalides : on rend l'entité intacte plutôt que
            // d'insérer un caractère de remplacement.
            if (!Number.isFinite(code) || code < 1 || code > 0x10ffff) return whole;
            return String.fromCodePoint(code);
        }
        return NAMED[body] ?? whole;
    });
}

/**
 * Remplace les espaces JSX `{" "}` par une vraie espace. En JSX, cette
 * expression *produit* une espace ; la migration la recopiait littéralement, si
 * bien que les étudiants lisaient « clic droit →{" "} Inspecter ».
 *
 * À n'appliquer qu'au texte rédactionnel : dans un bloc de code React, `{" "}`
 * est du code qu'il faut afficher tel quel.
 */
export function stripJsxSpacers(text: string): string {
    return text.replace(/\{\s*(["'])\s*\1\s*\}/g, " ").replace(/[ \t]{2,}/g, " ");
}

/**
 * Retire le préfixe de numérotation d'un titre de partie. Le renderer le pose
 * déjà lui-même — « A — » au premier niveau, « 1. » aux suivants — donc un
 * titre stocké sous la forme « A- Le debug » s'affichait « A A- Le debug ».
 *
 * Le `\s+` final protège les titres légitimes : « E-commerce », « A/B testing »
 * et « 3D » ne sont pas touchés.
 */
export function stripHeadingPrefix(title: string): string {
    return title
        // Forme hiérarchique : « 2.1 », « 3.2.1 », suivie d'une espace.
        .replace(/^\s*\d{1,2}(?:\.\d{1,2})+[.)]?\s+/, "")
        // Forme mixte des slides : « B.1 - », « C.2 ». Le point suivi d'un
        // chiffre distingue le préfixe d'un « Node.js - Introduction ».
        .replace(/^\s*[A-Z](?:\.\d{1,2})+\s*[-–—.)]?\s+/, "")
        // Forme simple : « A- », « B — », « 1. », « 12) ».
        .replace(/^\s*(?:[A-Z]|\d{1,2})\s*[-–—/.)]\s+/, "")
        .trim();
}
