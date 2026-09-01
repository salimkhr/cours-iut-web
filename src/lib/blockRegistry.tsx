'use client';

import React from "react";
import { cn } from "@/lib/utils";
import Text from "@/components/ui/Text";
import Heading from "@/components/ui/Heading";
import { List, ListItem } from "@/components/ui/List";
import ImageCard from "@/components/Cards/ImageCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { renderInline } from "@/lib/inlineMarkdown";
import CodeCard from "@/components/Cards/CodeCard";
import InputCard from "@/components/Cards/InputCard";
import CodeWithPreviewCard from "@/components/Cards/CodeWithPreviewCard";
import dynamic from "next/dynamic";
import DiagramSkeleton from "@/components/Cards/DiagramSkeleton";
import { DownloadCodeButton } from "@/components/DownloadCodeButton";
import {
    Info, TriangleAlert, Lightbulb,
    AlignLeft, Layers, List as ListIcon, Dot,
    LayoutPanelLeft, PanelLeft, MessageSquare, ChevronsUpDown,
    Image, Table as TableIcon, Link, Code, Eye,
    Share2, Download, Quote, Minus,
    Monitor, StickyNote, FileCode, Milestone,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CourseReminder from "@/components/CourseReminder";
import CoursePrerequisites from "@/components/CoursePrerequisites";
import { COL_SPAN_CLASS } from "@/lib/blockSchemas";
import { SlideText } from "@/components/Slides/ui/SlideText";
import { SlideList, SlideListItem } from "@/components/Slides/ui/SlideList";
import { SlideNote } from "@/components/Slides/ui/SlideNote";
import { SlideTable } from "@/components/Slides/ui/SlideTable";
import { SlideImage } from "@/components/Slides/ui/SlideImage";
import { SlideCodeWithPreview } from "@/components/Slides/ui/SlideCodeWithPreview";
import { SlideTransition } from "@/components/Slides/ui/SlideTransition";
import { blockDefs, getBlockDef, createBlockInstance } from "@/lib/blockDefs";
import type { BlockDef, FieldDef, BlockCategory } from "@/lib/blockDefs";
import type Module from "@/types/Module";
import { DynamicLucideIcon } from "@/components/ui/DynamicLucideIcon";

import type { BlockRenderProps, BlockEditorProps } from "@/types/blocks";

// Réexports pour compatibilité avec les imports existants.
export type { FieldDef, BlockCategory };
export { createBlockInstance };

// Mermaid pèse plusieurs centaines de Ko et ne concerne qu'une minorité de blocs :
// on ne le charge que si un bloc "diagram" est effectivement rendu.
const DiagramCard = dynamic(() => import("@/components/Cards/DiagramCard"), {
    ssr: false,
    loading: () => <DiagramSkeleton/>,
});

// Éditeur réservé au builder admin : jamais rendu côté étudiant.
const TableBlockEditor: React.ComponentType<BlockEditorProps> = dynamic(
    () => import("@/components/builder/TableBlockEditor").then((m) => m.TableBlockEditor),
    { ssr: false },
);

// Définis dans src/types/blocks.ts ; réexportés ici pour ne casser aucun
// import existant.
export type { BlockRenderProps, BlockEditorProps } from "@/types/blocks";

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
        render: ({ title, children, depth, sectionIndex, projectRef, currentModule }: BlockRenderProps) => {
            const d = Number(depth) || 0;
            const level = Math.min(2 + d, 4) as 2 | 3 | 4;
            const idx = Number(sectionIndex ?? 0);
            // Plan scolaire A / 1 / a : chaque profondeur a sa propre notation,
            // ce qui situe une sous-sous-partie sans composer avec son parent.
            // Auparavant les niveaux 1 et 2 partageaient « 1, 2, 3 » et les
            // auteurs écrivaient « 2.1 » à la main dans le titre pour compenser.
            const badgeLabel = d === 0
                ? String.fromCharCode(65 + idx)   // A, B, C…
                : d === 1
                  ? String(idx + 1)               // 1, 2, 3…
                  : String.fromCharCode(97 + idx); // a, b, c…
            const mod = currentModule as Module | undefined;
            const icon = mod?.projectIcon ?? "";
            const showBadge = Boolean(projectRef) && icon.length > 0;
            return (
                <section
                    className="course-block-section flex flex-col gap-4 lg:gap-5"
                    data-depth={d}
                >
                    <div className={cn("course-section-head", d === 0 && "course-section-head--top")}>
                        <span
                            className={cn("course-section-badge", d > 0 && "course-section-badge--sub")}
                            aria-hidden="true"
                        >
                            {badgeLabel}
                        </span>
                        <div className="course-section-headline">
                            <Heading level={level}>{String(title ?? "")}</Heading>
                            {showBadge && (
                                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                    <DynamicLucideIcon name={icon} size={12} />
                                    Projet commun
                                </span>
                            )}
                        </div>
                    </div>
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
        render: ({ variant, title, children, currentModule }: BlockRenderProps) => {
            const v = String(variant ?? "info");
            if (v === "reminder") {
                return (
                    <CourseReminder title={title ? String(title) : undefined} currentModule={currentModule as Module | undefined}>
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
        render: ({ src, title, alt, currentModule }: BlockRenderProps) => {
            // `<Image src="">` déclenche une erreur React et fait recharger la
            // page entière : tant qu'aucune image n'est choisie, on rend un
            // cadre d'attente à la place du composant public.
            const url = String(src ?? "").trim();
            if (!url) {
                return (
                    <div className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-bridge-300 px-4 py-6 text-sm text-bridge-600 dark:border-bridge-600 dark:text-bridge-300">
                        Aucune image sélectionnée
                    </div>
                );
            }
            return (
                <ImageCard src={url} title={title ? String(title) : undefined} alt={String(alt ?? "")} currentModule={currentModule as Module | undefined} />
            );
        },
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
    "input-card": {
        icon: FileCode,
        render: ({ title, description, language, code, filename, currentModule }: BlockRenderProps) => (
            <InputCard
                title={String(title ?? "")}
                description={String(description ?? "")}
                language={String(language ?? "html")}
                code={String(code ?? "")}
                filename={filename ? String(filename) : undefined}
                currentModule={currentModule as Module | undefined}
            />
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
        render: ({ language, code, filename, title, showLineNumbers, collapsible, highlightLines, currentModule }: BlockRenderProps) => (
            <CodeCard
                language={String(language ?? "javascript")}
                filename={filename ? String(filename) : undefined}
                title={title ? String(title) : undefined}
                currentModule={currentModule as Module | undefined}
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
        render: ({ language, code, secondaryLanguage, secondaryCode, preview, currentModule }: BlockRenderProps) => {
            const panels = [
                { language: String(language ?? "html"), code: String(code ?? "") },
                { language: String(secondaryLanguage ?? ""), code: String(secondaryCode ?? "") },
            ].filter((panel) => panel.code.length > 0);

            const previewValue = typeof preview === "string" ? preview.trim() : "";

            if (!previewValue) {
                if (panels.length <= 1) {
                    return (
                        <CodeCard language={panels[0]?.language ?? "html"} currentModule={currentModule as Module | undefined}>
                            {panels[0]?.code ?? ""}
                        </CodeCard>
                    );
                }
                return (
                    <CodeWithPreviewCard panels={panels} currentModule={currentModule as Module | undefined}/>
                );
            }

            return (
                <CodeWithPreviewCard
                    panels={panels}
                    sources={{
                        language: String(language ?? "html"),
                        code: String(code ?? ""),
                        secondaryLanguage: String(secondaryLanguage ?? ""),
                        secondaryCode: String(secondaryCode ?? ""),
                        preview: previewValue,
                    }}
                    currentModule={currentModule as Module | undefined}
                />
            );
        },
    },
    "diagram": {
        icon: Share2,
        render: ({ header, chart, currentModule }: BlockRenderProps) => (
            <DiagramCard header={header ? String(header) : undefined} chart={String(chart ?? "")} currentModule={currentModule as Module | undefined} />
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
    "slide-table": {
        icon: TableIcon,
        editor: TableBlockEditor,
        render: ({ headers, rows }: BlockRenderProps) => (
            <SlideTable
                headers={(headers as string[]) ?? []}
                rows={(rows as string[][]) ?? []}
            />
        ),
    },
    "slide-code-with-preview": {
        icon: Eye,
        render: ({ language, code, secondaryLanguage, secondaryCode, preview, highlight, secondaryHighlight }: BlockRenderProps) => (
            <SlideCodeWithPreview
                language={String(language ?? "html")}
                code={String(code ?? "")}
                secondaryLanguage={secondaryLanguage ? String(secondaryLanguage) : undefined}
                secondaryCode={secondaryCode ? String(secondaryCode) : undefined}
                preview={preview ? String(preview) : undefined}
                highlight={highlight ? String(highlight) : undefined}
                secondaryHighlight={secondaryHighlight ? String(secondaryHighlight) : undefined}
            />
        ),
    },
    "slide-image": {
        icon: Image,
        render: ({ src, title, alt }: BlockRenderProps) => {
            // Même garde que `image-card` : `<Image src="">` lève une erreur React et
            // recharge la page entière tant qu'aucune image n'est choisie.
            const url = String(src ?? "").trim();
            if (!url) {
                return (
                    <div className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-bridge-300 px-4 py-6 text-sm text-bridge-600 dark:border-bridge-600 dark:text-bridge-300">
                        Aucune image sélectionnée
                    </div>
                );
            }
            return (
                <SlideImage src={url} title={title ? String(title) : undefined} alt={String(alt ?? "")} />
            );
        },
    },
    "slide-transition": {
        icon: Milestone,
        render: ({ eyebrow, title, subtitle }: BlockRenderProps) => (
            <SlideTransition
                eyebrow={eyebrow ? String(eyebrow) : undefined}
                title={String(title ?? "")}
                subtitle={subtitle ? String(subtitle) : undefined}
            />
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
