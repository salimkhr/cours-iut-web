"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import type { FieldDef } from "@/lib/blockRegistry";
import { ImageUploadField } from "@/components/builder/ImageUploadField";
import { LucideIconPicker } from "@/components/ui/LucideIconPicker";
import { CodeField } from "@/components/builder/CodeField";

interface DynamicPropsEditorProps {
    fields: FieldDef[];
    props: Record<string, unknown>;
    onChange: (props: Record<string, unknown>) => void;
    /** Filtre les types de champs affichés. Absent = tous les champs. */
    filterTypes?: Array<FieldDef["type"]>;
}

/**
 * Textarea à validation différée.
 *
 * Les champs longs (le code d'un bloc `code` / `slide-code`) écrivaient dans le
 * store à CHAQUE frappe. Chaque écriture re-rend le canvas entier, coloration
 * syntaxique comprise : sur quelques centaines de caractères le coût devient
 * quadratique et l'onglet se fige. On tamponne donc la saisie localement et on
 * ne remonte la valeur qu'à la sortie du champ.
 */
function BufferedTextarea({
    id, value, placeholder, rows, className, onCommit,
}: {
    id: string;
    value: string;
    placeholder?: string;
    rows: number;
    className?: string;
    onCommit: (value: string) => void;
}) {
    const [draft, setDraft] = useState(value);
    const focused = useRef(false);

    // Resynchronise sur les changements venus d'ailleurs (autre bloc
    // sélectionné, undo…), sans jamais écraser une saisie en cours.
    useEffect(() => {
        if (!focused.current) setDraft(value);
    }, [value]);

    return (
        <Textarea
            id={id}
            value={draft}
            placeholder={placeholder}
            rows={rows}
            className={className}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => { focused.current = true; }}
            onBlur={() => {
                focused.current = false;
                if (draft !== value) onCommit(draft);
            }}
        />
    );
}

const labelCls = "text-sm font-semibold text-brand-dark dark:text-bridge-200";
const inputCls = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-1 focus-visible:ring-bridge-500/50";

export function DynamicPropsEditor({ fields, props, onChange, filterTypes }: DynamicPropsEditorProps) {
    const visibleFields = filterTypes ? fields.filter((f) => filterTypes.includes(f.type)) : fields;

    function set(key: string, value: unknown) {
        onChange({ ...props, [key]: value });
    }

    return (
        <div className="flex flex-col gap-4">
            {visibleFields.map((field) => {
                const value = props[field.key];

                if (field.type === "textarea") {
                    return (
                        <div key={field.key} className="flex flex-col gap-1.5">
                            <Label htmlFor={field.key} className={labelCls}>{field.label}</Label>
                            <BufferedTextarea
                                id={field.key}
                                value={String(value ?? "")}
                                placeholder={field.placeholder}
                                rows={field.rows ?? 4}
                                onCommit={(v) => set(field.key, v)}
                                className={`${inputCls} h-auto resize-none`}
                            />
                        </div>
                    );
                }

                if (field.type === "number") {
                    return (
                        <div key={field.key} className="flex flex-col gap-1.5">
                            <Label htmlFor={field.key} className={labelCls}>{field.label}</Label>
                            <Input
                                id={field.key}
                                type="number"
                                value={String(value ?? "")}
                                placeholder={field.placeholder}
                                onChange={(e) => set(field.key, Number(e.target.value))}
                                className={inputCls}
                            />
                        </div>
                    );
                }

                if (field.type === "select" && field.options) {
                    return (
                        <div key={field.key} className="flex flex-col gap-1.5">
                            <Label htmlFor={field.key} className={labelCls}>{field.label}</Label>
                            <Select
                                // `undefined`, jamais `field.options[0]` : sur un champ non
                                // renseigné (bloc existant créé avant ce champ, ou auteur
                                // qui n'a pas encore choisi), afficher la première option
                                // ferait croire que le champ est rempli — trompeur depuis
                                // que certains champs deviennent obligatoires selon le
                                // contenu d'un autre (ex. secondaryLanguage exigé dès que
                                // secondaryCode est rempli). Le champ vide affiche
                                // honnêtement son placeholder.
                                value={value == null || value === "" ? undefined : String(value)}
                                onValueChange={(v) => set(field.key, v)}
                            >
                                <SelectTrigger id={field.key} className={inputCls}>
                                    <SelectValue placeholder={field.placeholder ?? "—"}/>
                                </SelectTrigger>
                                <SelectContent className="bg-bridge-50 dark:bg-bridge-900 border-bridge-400/40 dark:border-bridge-500/40">
                                    {field.options.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    );
                }

                if (field.type === "boolean") {
                    return (
                        <div key={field.key} className="flex items-center gap-2.5">
                            <Switch
                                id={field.key}
                                checked={Boolean(value)}
                                onCheckedChange={(checked) => set(field.key, checked)}
                                className="data-[state=checked]:bg-module"
                            />
                            <Label htmlFor={field.key} className={labelCls}>{field.label}</Label>
                        </div>
                    );
                }

                if (field.type === "array-of-strings") {
                    const items = (value as string[] | undefined) ?? [];
                    return (
                        <div key={field.key} className="flex flex-col gap-1.5">
                            <Label className={labelCls}>{field.label}</Label>
                            {items.map((item, i) => (
                                <div key={i} className="flex gap-1.5">
                                    <Input
                                        value={item}
                                        onChange={(e) => {
                                            const next = [...items];
                                            next[i] = e.target.value;
                                            set(field.key, next);
                                        }}
                                        className={inputCls}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0 shrink-0 border-bridge-300/60 dark:border-bridge-600/40 text-bridge-500 dark:text-bridge-400 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                        onClick={() => set(field.key, items.filter((_, j) => j !== i))}
                                        aria-label="Supprimer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => set(field.key, [...items, ""])}
                                className="h-7 text-xs gap-1.5 border-bridge-300/60 dark:border-bridge-600/40 text-bridge-600 dark:text-bridge-400 hover:border-brand-primary/40 hover:text-brand-primary hover:bg-brand-primary/5"
                            >
                                <Plus className="w-3 h-3" /> Ajouter
                            </Button>
                        </div>
                    );
                }

                if (field.type === "lucide-icon") {
                    return (
                        <div key={field.key} className="flex flex-col gap-1.5">
                            <Label className={labelCls}>{field.label}</Label>
                            <LucideIconPicker
                                value={String(value ?? "")}
                                onChange={(name) => set(field.key, name)}
                            />
                        </div>
                    );
                }

                if (field.type === "code") {
                    const language = field.language ?? String(props[field.languageFrom ?? ""] ?? "text");
                    return (
                        <CodeField
                            key={field.key}
                            id={field.key}
                            label={field.label}
                            value={String(value ?? "")}
                            language={language}
                            rows={field.rows}
                            placeholder={field.placeholder}
                            onChange={(v) => set(field.key, v)}
                        />
                    );
                }

                if (field.type === "image-upload") {
                    return (
                        <ImageUploadField
                            key={field.key}
                            value={String(props[field.key] ?? "")}
                            onChange={(url) => set(field.key, url)}
                            label={field.label}
                        />
                    );
                }

                // Défaut : text
                return (
                    <div key={field.key} className="flex flex-col gap-1.5">
                        <Label htmlFor={field.key} className={labelCls}>{field.label}</Label>
                        <Input
                            id={field.key}
                            type="text"
                            value={String(value ?? "")}
                            placeholder={field.placeholder}
                            onChange={(e) => set(field.key, e.target.value)}
                            className={inputCls}
                        />
                    </div>
                );
            })}
        </div>
    );
}
