"use client";

import React from "react";
import type {Block} from "@/types/CourseContent";
import {renderInline} from "@/lib/inlineMarkdown";
import {SlideCode} from "@/components/Slides/ui/SlideCode";
import {SlideDiagram} from "@/components/Slides/ui/SlideDiagram";
import {SlideList, SlideListItem} from "@/components/Slides/ui/SlideList";
import {SlideNote} from "@/components/Slides/ui/SlideNote";
import {SlideText} from "@/components/Slides/ui/SlideText";
import {SlideTable} from "@/components/Slides/ui/SlideTable";
import {SlideImage} from "@/components/Slides/ui/SlideImage";
import {SlideCodeWithPreview} from "@/components/Slides/ui/SlideCodeWithPreview";

const slideColumnSpanClass: Record<number, string> = {
    3: "md:col-span-3",
    4: "md:col-span-4",
    6: "md:col-span-6",
    8: "md:col-span-8",
    9: "md:col-span-9",
};

interface SlideBlockItemProps {
    block: Block;
    /** Enveloppe optionnelle des blocs imbriqués (items de liste, contenu de
     *  colonne). Le player public ne la passe pas ; le builder s'en sert pour
     *  rendre ces blocs sélectionnables et éditables. */
    renderNested?: (child: Block, parent: Block, index: number) => React.ReactNode;
}

export function SlideBlockItem({block, renderNested}: SlideBlockItemProps) {
    switch (block.type) {
        case "slide-text":
            return (
                <SlideText>
                    {renderInline(String(block.props.content ?? ""))}
                </SlideText>
            );
        case "slide-code":
            return (
                <SlideCode
                    language={String(block.props.language ?? "javascript")}
                    highlight={block.props.highlight ? String(block.props.highlight) : undefined}
                >
                    {String(block.props.code ?? "")}
                </SlideCode>
            );
        case "slide-list":
            return (
                <SlideList ordered={Boolean(block.props.ordered)}>
                    {(block.children ?? []).map((item, i) => (
                        <SlideListItem key={item.id}>
                            {renderNested
                                ? renderNested(item, block, i)
                                : renderInline(String(item.props.text ?? ""))}
                        </SlideListItem>
                    ))}
                </SlideList>
            );
        // Rendu d'un item isolé : utilisé quand l'appelant enveloppe lui-même
        // les items (builder), la puce venant du <SlideListItem> parent.
        case "slide-list-item":
            return <>{renderInline(String(block.props.text ?? ""))}</>;
        case "slide-note":
            return <SlideNote>{String(block.props.content ?? "")}</SlideNote>;
        case "slide-table":
            return (
                <SlideTable
                    headers={(block.props.headers as string[]) ?? []}
                    rows={(block.props.rows as string[][]) ?? []}
                />
            );
        case "slide-image":
            return (
                <SlideImage
                    src={String(block.props.src ?? "")}
                    title={block.props.title ? String(block.props.title) : undefined}
                    alt={String(block.props.alt ?? "")}
                />
            );
        case "slide-code-with-preview":
            return (
                <SlideCodeWithPreview
                    language={String(block.props.language ?? "html")}
                    code={String(block.props.code ?? "")}
                    secondaryLanguage={block.props.secondaryLanguage ? String(block.props.secondaryLanguage) : undefined}
                    secondaryCode={block.props.secondaryCode ? String(block.props.secondaryCode) : undefined}
                    preview={block.props.preview ? String(block.props.preview) : undefined}
                    highlight={block.props.highlight ? String(block.props.highlight) : undefined}
                    secondaryHighlight={block.props.secondaryHighlight ? String(block.props.secondaryHighlight) : undefined}
                />
            );
        case "diagram":
            return <SlideDiagram chart={String(block.props.chart ?? "")}/>;
        case "columns":
            return (
                <div className="grid min-h-0 grid-cols-1 md:grid-cols-12 gap-6">
                    {(block.children ?? []).map((col) => {
                        const span = Number(col.props.span) || 6;
                        const spanClass = slideColumnSpanClass[span] ?? "md:col-span-6";

                        return (
                            <div
                                key={col.id}
                                className={`${spanClass} flex flex-col gap-4 min-w-0 min-h-0`}
                            >
                                {(col.children ?? []).map((inner, i) => (
                                    renderNested
                                        ? <React.Fragment key={inner.id}>{renderNested(inner, col, i)}</React.Fragment>
                                        : <SlideBlockItem key={inner.id} block={inner}/>
                                ))}
                            </div>
                        );
                    })}
                </div>
            );
        default:
            return null;
    }
}
