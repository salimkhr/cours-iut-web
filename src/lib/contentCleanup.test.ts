import { describe, expect, test } from "bun:test";
import { decodeHtmlEntities, stripHeadingPrefix, stripJsxSpacers } from "@/lib/contentCleanup";

describe("decodeHtmlEntities", () => {
    test("décode les entités numériques hexadécimales et décimales", () => {
        expect(decodeHtmlEntities("Bool&#xe9;en")).toBe("Booléen");
        expect(decodeHtmlEntities("Cha&#xee;ne de caract&#xe8;res")).toBe("Chaîne de caractères");
        expect(decodeHtmlEntities("&#233;t&#233;")).toBe("été");
    });

    test("décode les entités nommées courantes", () => {
        expect(decodeHtmlEntities("&quot;main-title&quot;")).toBe('"main-title"');
        expect(decodeHtmlEntities("&apos;Medical&apos;")).toBe("'Medical'");
        expect(decodeHtmlEntities("a =&gt; b")).toBe("a => b");
        expect(decodeHtmlEntities("10 &lt; 5")).toBe("10 < 5");
    });

    test("restitue le dollar des template literals", () => {
        expect(decodeHtmlEntities("&#x24;{JSON.stringify(x)}")).toBe("${JSON.stringify(x)}");
    });

    test("restitue les traits d'arborescence et les emojis", () => {
        expect(decodeHtmlEntities("&#x251c;&#x2500;&#x2500; index.html")).toBe("├── index.html");
        expect(decodeHtmlEntities("&#x1f680; API")).toBe("🚀 API");
    });

    test("un seul passage : &amp;copy; reste l'entité &copy;, pas ©", () => {
        // Le cours HTML montre les entités elles-mêmes : les décoder deux fois
        // détruirait le contenu pédagogique.
        expect(decodeHtmlEntities("&amp;copy; 2024 Mon Site")).toBe("&copy; 2024 Mon Site");
        expect(decodeHtmlEntities("&amp;lt;")).toBe("&lt;");
    });

    test("laisse intact ce qui n'est pas une entité connue", () => {
        expect(decodeHtmlEntities("Tom & Jerry")).toBe("Tom & Jerry");
        expect(decodeHtmlEntities("&inconnue;")).toBe("&inconnue;");
        expect(decodeHtmlEntities("prix: 100&euro;")).toBe("prix: 100€");
    });
});

describe("stripHeadingPrefix", () => {
    test("retire les préfixes de partie et de sous-partie", () => {
        expect(stripHeadingPrefix("A- Le debug")).toBe("Le debug");
        expect(stripHeadingPrefix("B- Modification des éléments")).toBe("Modification des éléments");
        expect(stripHeadingPrefix("1. Inclure JavaScript")).toBe("Inclure JavaScript");
        expect(stripHeadingPrefix("C — Opérateurs")).toBe("Opérateurs");
        expect(stripHeadingPrefix("D / Les tableaux")).toBe("Les tableaux");
        expect(stripHeadingPrefix("12) Annexe")).toBe("Annexe");
    });

    test("ne touche pas aux titres qui commencent par une lettre collée", () => {
        expect(stripHeadingPrefix("E-commerce et paiement")).toBe("E-commerce et paiement");
        expect(stripHeadingPrefix("A/B testing")).toBe("A/B testing");
        expect(stripHeadingPrefix("3D et animations")).toBe("3D et animations");
    });

    test("laisse un titre sans préfixe inchangé", () => {
        expect(stripHeadingPrefix("Les variables")).toBe("Les variables");
        expect(stripHeadingPrefix("Pourquoi Rust ?")).toBe("Pourquoi Rust ?");
    });

    test("retire aussi les préfixes hiérarchiques", () => {
        expect(stripHeadingPrefix("2.1 Boucle for classique")).toBe("Boucle for classique");
        expect(stripHeadingPrefix("2.2 Méthode forEach")).toBe("Méthode forEach");
        expect(stripHeadingPrefix("1.1. Affichage simple")).toBe("Affichage simple");
        expect(stripHeadingPrefix("3.2.1 Cas particulier")).toBe("Cas particulier");
    });

    test("ne confond pas un numéro de version avec un préfixe", () => {
        expect(stripHeadingPrefix("Node 18.2 : nouveautés")).toBe("Node 18.2 : nouveautés");
        expect(stripHeadingPrefix("HTTP/1.1 et HTTP/2")).toBe("HTTP/1.1 et HTTP/2");
    });

    test("est idempotent", () => {
        const once = stripHeadingPrefix("A- Le debug");
        expect(stripHeadingPrefix(once)).toBe(once);
    });
});

describe("stripJsxSpacers", () => {
    test("remplace l'espace JSX par une vraie espace", () => {
        expect(stripJsxSpacers('clic droit →{" "} `Inspecter`')).toBe("clic droit → `Inspecter`");
        expect(stripJsxSpacers("utilisez `filter` et{\" \"} `map`")).toBe("utilisez `filter` et `map`");
    });

    test("accepte les guillemets simples et les espaces internes", () => {
        expect(stripJsxSpacers("a{' '}b")).toBe("a b");
        expect(stripJsxSpacers('a{ " " }b')).toBe("a b");
    });

    test("n'écrase pas les espaces multiples en une seule", () => {
        expect(stripJsxSpacers("mot{\" \"}  suite")).toBe("mot suite");
    });

    test("laisse intact un texte sans artefact", () => {
        expect(stripJsxSpacers("un texte normal")).toBe("un texte normal");
        expect(stripJsxSpacers("objet {clé: valeur}")).toBe("objet {clé: valeur}");
    });
});

test("préfixe mixte des slides « B.1 - »", () => {
    expect(stripHeadingPrefix("B.1 - Ajouter un écouteur")).toBe("Ajouter un écouteur");
    expect(stripHeadingPrefix("A - Qu'est-ce qu'un événement ?")).toBe("Qu'est-ce qu'un événement ?");
    expect(stripHeadingPrefix("C.2 Structure")).toBe("Structure");
});

test("un titre qui contient un point n'est pas un préfixe", () => {
    expect(stripHeadingPrefix("Node.js - Introduction")).toBe("Node.js - Introduction");
    expect(stripHeadingPrefix("Les Événements - Introduction")).toBe("Les Événements - Introduction");
});
