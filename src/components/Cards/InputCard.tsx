'use client';

import React, {useState} from 'react';
import BaseCard from "@/components/Cards/BaseCard";
import {ClipboardCopyIcon, DownloadIcon} from "lucide-react";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {Button} from "@/components/ui/button";
import {Module} from "@/types/module";

interface CodeCardProps {
    title: string;
    description: string;
    language: string;
    children: string;
    className?: string;
    showLineNumbers?: boolean;
    filename?: string;
    currentModule?: Module;
    inputElement?: React.ReactNode;
}

export default function InputCard({
                                      title,
                                      description,
                                      language,
                                      children,
                                      showLineNumbers = true,
                                      filename,
                                      currentModule,
                                      inputElement
                                  }: CodeCardProps) {
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
        link.download = filename ?? `code.${language}`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const headerCard = (
        <>
            <div className="flex items-center gap-2">
                <h3 className="text-md font-semibold text-white">{title}</h3>
                <span className="text-sm text-white/70 font-mono">{language.toUpperCase()}</span>
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
                    <ClipboardCopyIcon className="w-4 h-4"/>
                    {copied ? 'Copié !' : 'Copier'}
                </Button>
            </div>
        </>
    );

    const content = (
        <div className="space-y-4">
            <p className="text-sm text-gray-600">{description}</p>
            <div className="w-full overflow-hidden">
                <SyntaxHighlighter
                    language={language}
                    customStyle={{
                        margin: 0,
                        fontSize: '0.875rem',
                        lineHeight: '1.25rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                    }}
                    wrapLongLines={true}
                    showLineNumbers={showLineNumbers}
                >
                    {children}
                </SyntaxHighlighter>
            </div>
            {inputElement && (
                <div className="mt-4">
                    {inputElement}
                </div>
            )}
        </div>
    );

    return (
        <div className="mx-6 my-8">
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