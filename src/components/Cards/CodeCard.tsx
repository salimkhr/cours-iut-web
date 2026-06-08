'use client';

import React, {useState} from 'react';
import BaseCard from "@/components/Cards/BaseCard";
import {ChevronDown, ChevronUp, ClipboardCopy, Download} from "lucide-react";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {oneDark, oneLight} from 'react-syntax-highlighter/dist/esm/styles/prism';
import Module from "@/types/Module";

export interface CodeCardProps {
    language: string;
    children: string;
    className?: string;
    showLineNumbers?: boolean;
    filename?: string;
    currentModule?: Module;
    collapsible?: boolean;
    highlightLines?: string;
}

export default function CodeCard({
                                     language,
                                     children,
                                     showLineNumbers = true,
                                     filename,
                                     currentModule,
                                     collapsible = false,
                                     highlightLines,
                                 }: CodeCardProps) {
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const lineCount = children.split('\n').length;
    const isLongFile = lineCount > 50;

    const handleCopy = () => {
        navigator.clipboard.writeText(children).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const getMimeType = (lang: string) => {
        switch (lang.toLowerCase()) {
            case "html": return "text/html";
            case "css": return "text/css";
            case "js":
            case "javascript": return "application/javascript";
            case "json": return "application/json";
            case "ts":
            case "typescript": return "application/typescript";
            case "php": return "application/x-httpd-php";
            case "sql": return "application/sql";
            case "xml": return "application/xml";
            case "yaml":
            case "yml": return "application/x-yaml";
            default: return "text/plain";
        }
    };

    const handleDownload = () => {
        const blob = new Blob([children], {type: `${getMimeType(language)};charset=utf-8`});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename ?? `code.${language}`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const headerCard = (
        <div className="flex items-center gap-3 w-full min-w-0">

            {/* Onglet fichier / langage */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded px-2.5 py-1 text-xs font-mono text-white/95 truncate max-w-[220px]">
                    {filename ?? `${language.toLowerCase()}`}
                </span>
                {filename && (
                    <span className="shrink-0 text-[10px] font-semibold tracking-[0.18em] uppercase text-white/45">
                        {language}
                    </span>
                )}
                {isLongFile && (
                    <span className="shrink-0 text-[10px] font-mono text-white/35">
                        {lineCount}L
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 shrink-0">
                {collapsible && isLongFile && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1.5 px-2 py-2 sm:py-1 min-h-[36px] rounded text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        title={isExpanded ? "Masquer" : "Afficher"}
                    >
                        {isExpanded
                            ? <><ChevronUp className="w-3.5 h-3.5"/><span className="hidden sm:inline">Masquer</span></>
                            : <><ChevronDown className="w-3.5 h-3.5"/><span className="hidden sm:inline">Afficher</span></>
                        }
                    </button>
                )}
                {filename && (
                    <button
                        onClick={handleDownload}
                        className="p-2 min-h-[36px] rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        title="Télécharger"
                        aria-label="Télécharger le fichier"
                    >
                        <Download className="w-3.5 h-3.5"/>
                    </button>
                )}
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-2 sm:py-1 min-h-[36px] rounded text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Copier le code"
                >
                    <ClipboardCopy className="w-3.5 h-3.5"/>
                    <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier'}</span>
                </button>
            </div>
        </div>
    );

    const parseHighlightLines = (highlightString: string) => {
        const ranges = highlightString.split(',').map(r => r.trim());
        const highlighted: number[] = [];
        ranges.forEach(range => {
            if (range.includes('-')) {
                const [start, end] = range.split('-').map(Number);
                for (let i = start; i <= end; i++) highlighted.push(i);
            } else {
                highlighted.push(Number(range));
            }
        });
        return highlighted;
    };

    const highlightedLines = highlightLines ? parseHighlightLines(highlightLines) : [];

    const sharedHighlighterProps = {
        language,
        customStyle: {
            margin: 0,
            fontSize: '0.875rem',
            lineHeight: '1.6',
            height: 'auto',
            borderRadius: '0',
            background: 'transparent',
        },
        wrapLines: true,
        lineProps: (lineNumber: number) => {
            const style: React.CSSProperties = {display: 'block', width: '100%'};
            const isHighlighted = highlightedLines.includes(lineNumber);
            if (highlightedLines.length > 0 && !isHighlighted) {
                style.opacity = 0.4;
            }
            return {style};
        },
        wrapLongLines: true,
        showLineNumbers,
    };

    const content = (
        <div className="w-full overflow-x-auto">
            {collapsible && isLongFile && !isExpanded ? (
                <div className="py-10 text-center">
                    <p className="text-sm font-mono text-bridge-500 dark:text-bridge-400">
                        {lineCount} lignes masquées
                    </p>
                    <p className="text-xs mt-1 text-bridge-400 dark:text-bridge-500">
                        Cliquez sur &quot;Afficher&rdquo; pour voir le contenu
                    </p>
                </div>
            ) : (
                <>
                    <div className="block dark:hidden">
                        <SyntaxHighlighter style={oneLight} {...sharedHighlighterProps}>
                            {children}
                        </SyntaxHighlighter>
                    </div>
                    <div className="hidden dark:block">
                        <SyntaxHighlighter style={oneDark} {...sharedHighlighterProps}>
                            {children}
                        </SyntaxHighlighter>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className="my-8">
            <BaseCard
                header={headerCard}
                content={content}
                withMarge={false}
                withHover={false}
                withLed={false}
                currentModule={currentModule}
            />
        </div>
    );
}
