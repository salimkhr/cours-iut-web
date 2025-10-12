'use client'
import React, {useState} from 'react';
import BaseCard from "@/components/Cards/BaseCard";
import {ClipboardCopyIcon, DownloadIcon, MaximizeIcon, MinimizeIcon} from "lucide-react";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {oneLight} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {Button} from "@/components/ui/button";
import Module from "@/types/module";

interface CodeCardProps {
    language: string,
    children: string,
    className?: string,
    showLineNumbers?: boolean,
    filename?: string,
    currentModule?: Module,
    collapsible?: boolean, // Permet de réduire/agrandir
}

export default function CodeCard({
                                     language,
                                     children,
                                     showLineNumbers = true,
                                     filename,
                                     currentModule,
                                     collapsible = false
                                 }: CodeCardProps) {
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculer le nombre de lignes
    const lineCount = children.split('\n').length;
    const isLongFile = lineCount > 50; // Considéré comme long si > 50 lignes

    const handleCopy = () => {
        navigator.clipboard.writeText(children).then(() => {
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
            case "sql":
                return "application/sql";
            case "xml":
                return "application/xml";
            case "yaml":
            case "yml":
                return "application/x-yaml";
            case "txt":
            default:
                return "text/plain";
        }
    };

    const handleDownload = () => {
        const mimeType = getMimeType(language);
        const blob = new Blob([children], {type: `${mimeType};charset=utf-8`});
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = filename ?? `code.${language}`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const headerCard = (
        <>
            <div className="flex items-center gap-2">
                <span className="text-sm text-white font-mono">{language.toUpperCase()}</span>
                {isLongFile && (
                    <span className="text-xs text-white/70 font-mono">
                        {lineCount} lignes
                    </span>
                )}
            </div>
            <div className="flex gap-1">
                {collapsible && isLongFile && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleExpand}
                        className="flex items-center gap-2 text-white"
                        title={isExpanded ? "Masquer" : "Afficher"}
                    >
                        {isExpanded ? (
                            <>
                                <MinimizeIcon className="w-4 h-4"/>
                                Masquer
                            </>
                        ) : (
                            <>
                                <MaximizeIcon className="w-4 h-4"/>
                                Afficher
                            </>
                        )}
                    </Button>
                )}
                {filename && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownload}
                        className="flex items-center gap-2 text-white"
                        title="Télécharger le fichier"
                    >
                        <DownloadIcon className="w-4 h-4"/>
                        {filename}
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-white"
                >
                    <ClipboardCopyIcon className="w-4 h-4"/>
                    {copied ? 'Copié !' : 'Copier'}
                </Button>
            </div>
        </>
    );

    const content = (
        <div className="w-full h-full overflow-hidden">
            {collapsible && isLongFile && !isExpanded ? (
                // Version masquée - ne montre rien
                <div className="p-8 text-center text-gray-500">
                    <p className="text-sm">Code masqué ({lineCount} lignes)</p>
                    <p className="text-xs mt-2">Cliquez sur &quot;Afficher&rdquo; pour voir le contenu</p>
                </div>
            ) : (
                // Version complète
                <SyntaxHighlighter
                    language={language}
                    style={oneLight}
                    customStyle={{
                        margin: 0,
                        fontSize: '0.875rem',
                        lineHeight: '1.25rem',
                        height: '100%',
                    }}
                    wrapLongLines={true}
                    showLineNumbers={showLineNumbers}
                >
                    {children}
                </SyntaxHighlighter>
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