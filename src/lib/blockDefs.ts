// src/lib/blockDefs.ts
// Métadonnées server-safe des blocs : AUCUN import React/JSX/lucide ici.
// Ce module est la source unique des données de blocs (type, label, category,
// description, defaultProps, schema, fields, container, initialChildren). Il est
// consommé :
//   - côté client par blockRegistry.tsx, qui ajoute icon / render / editor ;
//   - côté serveur par la route MCP (list_block_types / insert_block).
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { containerRules } from "@/lib/blockSchemas";
import type { ContainerRule } from "@/lib/blockSchemas";
import type { Block } from "@/types/CourseContent";

export interface FieldDef {
    key: string;
    label: string;
    type: "text" | "textarea" | "number" | "select" | "boolean" | "array-of-strings" | "image-upload";
    options?: string[];
    placeholder?: string;
    /** Si vrai, le champ accepte du markdown inline (**gras**, _em_, `code`, [lien](url)).
     *  Utilisé par DynamicPropsEditor pour router vers InlineTextEditor. */
    inlineMarkdown?: boolean;
}

export type BlockCategory = "Contenu" | "Structure" | "Listes" | "Code" | "Médias" | "Composants";

/** Moitié « données » d'un bloc (sans icône ni rendu React). */
export interface BlockDef {
    type: string;
    label: string;
    category: BlockCategory;
    /** À quoi sert le bloc et quand l'utiliser. Exposé via le MCP (list_block_types)
     *  pour guider l'IA dans le choix et la structuration des blocs. */
    description: string;
    defaultProps: Record<string, unknown>;
    schema: z.ZodTypeAny;
    fields: FieldDef[];
    /** Si true : pas de PropsPanel ; l'éditeur (client) est rendu inline. */
    noPropsPanel?: boolean;
    /** Clé d'une prop éditable directement dans le canvas via double-click. */
    inlineEditField?: string;
    /** Règle conteneur (depuis blockSchemas). Absent = feuille. */
    container?: ContainerRule;
    /** Enfants créés à l'instanciation depuis la palette. */
    initialChildren?: () => Block[];
}

