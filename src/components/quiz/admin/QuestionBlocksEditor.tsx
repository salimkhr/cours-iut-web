"use client";

import {v4 as uuidv4} from "uuid";
import {ArrowDown, ArrowUp, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {DynamicPropsEditor} from "@/components/builder/DynamicPropsEditor";
import {createBlockInstance, getBlockDef} from "@/lib/blockDefs";
import {QUIZ_ALLOWED_BLOCK_TYPES} from "@/lib/schemas/quiz.schema";
import type {Block} from "@/types/CourseContent";

/** Blocs insérables à la racine : `list-item` n'existe que dans une liste. */
const ROOT_TYPES = QUIZ_ALLOWED_BLOCK_TYPES.filter((type) => type !== "list-item");

function insertable(parentType: string | null): string[] {
    if (parentType === null) return [...ROOT_TYPES];
    const rule = getBlockDef(parentType)?.container?.allowedChildren;
    if (!rule) return [];
    if (rule === "any") return [...ROOT_TYPES];
    return rule.filter((type) => (QUIZ_ALLOWED_BLOCK_TYPES as readonly string[]).includes(type));
}

function move<T>(items: T[], from: number, to: number): T[] {
    if (to < 0 || to >= items.length) return items;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

interface ListProps {
    blocks: Block[];
    parentType: string | null;
    onChange: (blocks: Block[]) => void;
    depth?: number;
}

function BlockList({blocks, parentType, onChange, depth = 0}: ListProps) {
    const types = insertable(parentType);

    const add = (type: string) => {
        const def = getBlockDef(type);
        if (def) onChange([...blocks, createBlockInstance(def)]);
    };

    const patch = (index: number, next: Block) => onChange(blocks.map((b, i) => (i === index ? next : b)));

    return (
        <div className="flex flex-col gap-3">
            {blocks.map((block, index) => {
                const def = getBlockDef(block.type);
                return (
                    <div key={block.id} className="rounded-lg border bg-card p-3 flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                {def?.label ?? block.type}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button type="button" variant="ghost" size="icon" aria-label="Monter le bloc"
                                        disabled={index === 0} onClick={() => onChange(move(blocks, index, index - 1))}>
                                    <ArrowUp className="size-4" aria-hidden="true"/>
                                </Button>
                                <Button type="button" variant="ghost" size="icon" aria-label="Descendre le bloc"
                                        disabled={index === blocks.length - 1}
                                        onClick={() => onChange(move(blocks, index, index + 1))}>
                                    <ArrowDown className="size-4" aria-hidden="true"/>
                                </Button>
                                <Button type="button" variant="ghost" size="icon" aria-label="Supprimer le bloc"
                                        onClick={() => onChange(blocks.filter((_, i) => i !== index))}>
                                    <Trash2 className="size-4" aria-hidden="true"/>
                                </Button>
                            </div>
                        </div>
                        {def && def.fields.length > 0 && (
                            <DynamicPropsEditor
                                fields={def.fields}
                                props={block.props}
                                onChange={(props) => patch(index, {...block, props})}
                            />
                        )}
                        {def?.container && (
                            <div className="border-l-2 border-border pl-3">
                                <BlockList
                                    blocks={block.children ?? []}
                                    parentType={block.type}
                                    depth={depth + 1}
                                    onChange={(children) => patch(index, {...block, children})}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
            {types.length > 0 && (
                <div className="flex items-center gap-2">
                    <Select value="" onValueChange={add}>
                        <SelectTrigger className="w-64" aria-label="Ajouter un bloc">
                            <Plus className="size-4" aria-hidden="true"/>
                            <SelectValue placeholder={depth === 0 ? "Ajouter un bloc à l'énoncé" : "Ajouter un sous-bloc"}/>
                        </SelectTrigger>
                        <SelectContent>
                            {types.map((type) => (
                                <SelectItem key={type} value={type}>{getBlockDef(type)?.label ?? type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}

export default function QuestionBlocksEditor({blocks, onChange}: {blocks: Block[]; onChange: (blocks: Block[]) => void}) {
    return <BlockList blocks={blocks} parentType={null} onChange={onChange}/>;
}

export function newTextBlock(): Block {
    return {id: uuidv4(), type: "text", props: {content: ""}};
}
