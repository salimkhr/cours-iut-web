'use client'
import React, {useState} from 'react';
import BaseCard from "@/components/Cards/BaseCard";
import {ClipboardCopyIcon, DownloadIcon} from "lucide-react";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {Button} from "@/components/ui/button";
import Module from "@/types/module";

interface CodeCardProps {
    language: string,
    children: string,
    className?: string,
    showLineNumbers?: boolean,
    filename?: string,
    currentModule?: Module
}

export default function CodeCard({language, children, showLineNumbers = true, filename, currentModule}: CodeCardProps) {
    const [copied, setCopied] = useState(false);

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
        link.download = filename ?? '';
        link.click();

        URL.revokeObjectURL(url);
    };

    const headerCard = (
        <>
            <span className="text-sm text-white font-mono">{language.toUpperCase()}</span>
            <div className="flex gap-1">
                {filename ?
                    <Button
                        variant="ghost"
                        onClick={handleDownload}
                        className="flex items-center gap-2 text-white">
                        <DownloadIcon className="w-4 h-4"/>
                        {filename}
                    </Button>
                    : null}
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
            <SyntaxHighlighter
                language={language}
                // style={github}
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