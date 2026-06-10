'use client';

import React from "react";
import { z } from "zod";
import Text from "@/components/ui/Text";
import Heading from "@/components/ui/Heading";
import { List, ListItem } from "@/components/ui/List";
import ImageCard from "@/components/Cards/ImageCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface FieldDef {
    key: string;
    label: string;
    type: "text" | "textarea" | "number" | "select" | "boolean" | "array-of-strings";
    options?: string[];
    placeholder?: string;
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
}

const blockDefinitions: BlockDefinition[] = [
    {
        type: "text",
        label: "Texte",
        defaultProps: { content: "", strong: [] },
        schema: z.object({
            content: z.string().min(1),
            strong: z.array(z.string()).optional(),
        }),
        fields: [
            { key: "content", label: "Contenu", type: "textarea" },
            { key: "strong", label: "Parties en gras", type: "array-of-strings" },
        ],
        render: ({ content }: BlockRenderProps) => (
            <Text>{String(content ?? "")}</Text>
        ),
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
            { key: "text", label: "Texte", type: "text" },
        ],
        render: ({ level, text }: BlockRenderProps) => (
            <Heading level={Number(level) as 2 | 3}>{String(text ?? "")}</Heading>
        ),
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
            { key: "items", label: "Éléments", type: "array-of-strings" },
        ],
        render: ({ ordered, items }: BlockRenderProps) => (
            <List ordered={Boolean(ordered)}>
                {(items as string[] ?? []).map((item, i) => (
                    <ListItem key={i}>{item}</ListItem>
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
        type: "named-component",
        label: "Composant interactif",
        defaultProps: { name: "" },
        schema: z.object({
            name: z.string().min(1),
        }),
        fields: [
            { key: "name", label: "Nom du composant", type: "text", placeholder: "ColorClickableBox" },
        ],
        // Le render réel utilise namedComponents — voir BlockRenderer.tsx
        render: ({ name }: BlockRenderProps) => (
            <div className="border border-dashed rounded p-4 text-muted-foreground text-sm">
                ⚡ {String(name ?? "")}
            </div>
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