export const blockDefs: BlockDef[] = [
    {
        type: "text",
        label: "Texte",
        category: "Contenu",
        description: "Paragraphe de texte courant. Accepte du markdown inline : **gras**, _italique_, `code`, [lien](url). Le bloc de base pour rédiger.",
        defaultProps: { content: "" },
        schema: z.object({ content: z.string().min(1) }),
        fields: [
            {
                key: "content",
                label: "Contenu",
                type: "textarea",
                inlineMarkdown: true,
                placeholder: "Markdown inline : **gras**, _italique_, `code`, [lien](url)",
            },
        ],
        inlineEditField: "content",
    },
    {
        type: "section",
        label: "Partie",
        category: "Structure",
        description: "Conteneur d'une grande partie de cours (rend un titre A-/B-/C- selon l'ordre). IMPORTANT : placez le contenu de la partie dans ses `children`, jamais en blocs frères.",
        defaultProps: { title: "" },
        schema: z.object({ title: z.string() }),
        fields: [
            { key: "title", label: "Titre", type: "text", placeholder: "Introduction" },
        ],
        container: containerRules["section"],
        initialChildren: () => [
            { id: uuidv4(), type: "text", props: { content: "" }, children: [] },
        ],
        inlineEditField: "title",
    },
    {
        type: "list",
        label: "Liste",
        category: "Listes",
        description: "Liste à puces (ordered:false) ou numérotée (ordered:true). Ne contient QUE des blocs `list-item` dans ses `children`.",
        defaultProps: { ordered: false },
        schema: z.object({ ordered: z.boolean() }),
        fields: [
            { key: "ordered", label: "Ordonnée", type: "boolean" },
        ],
        container: containerRules["list"],
        initialChildren: () => [
            { id: uuidv4(), type: "list-item", props: { text: "" }, children: [] },
        ],
    },
    {
        type: "list-item",
        label: "Élément de liste",
        category: "Listes",
        description: "Un élément d'une liste (markdown inline dans `text`). Doit être un enfant direct d'un bloc `list`.",
        defaultProps: { text: "" },
        schema: z.object({ text: z.string() }),
        fields: [
            { key: "text", label: "Texte", type: "text", inlineMarkdown: true },
        ],
        container: containerRules["list-item"],
        inlineEditField: "text",
    },
    {
        type: "columns",
        label: "Colonnes",
        category: "Structure",
        description: "Disposition multi-colonnes (grille de 12). Ne contient QUE des blocs `column` dans ses `children`. Pour mettre deux contenus côte à côte.",
        defaultProps: {},
        schema: z.object({}),
        fields: [],
        container: containerRules["columns"],
        initialChildren: () => [
            { id: uuidv4(), type: "column", props: { span: 6 }, children: [] },
            { id: uuidv4(), type: "column", props: { span: 6 }, children: [] },
        ],
    },
    {
        type: "column",
        label: "Colonne",
        category: "Structure",
        description: "Une colonne d'un bloc `columns` (largeur `span` : 3, 4, 6, 8 ou 9 sur 12). Mettez son contenu dans ses `children`.",
        defaultProps: { span: 6 },
        schema: z.object({ span: z.number() }),
        fields: [],
        container: containerRules["column"],
    },
    {
        type: "callout",
        label: "Encadré",
        category: "Composants",
        description: "Encadré pour mettre en valeur : note (variant:info), avertissement (warning), astuce (tip) ou rappel encadré (reminder). Contenu dans `children`.",
        defaultProps: { variant: "info", title: "" },
        schema: z.object({
            variant: z.enum(["info", "warning", "tip", "reminder"]),
            title: z.string().optional(),
        }),
        fields: [
            { key: "variant", label: "Type", type: "select", options: ["info", "warning", "tip", "reminder"] },
            { key: "title", label: "Titre", type: "text" },
        ],
        container: containerRules["callout"],
    },
    {
        type: "collapsible",
        label: "Bloc dépliable",
        category: "Composants",
        description: "Bloc repliable (accordéon), typiquement pour les prérequis ou un aparté optionnel. Contenu dans `children`.",
        defaultProps: { title: "À savoir pour ce cours" },
        schema: z.object({ title: z.string() }),
        fields: [
            { key: "title", label: "Titre", type: "text" },
        ],
        container: containerRules["collapsible"],
    },
    {
        type: "image-card",
        label: "Image",
        category: "Médias",
        description: "Image (via upload) avec légende optionnelle. `src` est l'URL de l'image uploadée.",
        defaultProps: { src: "", title: "" },
        schema: z.object({
            src: z.string().min(1),
            title: z.string().optional(),
        }),
        fields: [
            { key: "src", label: "Image", type: "image-upload" },
            { key: "title", label: "Titre / légende", type: "text" },
        ],
    },
    {
        type: "table",
        label: "Tableau",
        category: "Composants",
        description: "Tableau de données : `headers` (string[]) et `rows` (string[][]). Les cellules acceptent du markdown inline.",
        noPropsPanel: true,
        defaultProps: { headers: ["En-tête 1", "En-tête 2"], rows: [["", ""]] },
        schema: z.object({
            headers: z.array(z.string()),
            rows: z.array(z.array(z.string())),
        }),
        fields: [],
    },
    {
        type: "section-card",
        label: "Lien de section",
        category: "Composants",
        description: "Carte cliquable renvoyant vers une autre page/section (titre + lien `href` + description). Pour la navigation entre contenus.",
        defaultProps: { title: "", href: "", description: "" },
        schema: z.object({
            title: z.string().min(1),
            href: z.string().min(1),
            description: z.string().optional(),
        }),
        fields: [
            { key: "title", label: "Titre", type: "text" },
            { key: "href", label: "Lien", type: "text", placeholder: "/javascript/1-le-dom/cours" },
            { key: "description", label: "Description", type: "text" },
        ],
    },
    {
        type: "code",
        label: "Code",
        category: "Code",
        description: "Bloc de code coloré (choisir `language`). Options : `filename`, numéros de ligne, repli, lignes surlignées. Pour montrer un extrait de code.",
        defaultProps: { language: "javascript", code: "", filename: "", showLineNumbers: true, collapsible: false },
        schema: z.object({
            language: z.string(),
            code: z.string(),
            filename: z.string().optional(),
            showLineNumbers: z.boolean().optional(),
            collapsible: z.boolean().optional(),
            highlightLines: z.string().optional(),
        }),
        fields: [
            { key: "language", label: "Langage", type: "select", options: ["javascript", "typescript", "html", "css", "php", "sql", "json", "bash", "jsx", "tsx"] },
            { key: "code", label: "Code", type: "textarea", placeholder: "const x = 42;" },
            { key: "filename", label: "Nom de fichier", type: "text", placeholder: "app.js" },
            { key: "showLineNumbers", label: "Numéros de ligne", type: "boolean" },
            { key: "collapsible", label: "Repliable", type: "boolean" },
            { key: "highlightLines", label: "Lignes en surbrillance", type: "text", placeholder: "2,5-7" },
        ],
    },
    {
        type: "code-with-preview",
        label: "Code + aperçu",
        category: "Code",
        description: "Code HTML/CSS affiché avec son rendu live côte à côte (iframe sandboxée). Pour illustrer un résultat visuel.",
        defaultProps: { language: "html", code: "" },
        schema: z.object({
            language: z.string(),
            code: z.string(),
        }),
        fields: [
            { key: "language", label: "Langage", type: "select", options: ["html", "css"] },
            { key: "code", label: "Code", type: "textarea", placeholder: "<button>Cliquez</button>" },
        ],
    },
    {
        type: "diagram",
        label: "Diagramme",
        category: "Code",
        description: "Diagramme Mermaid (syntaxe dans `chart`), avec titre optionnel. Pour un schéma, un flux, un arbre.",
        defaultProps: { header: "", chart: "" },
        schema: z.object({
            header: z.string().optional(),
            chart: z.string(),
        }),
        fields: [
            { key: "header", label: "Titre", type: "text" },
            { key: "chart", label: "Diagramme (syntaxe Mermaid)", type: "textarea", placeholder: "graph LR\n    A --> B" },
        ],
    },
    {
        type: "download-file",
        label: "Fichier à télécharger",
        category: "Médias",
        description: "Bouton de téléchargement d'un fichier généré (`filename` + `code`). Pour fournir un fichier de départ à l'étudiant.",
        defaultProps: { language: "html", filename: "", code: "" },
        schema: z.object({
            language: z.string(),
            filename: z.string(),
            code: z.string(),
        }),
        fields: [
            { key: "language", label: "Langage", type: "select", options: ["html", "css", "javascript", "php", "sql", "json"] },
            { key: "filename", label: "Nom de fichier", type: "text", placeholder: "game.html" },
            { key: "code", label: "Contenu du fichier", type: "textarea" },
        ],
    },
    {
        type: "quote",
        label: "Citation",
        category: "Contenu",
        description: "Citation mise en exergue avec source optionnelle (markdown inline dans `text`).",
        defaultProps: { text: "", source: "" },
        schema: z.object({
            text: z.string(),
            source: z.string().optional(),
        }),
        fields: [
            {
                key: "text",
                label: "Citation",
                type: "textarea",
                inlineMarkdown: true,
                placeholder: "La simplicité est la sophistication suprême.",
            },
            { key: "source", label: "Source", type: "text", placeholder: "Léonard de Vinci" },
        ],
        inlineEditField: "text",
    },
    {
        type: "divider",
        label: "Séparateur",
        category: "Contenu",
        description: "Trait horizontal pour séparer visuellement deux blocs. Aucune prop.",
        defaultProps: {},
        schema: z.object({}),
        fields: [],
    },
];

const byType = new Map<string, BlockDef>(blockDefs.map((d) => [d.type, d]));

export function getBlockDef(type: string): BlockDef | undefined {
    return byType.get(type);
}

/** Instancie un nouveau bloc depuis sa définition (id, defaultProps, enfants
 *  initiaux pour les conteneurs). Server-safe. */
export function createBlockInstance(
    def: Pick<BlockDef, "type" | "defaultProps" | "container" | "initialChildren">
): Block {
    return {
        id: uuidv4(),
        type: def.type,
        props: { ...def.defaultProps },
        ...(def.container ? { children: def.initialChildren?.() ?? [] } : {}),
    };
}
