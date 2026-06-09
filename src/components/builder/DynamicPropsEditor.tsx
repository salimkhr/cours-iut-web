"use client";

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
import type { FieldDef } from "@/lib/blockRegistry";

interface DynamicPropsEditorProps {
    fields: FieldDef[];
    props: Record<string, unknown>;
    onChange: (props: Record<string, unknown>) => void;
}

export function DynamicPropsEditor({ fields, props, onChange }: DynamicPropsEditorProps) {
    function set(key: string, value: unknown) {
        onChange({ ...props, [key]: value });
    }

    return (
        <div className="flex flex-col gap-4">
            {fields.map((field) => {
                const value = props[field.key];

                if (field.type === "textarea") {
                    return (
                        <div key={field.key} className="flex flex-col gap-1">
                            <Label htmlFor={field.key}>{field.label}</Label>
                            <Textarea
                                id={field.key}
                                value={String(value ?? "")}
                                placeholder={field.placeholder}
                                onChange={(e) => set(field.key, e.target.value)}
                                rows={4}
                            />
                        </div>
                    );
                }

                if (field.type === "number") {
                    return (
                        <div key={field.key} className="flex flex-col gap-1">
                            <Label htmlFor={field.key}>{field.label}</Label>
                            <Input
                                id={field.key}
                                type="number"
                                value={String(value ?? "")}
                                placeholder={field.placeholder}
                                onChange={(e) => set(field.key, Number(e.target.value))}
                            />
                        </div>
                    );
                }

                if (field.type === "select" && field.options) {
                    return (
                        <div key={field.key} className="flex flex-col gap-1">
                            <Label htmlFor={field.key}>{field.label}</Label>
                            <Select
                                value={String(value ?? field.options[0])}
                                onValueChange={(v) => set(field.key, v)}
                            >
                                <SelectTrigger id={field.key}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
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
                        <div key={field.key} className="flex items-center gap-2">
                            <Switch
                                id={field.key}
                                checked={Boolean(value)}
                                onCheckedChange={(checked) => set(field.key, checked)}
                            />
                            <Label htmlFor={field.key}>{field.label}</Label>
                        </div>
                    );
                }

                if (field.type === "array-of-strings") {
                    const items = (value as string[] | undefined) ?? [];
                    return (
                        <div key={field.key} className="flex flex-col gap-1">
                            <Label>{field.label}</Label>
                            {items.map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input
                                        value={item}
                                        onChange={(e) => {
                                            const next = [...items];
                                            next[i] = e.target.value;
                                            set(field.key, next);
                                        }}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => set(field.key, items.filter((_, j) => j !== i))}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => set(field.key, [...items, ""])}
                            >
                                + Ajouter
                            </Button>
                        </div>
                    );
                }

                // Défaut : text
                return (
                    <div key={field.key} className="flex flex-col gap-1">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Input
                            id={field.key}
                            type="text"
                            value={String(value ?? "")}
                            placeholder={field.placeholder}
                            onChange={(e) => set(field.key, e.target.value)}
                        />
                    </div>
                );
            })}
        </div>
    );
}
