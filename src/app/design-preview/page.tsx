import type { Block } from "@/types/CourseContent";
import type Module from "@/types/Module";
import { BlockRenderer } from "@/components/builder/BlockRenderer";
import { moduleColor } from "@/lib/moduleColor";

/**
 * Page kitchen-sink : rend BlockRenderer avec l'ensemble des types de blocs,
 * dans le même habillage que la page de contenu réelle (main.header-module +
 * .course-content). Sert de canvas de design pour le rendu DB, sans dépendre
 * des données d'un cours. Page de travail — supprimable une fois le design figé.
 */

const mockModule: Module = {
    _id: "design-preview",
    title: "Module de test",
    path: "rust",
    iconName: "Cpu",
    sections: [],
    associatedSae: [],
    projectIcon: "ChefHat",
    colorLight: "#C1440E",
    colorDark: "#E8703A",
};

const DEMO_IMG =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='320'><rect width='100%25' height='100%25' fill='%23f2e8df'/><text x='50%25' y='50%25' font-family='sans-serif' font-size='26' text-anchor='middle' dominant-baseline='middle' fill='%23C1440E'>Image de démonstration</text></svg>";

const blocks: Block[] = [
    {
        id: "intro",
        type: "text",
        props: {
            content:
                "Ce module de **test** rassemble tous les types de blocs pour caler le rendu. Il contient du texte, des `commandes`, des [liens](https://example.com), des listes, des blocs de code, des callouts, des tableaux, des colonnes et des diagrammes.",
        },
    },
    {
        id: "co-info",
        type: "callout",
        props: { variant: "info", title: "À propos de ce module" },
        children: [
            {
                id: "co-info-t",
                type: "text",
                props: {
                    content:
                        "Chaque section ci-dessous exerce un cas de rendu différent. Objectif : un rythme vertical net et une hiérarchie de titres lisible.",
                },
            },
        ],
    },
    {
        id: "sec-a",
        type: "section",
        props: { title: "Installer la toolchain", projectRef: false },
        children: [
            {
                id: "a-steps",
                type: "list",
                props: { ordered: true },
                children: [
                    { id: "a-1", type: "list-item", props: { text: "Rendez-vous sur [rustup.rs](https://rustup.rs) et téléchargez l'installateur." } },
                    { id: "a-2", type: "list-item", props: { text: "Exécutez l'installateur et acceptez l'installation **standard**." } },
                    { id: "a-3", type: "list-item", props: { text: "Ouvrez un nouveau terminal et vérifiez les versions :" } },
                ],
            },
            {
                id: "a-code",
                type: "code",
                props: { language: "bash", code: "rustc --version\ncargo --version", filename: "", showLineNumbers: false, collapsible: false },
            },
            { id: "a-res", type: "text", props: { content: "Résultat attendu :" } },
            {
                id: "a-out",
                type: "code",
                props: { language: "bash", code: "rustc 1.88.0 (6b00bc388 2025-06-23)\ncargo 1.88.0 (873a06493 2025-05-10)", filename: "", showLineNumbers: false, collapsible: false },
            },
            {
                id: "a-warn",
                type: "callout",
                props: { variant: "warning", title: "Commande introuvable ?" },
                children: [
                    { id: "a-warn-t", type: "text", props: { content: "Vous utilisez sûrement un terminal ouvert **avant** l'installation. Fermez-le et ouvrez-en un nouveau." } },
                ],
            },
            {
                id: "a-sub",
                type: "section",
                props: { title: "Vérifier l'installation", projectRef: false },
                children: [
                    { id: "a-sub-t", type: "text", props: { content: "Cette sous-section teste le rendu d'un titre de niveau 3 (`1.`)." } },
                    {
                        id: "a-sub-code",
                        type: "code",
                        props: { language: "bash", code: "rustup show", filename: "", showLineNumbers: true, collapsible: false },
                    },
                ],
            },
        ],
    },
    {
        id: "sec-b",
        type: "section",
        props: { title: "Créer le projet", projectRef: true },
        children: [
            {
                id: "b-cols",
                type: "columns",
                props: {},
                children: [
                    {
                        id: "b-col1",
                        type: "column",
                        props: { span: 6 },
                        children: [
                            { id: "b-c1-t", type: "text", props: { content: "**Cargo** crée le squelette du projet." } },
                            { id: "b-c1-code", type: "code", props: { language: "bash", code: "cargo new tastyrusty\ncd tastyrusty", filename: "", showLineNumbers: false, collapsible: false } },
                        ],
                    },
                    {
                        id: "b-col2",
                        type: "column",
                        props: { span: 6 },
                        children: [
                            { id: "b-c2-t", type: "text", props: { content: "Puis on compile et on exécute." } },
                            { id: "b-c2-code", type: "code", props: { language: "bash", code: "cargo run", filename: "", showLineNumbers: false, collapsible: false } },
                        ],
                    },
                ],
            },
            {
                id: "b-table",
                type: "table",
                props: {
                    headers: ["Commande", "Rôle"],
                    rows: [
                        ["`cargo new`", "Crée un projet"],
                        ["`cargo run`", "Compile **et** exécute"],
                        ["`cargo check`", "Vérifie sans produire de binaire"],
                    ],
                },
            },
            { id: "b-quote", type: "quote", props: { text: "Un bon outil de build efface la friction du démarrage.", source: "Proverbe d'atelier" } },
            { id: "b-div", type: "divider", props: {} },
            {
                id: "b-code-main",
                type: "code",
                props: {
                    language: "rust",
                    filename: "src/main.rs",
                    title: "Programme principal",
                    code: 'fn main() {\n    let plats = 3;\n    println!("Service du soir — {} plats", plats);\n}',
                    showLineNumbers: true,
                    collapsible: false,
                    highlightLines: "2",
                },
            },
        ],
    },
    {
        id: "sec-c",
        type: "section",
        props: { title: "Composants riches", projectRef: false },
        children: [
            {
                id: "c-cwp",
                type: "code-with-preview",
                props: {
                    language: "html",
                    code: '<button style="padding:8px 16px;border-radius:8px;background:#C1440E;color:#fff;border:0">Commander</button>',
                },
            },
            { id: "c-img", type: "image-card", props: { src: DEMO_IMG, title: "figure-1.svg", alt: "Image de démonstration" } },
            {
                id: "c-collapse",
                type: "collapsible",
                props: { title: "Prérequis (dépliable)" },
                children: [
                    { id: "c-col-t", type: "text", props: { content: "Contenu masqué par défaut, révélé au clic. Teste le composant `collapsible`." } },
                ],
            },
            {
                id: "c-secard",
                type: "section-card",
                props: { title: "Documentation officielle", href: "https://doc.rust-lang.org", description: "Le livre de référence pour aller plus loin." },
            },
            {
                id: "c-tip",
                type: "callout",
                props: { variant: "tip", title: "Astuce" },
                children: [
                    { id: "c-tip-t", type: "text", props: { content: "`cargo run --quiet` masque les lignes de compilation." } },
                ],
            },
            {
                id: "c-reminder",
                type: "callout",
                props: { variant: "reminder", title: "Rappel" },
                children: [
                    { id: "c-rem-t", type: "text", props: { content: "Une macro se reconnaît au `!` final : `println!`, `vec!`, `format!`." } },
                ],
            },
            {
                id: "c-diagram",
                type: "diagram",
                props: {
                    header: "Cycle Cargo",
                    chart: "flowchart LR\n  A[cargo new] --> B[cargo check]\n  B --> C[cargo run]\n  C --> D[binaire]",
                },
            },
            {
                id: "c-download",
                type: "download-file",
                props: { language: "rust", filename: "main.rs", code: 'fn main() { println!("Hello"); }' },
            },
        ],
    },
    {
        id: "sec-bonus",
        type: "section",
        props: { title: "Pour aller plus loin", projectRef: false },
        children: [
            {
                id: "bonus-list",
                type: "list",
                props: { ordered: false },
                children: [
                    { id: "bo-1", type: "list-item", props: { text: "Comparez `cargo check` et `cargo build`." } },
                    { id: "bo-2", type: "list-item", props: { text: "Testez `cargo run --release`." } },
                    { id: "bo-3", type: "list-item", props: { text: "Explorez le fichier `Cargo.toml`." } },
                ],
            },
        ],
    },
];

export default function DesignPreviewPage() {
    const accent = moduleColor(mockModule);
    const accentDark = moduleColor(mockModule, "dark");

    return (
        <div className="flex flex-col w-full items-center justify-start min-h-screen">
            <main
                className="w-full max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14 header-module"
                style={{
                    "--module-color": accent,
                    "--module-color-dark": accentDark,
                } as React.CSSProperties}
            >
                <div className="course-content course-content-practice">
                    <BlockRenderer blocks={blocks} currentModule={mockModule} />
                </div>
            </main>
        </div>
    );
}
