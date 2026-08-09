"use client";

import dynamic from "next/dynamic";
import type { BeforeMount, OnMount } from "@monaco-editor/react";
import { Label } from "@/components/ui/label";
import { useIsDark } from "@/hook/useIsDark";
import {
    MONACO_THEME_LIGHT,
    MONACO_THEME_DARK,
    courseMonacoLight,
    courseMonacoDark,
} from "@/lib/monacoTheme";

// Monaco n'est pas SSR-safe → import client only, même pattern que CodeEditorModal.
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeFieldProps {
    id?: string;
    label?: string;
    value: string;
    language: string;
    rows?: number;
    /** Exemple affiché tant que le champ est vide. Monaco le gère nativement
     *  (option `placeholder`, présente depuis 0.47 ; le projet est en 0.55). */
    placeholder?: string;
    onChange: (value: string) => void;
}

const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme(MONACO_THEME_LIGHT, courseMonacoLight);
    monaco.editor.defineTheme(MONACO_THEME_DARK, courseMonacoDark);
};

// Monaco garde une <textarea> cachée hors-écran pour capter la saisie clavier ;
// les navigateurs y appliquent leur correcteur orthographique (soulignement
// rouge) comme sur n'importe quel champ de texte. On le désactive au montage —
// c'est ce qui soulignait le code dans les <textarea> bruts qu'il remplace.
const handleMount: OnMount = (editor) => {
    editor.getDomNode()?.querySelector("textarea")?.setAttribute("spellcheck", "false");
};

/**
 * Champ de saisie de code coloré, réutilisable par tous les blocs du
 * panneau Propriétés qui éditent du code (`code`, `code-with-preview`…).
 * Remplace les <textarea> bruts — non colorés, soulignés par le correcteur
 * orthographique du navigateur — par Monaco, thémé via monacoTheme.ts pour
 * rester cohérent avec la coloration de lecture (codeTheme.ts / Prism).
 *
 * `data-code-field` / `data-language` / `data-placeholder` sur le conteneur :
 * Monaco se monte côté client (dynamic + ssr:false), invisible au rendu
 * statique — ce sont ces attributs que les tests peuvent vérifier.
 */
export function CodeField({ id, label, value, language, rows = 10, placeholder, onChange }: CodeFieldProps) {
    const isDark = useIsDark();
    const height = `${Math.max(rows, 4) * 19 + 16}px`;

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <Label htmlFor={id} className="text-sm font-semibold text-brand-dark dark:text-bridge-200">
                    {label}
                </Label>
            )}
            <div
                id={id}
                data-code-field
                data-language={language}
                data-placeholder={placeholder}
                className="overflow-hidden rounded border border-bridge-500/45 bg-bridge-100/60 dark:bg-bridge-800/60"
                style={{ height }}
            >
                <MonacoEditor
                    height="100%"
                    language={language}
                    value={value}
                    theme={isDark ? MONACO_THEME_DARK : MONACO_THEME_LIGHT}
                    beforeMount={handleBeforeMount}
                    onMount={handleMount}
                    onChange={(v) => onChange(v ?? "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        placeholder,
                    }}
                />
            </div>
        </div>
    );
}
