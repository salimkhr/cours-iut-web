'use client'
import React, {useState} from 'react';
import BaseCard from "@/components/Cards/BaseCard";
import {ClipboardCopyIcon} from "lucide-react";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {Button} from "@/components/ui/button";

interface CodeCardProps {
    language: string;
    children: string;
    className?: string;
    showLineNumbers?: boolean;
}

export default function CodeCard({language, children, showLineNumbers = true}: CodeCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(children).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const headerCard = (
        <>
            <span className="text-sm text-white font-mono">{language.toUpperCase()}</span>
            <div className="flex gap-1">
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
        <div className="mx-6 my-8">
            <BaseCard
                header={headerCard}
                content={content}
                withMarge={false}
                withHover={false}
                withLed={false}
            />
        </div>
    );
}