#!/usr/bin/env node
// Rendu headless d'une page HTML dans le bac à sable (Chromium via Playwright).
//
// Usage :
//   rendu-html <fichier.html | http://localhost:PORT/chemin> [options]
//     --capture <png>        capture pleine page (défaut : dans le répertoire courant,
//                            <nom du fichier>.rendu.png ou rendu-<port>.png pour une URL ;
//                            lancez la commande depuis votre dossier, jamais depuis /work)
//     --selecteurs "a,b"     éléments à décrire (défaut : "h1,h2,h3,nav,main,header,footer,img,a,button,form,table")
//     --largeur <px>         largeur du viewport (défaut 1280)
//     --hauteur <px>         hauteur du viewport (défaut 800)
//     --html                 ajoute le DOM calculé (outerHTML après exécution des scripts)
//     --max-texte <n>        longueur max du texte visible rendu (défaut 4000)
//
// Sortie : un JSON sur stdout (titre, texte visible, erreurs console et JS, requêtes
// échouées, styles calculés et boîtes des éléments demandés, chemin de la capture).
// Le réseau du conteneur est coupé : les URL jsDelivr de bootstrap et bootstrap-icons
// sont servies depuis /opt/bac/node_modules ; toute autre ressource externe échoue et
// apparaît dans "requetesEchouees" (ce n'est pas un défaut du contenu relu).

import { chromium } from "playwright";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PROPRIETES = [
    "display", "position", "color", "background-color", "font-family", "font-size",
    "font-weight", "line-height", "text-align", "margin", "padding", "border",
    "width", "height", "flex-direction", "justify-content", "align-items",
    "grid-template-columns", "gap", "visibility", "opacity",
];
const PAQUETS_LOCAUX = new Set(["bootstrap", "bootstrap-icons"]);
const TYPES = {
    ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript",
    ".map": "application/json", ".woff": "font/woff", ".woff2": "font/woff2",
    ".svg": "image/svg+xml", ".json": "application/json",
};

function lireOptions(argv) {
    const opts = { cible: null, capture: null, selecteurs: null, largeur: 1280, hauteur: 800, html: false, maxTexte: 4000 };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--capture") opts.capture = argv[++i];
        else if (a === "--selecteurs") opts.selecteurs = argv[++i];
        else if (a === "--largeur") opts.largeur = Number(argv[++i]);
        else if (a === "--hauteur") opts.hauteur = Number(argv[++i]);
        else if (a === "--html") opts.html = true;
        else if (a === "--max-texte") opts.maxTexte = Number(argv[++i]);
        else if (!opts.cible) opts.cible = a;
        else throw new Error(`argument inattendu : ${a}`);
    }
    if (!opts.cible) throw new Error("usage : rendu-html <fichier.html | url> [options]");
    return opts;
}

function versUrl(cible) {
    if (/^https?:\/\//.test(cible)) return cible;
    const absolu = path.resolve(cible);
    if (!existsSync(absolu) || !statSync(absolu).isFile()) throw new Error(`fichier introuvable : ${absolu}`);
    return pathToFileURL(absolu).href;
}

// Toujours dans le répertoire courant : plusieurs étudiants partagent le conteneur, chacun
// travaille dans son dossier ; une capture à côté du fichier rendu (ex. /work/fournis) ou
// dans /work écraserait celle d'un autre.
function nomCaptureParDefaut(cible, url) {
    if (url.startsWith("file:")) return path.join(process.cwd(), `${path.basename(cible)}.rendu.png`);
    const port = new URL(url).port || "80";
    return path.join(process.cwd(), `rendu-${port}.png`);
}

async function main() {
    const opts = lireOptions(process.argv.slice(2));
    const url = versUrl(opts.cible);
    const capture = path.resolve(opts.capture ?? nomCaptureParDefaut(opts.cible, url));
    const selecteurs = (opts.selecteurs ?? "h1,h2,h3,nav,main,header,footer,img,a,button,form,table")
        .split(",").map((s) => s.trim()).filter(Boolean);

    const navigateur = await chromium.launch({ headless: true });
    const page = await navigateur.newPage({ viewport: { width: opts.largeur, height: opts.hauteur } });
    const consoleMessages = [];
    const erreursJs = [];
    const requetesEchouees = [];
    const servisLocalement = [];

    page.on("console", (m) => {
        if (m.type() === "error" || m.type() === "warning") consoleMessages.push({ type: m.type(), texte: m.text() });
    });
    page.on("pageerror", (e) => erreursJs.push(String(e.message ?? e)));
    page.on("requestfailed", (r) => requetesEchouees.push({ url: r.url(), raison: r.failure()?.errorText ?? "inconnue" }));

    await page.route("https://cdn.jsdelivr.net/npm/**", async (route) => {
        const m = /^https:\/\/cdn\.jsdelivr\.net\/npm\/(@?[^@/]+)(?:@[^/]+)?\/(.+?)(?:\?.*)?$/.exec(route.request().url());
        if (m && PAQUETS_LOCAUX.has(m[1])) {
            const fichier = path.join("/opt/bac/node_modules", m[1], m[2]);
            if (existsSync(fichier)) {
                servisLocalement.push(route.request().url());
                return route.fulfill({
                    status: 200,
                    body: readFileSync(fichier),
                    contentType: TYPES[path.extname(fichier)] ?? "application/octet-stream",
                    headers: { "access-control-allow-origin": "*" },
                });
            }
        }
        return route.abort("internetdisconnected");
    });

    await page.goto(url, { waitUntil: "load", timeout: 20000 });
    await page.waitForTimeout(300);

    const resultat = await page.evaluate(({ selecteurs, proprietes, maxTexte, avecHtml }) => {
        const decrire = (el) => {
            const st = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            const styles = {};
            for (const p of proprietes) styles[p] = st.getPropertyValue(p);
            return {
                balise: el.tagName.toLowerCase(),
                id: el.id || undefined,
                classes: el.className && typeof el.className === "string" ? el.className : undefined,
                texte: (el.innerText ?? "").trim().slice(0, 200),
                boite: { x: Math.round(r.x), y: Math.round(r.y), largeur: Math.round(r.width), hauteur: Math.round(r.height) },
                styles,
            };
        };
        const elements = {};
        for (const s of selecteurs) {
            let liste = [];
            try { liste = Array.from(document.querySelectorAll(s)); } catch { elements[s] = { erreur: "sélecteur invalide" }; continue; }
            elements[s] = { nombre: liste.length, premiers: liste.slice(0, 5).map(decrire) };
        }
        return {
            titre: document.title,
            texteVisible: (document.body?.innerText ?? "").slice(0, maxTexte),
            dimensionsPage: { largeur: document.documentElement.scrollWidth, hauteur: document.documentElement.scrollHeight },
            elements,
            html: avecHtml ? document.documentElement.outerHTML : undefined,
        };
    }, { selecteurs, proprietes: PROPRIETES, maxTexte: opts.maxTexte, avecHtml: opts.html });

    await page.screenshot({ path: capture, fullPage: true });
    await navigateur.close();

    process.stdout.write(JSON.stringify({
        url, capture, viewport: { largeur: opts.largeur, hauteur: opts.hauteur },
        ...resultat, consoleMessages, erreursJs, requetesEchouees, servisLocalement,
    }, null, 2) + "\n");
}

main().catch((e) => {
    process.stderr.write(`rendu-html : ${e.message ?? e}\n`);
    process.exit(1);
});
