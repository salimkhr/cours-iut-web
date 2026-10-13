'use client';

import React, {useState} from 'react';
import BaseCard from "@/components/Cards/BaseCard";
import {CheckIcon, ClipboardCopyIcon, DownloadIcon} from "lucide-react";
import {SyntaxHighlighter, normalizeLanguage, courseCodeLight} from '@/lib/syntaxHighlighter';
import {Button} from "@/components/ui/button";
import Module from "@/types/Module";
import {cn} from "@/lib/utils";
import {buildPreviewDocument} from "@/lib/previewDocument";

interface CodeCardProps {
    title: string;
    description: string;
    language?: string;
    code: string;
    className?: string;
    showLineNumbers?: boolean;
    filename?: string;
    currentModule?: Module;
    inputElement?: React.ReactNode;
}

export default function InputCard({
                                      title,
                                      description,
                                      language = "html",
                                      code,
                                      className,
                                      showLineNumbers = true,
                                      filename,
                                      currentModule,
                                      inputElement
                                  }: CodeCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const getMimeType = (language: string): string => {
        switch (language.toLowerCase()) {
            case "html":
                return "text/html";
            case "css":
                return "text/css";
            case "js":
            case "javascript":
                return "application/javascript";
            case "json":
                return "application/json";
            case "ts":
            case "typescript":
                return "application/typescript";
            case "php":
                return "application/x-httpd-php";
            case "txt":
            default:
                return "text/plain";
        }
    };

    const handleDownload = () => {
        const mimeType = getMimeType(language);
        const blob = new Blob([code], {type: `${mimeType};charset=utf-8`});
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = filename ?? `code.${language}`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const headerCard = (
        <>
            <div className="flex items-center gap-2">
                <strong className="text-md font-semibold text-white">{title}</strong>
                <span className="text-xs text-white/60 font-mono">{language.toUpperCase()}</span>
            </div>
            <div className="flex gap-1">
                {filename && (
                    <Button
                        variant="ghost"
                        onClick={handleDownload}
                        className="flex items-center gap-2 text-white hover:bg-white/10"
                    >
                        <DownloadIcon className="w-4 h-4"/>
                        {filename}
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-white hover:bg-white/10"
                >
                    {copied ? <CheckIcon className="w-4 h-4"/> : <ClipboardCopyIcon className="w-4 h-4"/>}
                    {copied ? 'Copié' : 'Copier'}
                </Button>
            </div>
        </>
    );

    const isHtml = language.trim().toLowerCase() === "html";
    const hasHiddenInput = isHtml && /<input\b[^>]*\btype\s*=\s*["']hidden["']/i.test(code);
    const previewDoc = isHtml
        ? buildPreviewDocument({
            language: "html",
            code,
            preview: `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><!-- @edit:html -->${hasHiddenInput ? '<p style="color:#64748b;font:0.875rem system-ui;margin:1rem 0">Ce champ n’a pas de rendu visible.</p>' : ""}</body></html>`,
        })
        : null;

    const codeContent = (
        <div className="rounded-md border border-bridge-300/60 overflow-hidden bg-bridge-50">
            <SyntaxHighlighter
                language={normalizeLanguage(language)}
                style={courseCodeLight}
                customStyle={{
                    margin: 0,
                    fontSize: '0.875rem',
                    lineHeight: '1.5rem',
                    background: 'transparent',
                }}
                wrapLongLines={true}
                showLineNumbers={showLineNumbers}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );

    const content = (
        <div className="space-y-4">
            {description && (
                <p className="text-sm text-gray-600 text-left">{description}</p>
            )}

            {/* Fond et bordure teintés : le #fafafa / gray-200 d'origine posait
                une surface froide au milieu du corpus crème. */}
            {previewDoc ? (
                <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:items-start">
                    {codeContent}
                    <div className="min-w-0 overflow-hidden rounded-md border border-bridge-300/60 bg-white dark:border-bridge-600/50">
                        <iframe
                            srcDoc={previewDoc.html}
                            sandbox={previewDoc.needsScripts ? "allow-scripts allow-modals" : ""}
                            title={`Aperçu HTML de ${title}`}
                            className="block min-h-32 w-full border-0"
                        />
                    </div>
                </div>
            ) : codeContent}

            {inputElement && (
                <div>
                    {inputElement}
                </div>
            )}
        </div>
    );

    return (
        <div className={cn("course-code-card my-8 sm:my-10", className)}>
            <BaseCard
                header={headerCard}
                content={content}
                withMarge={true}
                withHover={false}
                withLed={false}
                currentModule={currentModule}
            />
        </div>
    );
}
