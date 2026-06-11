'use client';

import React from "react";
import { z } from "zod";
import Text from "@/components/ui/Text";
import Heading from "@/components/ui/Heading";
import { List, ListItem } from "@/components/ui/List";
import ImageCard from "@/components/Cards/ImageCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { renderInline } from "@/lib/inlineMarkdown";
import CodeCard from "@/components/Cards/CodeCard";
import CodeWithPreviewCard, { CodePanel, PreviewPanel } from "@/components/Cards/CodeWithPreviewCard";
import DiagramCard from "@/components/Cards/DiagramCard";
import { DownloadCodeButton } from "@/components/DownloadCodeButton";

export interface FieldDef {
    key: string;
    label: string;
    type: "text" | "textarea" | "number" | "select" | "boolean" | "array-of-strings";
    options?: string[];
    placeholder?: string;
    /** Si vrai, le champ accepte du markdown inline (**gras**, _em_, `code`, [lien](url)).
     *  Utilisé par DynamicPropsEditor pour router vers InlineTextEditor. */
    inlineMarkdown?: boolean;
}

export interface BlockRenderProps {
    [key: string]: unknown;
}

export interface BlockEditorProps {
    props: Record<string, unknown>;
    onChange: (props: Record<string, unknown>) => void;
}

export interface BlockDefinition {
    type: string;
    label: string;
    defaultProps: Record<string, unknown>;
    schema: z.ZodTypeAny;
    fields: FieldDef[];
    render: React.ComponentType<BlockRenderProps>;
    editor?: React.ComponentType<BlockEditorProps>;
    /** Clé d'une prop éditable directement dans le canvas via double-click.
     *  Doit correspondre à une entrée de `fields`. Le multiline/placeholder
     *  sont récupérés depuis ce FieldDef. */
    inlineEditField?: string;
}

