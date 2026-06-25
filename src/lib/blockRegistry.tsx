'use client';

import React from "react";
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
import {
    Info, TriangleAlert, Lightbulb,
    AlignLeft, Layers, List as ListIcon, Dot,
    LayoutPanelLeft, PanelLeft, MessageSquare, ChevronsUpDown,
    Image, Table as TableIcon, Link, Code, Eye,
    Share2, Download, Quote, Minus,
    Monitor, StickyNote,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CourseReminder from "@/components/CourseReminder";
import CoursePrerequisites from "@/components/CoursePrerequisites";
import { COL_SPAN_CLASS } from "@/lib/blockSchemas";
import { TableBlockEditor } from "@/components/builder/TableBlockEditor";
import { SlideText } from "@/components/Slides/ui/SlideText";
import { SlideList, SlideListItem } from "@/components/Slides/ui/SlideList";
import { SlideNote } from "@/components/Slides/ui/SlideNote";
import { blockDefs, getBlockDef, createBlockInstance } from "@/lib/blockDefs";
import type { BlockDef, FieldDef, BlockCategory } from "@/lib/blockDefs";

// Réexports pour compatibilité avec les imports existants.
export type { FieldDef, BlockCategory };
export { createBlockInstance };

export interface BlockRenderProps {
    children?: React.ReactNode;
    [key: string]: unknown;
}

export interface BlockEditorProps {
    props: Record<string, unknown>;
    onChange: (props: Record<string, unknown>) => void;
}

/** Une définition complète = données server-safe (BlockDef) + parties React. */
export interface BlockDefinition extends BlockDef {
    icon?: React.ComponentType<{ className?: string }>;
    render: React.ComponentType<BlockRenderProps>;
    editor?: React.ComponentType<BlockEditorProps>;
}

/** Parties React par type (icône, rendu, éditeur custom). Fusionnées avec les
 *  métadonnées server-safe de blockDefs.ts. */
interface ClientPart {
    icon?: React.ComponentType<{ className?: string }>;
    render: React.ComponentType<BlockRenderProps>;
    editor?: React.ComponentType<BlockEditorProps>;
}

const clientParts: Record<string, ClientPart> = {
    "text": {
        icon: AlignLeft,
        render: ({ content }: BlockRenderProps) => (
            <Text>{renderInline(String(content ?? ""))}</Text>
        ),
    },
    "section": {
        icon: Layers,
        render: ({ title, children, depth, sectionIndex }: BlockRenderProps) => {
            const level = Math.min(2 + (Number(depth) || 0), 4) as 2 | 3 | 4;
            const idx = Number(sectionIndex ?? 0);
            const prefix = Number(depth) === 0
                ? String.fromCharCode(65 + idx) + " — "
                : String(idx + 1) + ". ";
            return (
                <section className="flex flex-col gap-6">
                    <Heading level={level}>{prefix}{String(title ?? "")}</Heading>
                    {children}
                </section>
            );
        },
    },
    "list": {
        icon: ListIcon,
        render: ({ ordered, children }: BlockRenderProps) => (
            <List ordered={Boolean(ordered)}>{children}</List>
        ),
    },
    "list-item": {
        icon: Dot,
        render: ({ text, children }: BlockRenderProps) => (
            <ListItem>
                {renderInline(String(text ?? ""))}
                {children}
            </ListItem>
        ),
    },
    "columns": {
        icon: LayoutPanelLeft,
        render: ({ children }: BlockRenderProps) => (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">{children}</div>
        ),
    },
    "column": {
        icon: PanelLeft,
        render: ({ span, children }: BlockRenderProps) => (
            <div className={`${COL_SPAN_CLASS[Number(span)] ?? "md:col-span-6"} flex flex-col gap-6 min-w-0`}>
                {children}
            </div>
        ),
    },
    "callout": {
        icon: MessageSquare,
        render: ({ variant, title, children }: BlockRenderProps) => {
            const v = String(variant ?? "info");
            if (v === "reminder") {
                return (
                    <CourseReminder title={title ? String(title) : undefined}>
                        {children}
                    </CourseReminder>
                );
            }
            const styles: Record<string, { cls: string; icon: React.ReactNode }> = {
                info: {
                    cls: "border-sky-500/40 bg-sky-50/60 dark:bg-sky-900/20 [&>svg]:text-sky-600",
                    icon: <Info className="h-4 w-4" />,
                },
                warning: {
                    cls: "border-amber-500/40 bg-amber-50/60 dark:bg-amber-900/20 [&>svg]:text-amber-600",
                    icon: <TriangleAlert className="h-4 w-4" />,
                },
                tip: {
                    cls: "border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-900/20 [&>svg]:text-emerald-600",
                    icon: <Lightbulb className="h-4 w-4" />,
                },
            };
            const style = styles[v] ?? styles.info;
            return (
                <Alert className={style.cls}>
                    {style.icon}
                    {Boolean(title) && <AlertTitle>{String(title)}</AlertTitle>}
                    <AlertDescription>{children}</AlertDescription>
                </Alert>
            );
        },
    },
    "collapsible": {
        icon: ChevronsUpDown,
        render: ({ title, children }: BlockRenderProps) => (
            <CoursePrerequisites title={String(title ?? "")}>
                {children}
            </CoursePrerequisites>
        ),
    },
    "image-card": {
        icon: Image,
        render: ({ src, title, alt }: BlockRenderProps) => (
            <ImageCard src={String(src ?? "")} title={title ? String(title) : undefined} alt={alt ? String(alt) : undefined} />
        ),
    },
    "table": {
        icon: TableIcon,
        editor: TableBlockEditor,
        render: ({ headers, rows }: BlockRenderProps) => (
            <Table>
                <TableHeader>
                    <TableRow>
                        {(headers as string[] ?? []).map((h, i) => (
                            <TableHead key={i}>{renderInline(h)}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(rows as string[][] ?? []).map((row, i) => (
                        <TableRow key={i}>
                            {row.map((cell, j) => (
                                <TableCell key={j}>{renderInline(cell)}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ),
    },
    "section-card": {
        icon: Link,
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
    "code": {
        icon: Code,
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
    "code-with-preview": {
        icon: Eye,
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
    "diagram": {
        icon: Share2,
        render: ({ header, chart }: BlockRenderProps) => (
            <DiagramCard header={header ? String(header) : undefined} chart={String(chart ?? "")} />
        ),
    },
    "download-file": {
        icon: Download,
        render: ({ language, filename, code }: BlockRenderProps) => (
            <DownloadCodeButton
                language={String(language ?? "html")}
                filename={String(filename ?? "fichier.txt")}
            >
                {String(code ?? "")}
            </DownloadCodeButton>
        ),
    },
    "quote": {
        icon: Quote,
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
    },
    "divider": {
        icon: Minus,
        render: () => (
            <hr className="border-t border-bridge-400/30 dark:border-bridge-500/25 my-2" />
        ),
    },
    "slide": {
        icon: Monitor,
        render: ({ title, children }: BlockRenderProps) => (
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 bg-primary/5">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-3">
                    Slide — {String(title ?? "")}
                </p>
                <div className="space-y-3">{children}</div>
            </div>
        ),
    },
    "slide-text": {
        icon: AlignLeft,
        render: ({ content }: BlockRenderProps) => (
            <SlideText>{renderInline(String(content ?? ""))}</SlideText>
        ),
    },
    "slide-code": {
        icon: Code,
        render: ({ language, code, highlight }: BlockRenderProps) => (
            <CodeCard
                language={String(language ?? "javascript")}
                highlightLines={highlight ? String(highlight) : undefined}
            >
                {String(code ?? "")}
            </CodeCard>
        ),
    },
    "slide-list": {
        icon: ListIcon,
        render: ({ ordered, children }: BlockRenderProps) => (
            <SlideList ordered={Boolean(ordered)}>{children}</SlideList>
        ),
    },
    "slide-list-item": {
        icon: Dot,
        render: ({ text }: BlockRenderProps) => (
            <SlideListItem>{renderInline(String(text ?? ""))}</SlideListItem>
        ),
    },
    "slide-note": {
        icon: StickyNote,
        render: ({ content }: BlockRenderProps) => (
            <SlideNote>{String(content ?? "")}</SlideNote>
        ),
    },
};

function MissingRender({ type }: { type: string }) {
    return (
        <div className="border border-dashed rounded p-3 text-sm text-muted-foreground">
            Rendu manquant pour le bloc : {type}
        </div>
    );
}

const blockDefinitions: BlockDefinition[] = blockDefs.map((d) => {
    const part = clientParts[d.type];
    return {
        ...d,
        icon: part?.icon,
        render: part?.render ?? (() => <MissingRender type={d.type} />),
        editor: part?.editor,
    };
});

const registry = new Map<string, BlockDefinition>(
    blockDefinitions.map((def) => [def.type, def])
);

export function getBlockDefinition(type: string): BlockDefinition | undefined {
    return registry.get(type);
}

export function getAllBlockDefinitions(): BlockDefinition[] {
    return blockDefinitions;
}

export default registry;

// getBlockDef (server-safe) reste accessible pour qui en aurait besoin côté client.
export { getBlockDef };