const blockDefinitions: BlockDefinition[] = [
    {
        type: "text",
        label: "Texte",
        defaultProps: { content: "" },
        schema: z.object({
            content: z.string().min(1),
        }),
        fields: [
            {
                key: "content",
                label: "Contenu",
                type: "textarea",
                inlineMarkdown: true,
                placeholder: "Markdown inline : **gras**, _italique_, `code`, [lien](url)",
            },
        ],
        render: ({ content }: BlockRenderProps) => (
            <Text>{renderInline(String(content ?? ""))}</Text>
        ),
        inlineEditField: "content",
    },
    {
        type: "heading",
        label: "Titre",
        defaultProps: { level: 2, text: "" },
        schema: z.object({
            level: z.union([z.literal(2), z.literal(3)]),
            text: z.string().min(1),
        }),
        fields: [
            { key: "level", label: "Niveau", type: "select", options: ["2", "3"] },
            {
                key: "text",
                label: "Texte",
                type: "text",
                inlineMarkdown: true,
                placeholder: "Transformer un tableau avec `map`",
            },
        ],
        render: ({ level, text }: BlockRenderProps) => (
            <Heading level={Number(level) as 2 | 3}>{renderInline(String(text ?? ""))}</Heading>
        ),
        inlineEditField: "text",
    },
    {
        type: "list",
        label: "Liste",
        defaultProps: { ordered: false, items: [] },
        schema: z.object({
            ordered: z.boolean(),
            items: z.array(z.string()),
        }),
        fields: [
            { key: "ordered", label: "Ordonnée", type: "boolean" },
            { key: "items", label: "Éléments", type: "array-of-strings", inlineMarkdown: true },
        ],
        render: ({ ordered, items }: BlockRenderProps) => (
            <List ordered={Boolean(ordered)}>
                {(items as string[] ?? []).map((item, i) => (
                    <ListItem key={i}>{renderInline(item)}</ListItem>
                ))}
            </List>
        ),
    },
    {
        type: "image-card",
        label: "Image",
        defaultProps: { src: "", title: "" },
        schema: z.object({
            src: z.string().min(1),
            title: z.string().optional(),
        }),
        fields: [
            { key: "src", label: "URL de l'image", type: "text", placeholder: "/images/..." },
            { key: "title", label: "Titre / légende", type: "text" },
        ],
        render: ({ src, title }: BlockRenderProps) => (
            <ImageCard src={String(src ?? "")} title={title ? String(title) : undefined} />
        ),
    },
    {
        type: "table",
        label: "Tableau",
        defaultProps: { headers: [], rows: [] },
        schema: z.object({
            headers: z.array(z.string()),
            rows: z.array(z.array(z.string())),
        }),
        fields: [
            { key: "headers", label: "En-têtes (une par ligne)", type: "array-of-strings" },
        ],
        render: ({ headers, rows }: BlockRenderProps) => (
            <Table>
                <TableHeader>
                    <TableRow>
                        {(headers as string[] ?? []).map((h, i) => (
                            <TableHead key={i}>{h}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(rows as string[][] ?? []).map((row, i) => (
                        <TableRow key={i}>
                            {row.map((cell, j) => (
                                <TableCell key={j}>{cell}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ),
    },
    {
        type: "section-card",
        label: "Lien de section",
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
        render: ({ title, href, description }: BlockRenderProps) => (
            <a
                href={String(href ?? "")}
                style={{ textDecoration: "none" }}
                className="block p-4 border border-bridge-300/50 dark:border-bridge-600/30 rounded-xl bg-bridge-50 dark:bg-bridge-800/60 hover:bg-bridge-100 dark:hover:bg-bridge-700/60 transition-colors"
            >
                <strong className="font-semibold">
                    {String(title ?? "")}
                </strong>
                {Boolean(description) && (
                    <p className="text-sm text-bridge-600 dark:text-bridge-400 mt-1">
                        {String(description)}
                    </p>
                )}
            </a>
        ),
    },
    {
        type: "code",
        label: "Code",
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
        render: ({ language, code, filename, showLineNumbers, collapsible, highlightLines }: BlockRenderProps) => (
            <CodeCard
                language={String(language ?? "javascript")}
                filename={filename ? String(filename) : undefined}
                showLineNumbers={showLineNumbers !== false}
                collapsible={Boolean(collapsible)}
                highlightLines={highlightLines ? String(highlightLines) : undefined}
            >
                {String(code ?? "")}
            </CodeCard>
        ),
    },
    {
        type: "code-with-preview",
        label: "Code + aperçu",
        defaultProps: { language: "html", code: "" },
        schema: z.object({
            language: z.string(),
            code: z.string(),
        }),
        fields: [
            { key: "language", label: "Langage", type: "select", options: ["html", "css"] },
            { key: "code", label: "Code", type: "textarea", placeholder: "<button>Cliquez</button>" },
        ],
        render: ({ language, code }: BlockRenderProps) => (
            <CodeWithPreviewCard language={String(language ?? "html")}>
                <CodePanel>{String(code ?? "")}</CodePanel>
                <PreviewPanel>
                    {/* sandbox="" : aucun script, aucune navigation — le HTML vient de la base */}
                    <iframe
                        srcDoc={String(code ?? "")}
                        sandbox=""
                        title="Aperçu du code"
                        className="w-full min-h-40 border-0 bg-white"
                    />
                </PreviewPanel>
            </CodeWithPreviewCard>
        ),
    },
    {
        type: "diagram",
        label: "Diagramme",
        defaultProps: { header: "", chart: "" },
        schema: z.object({
            header: z.string().optional(),
            chart: z.string(),
        }),
        fields: [
            { key: "header", label: "Titre", type: "text" },
            { key: "chart", label: "Diagramme (syntaxe Mermaid)", type: "textarea", placeholder: "graph LR\n    A --> B" },
        ],
        render: ({ header, chart }: BlockRenderProps) => (
            <DiagramCard header={header ? String(header) : undefined} chart={String(chart ?? "")} />
        ),
    },
    {
        type: "download-file",
        label: "Fichier à télécharger",
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
        render: ({ language, filename, code }: BlockRenderProps) => (
            <DownloadCodeButton
                language={String(language ?? "html")}
                filename={String(filename ?? "fichier.txt")}
            >
                {String(code ?? "")}
            </DownloadCodeButton>
        ),
    },
    {
        type: "quote",
        label: "Citation",
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
        render: ({ text, source }: BlockRenderProps) => (
            <blockquote className="border-l-4 border-brand-primary/40 pl-4 py-1 italic text-bridge-700 dark:text-bridge-300">
                {renderInline(String(text ?? ""))}
                {Boolean(source) && (
                    <footer className="mt-1.5 text-sm not-italic text-bridge-500 dark:text-bridge-400">
                        — {String(source)}
                    </footer>
                )}
            </blockquote>
        ),
        inlineEditField: "text",
    },
    {
        type: "divider",
        label: "Séparateur",
        defaultProps: {},
        schema: z.object({}),
        fields: [],
        render: () => (
            <hr className="border-t border-bridge-400/30 dark:border-bridge-500/25 my-2" />
        ),
    },
];

const registry = new Map<string, BlockDefinition>(
    blockDefinitions.map(def => [def.type, def])
);

export function getBlockDefinition(type: string): BlockDefinition | undefined {
    return registry.get(type);
}

export function getAllBlockDefinitions(): BlockDefinition[] {
    return blockDefinitions;
}

export default registry;
