'use client'
import React, {ReactNode, useState} from 'react';
import BaseCard from "@/components/Cards/BaseCard";
import {ClipboardCopyIcon} from "lucide-react";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {Button} from "@/components/ui/button";

interface CodeWithPreviewProps {
    language: string;
    children: React.ReactNode;
    className?: string;
}

interface CodePanelProps {
    children: string;
}

interface PreviewPanelProps {
    children: React.ReactNode;
}

interface PanelProps {
    children: React.ReactNode;
    'data-code-content'?: boolean;
    'data-preview-content'?: boolean;
}

export function CodePanel({children}: CodePanelProps) {
    return <div data-code-content>{children}</div>;
}

export function PreviewPanel({children}: PreviewPanelProps) {
    return <div data-preview-content>{children}</div>;
}

export default function CodeWithPreview({language, children}: CodeWithPreviewProps) {
    let codeContent = "";
    let previewContent: ReactNode = null;

    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeContent).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Extraire le code et le preview des children
    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
            const element = child as React.ReactElement<PanelProps>;
            
            if (typeof element.props.children === 'string') {
                codeContent = element.props.children;
            } else {
                previewContent = element.props.children;
            }

        }
    });

    const headerCard = (
        <>
            <span className="text-sm text-white font-mono">{language}</span>
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
        <div className="w-full h-full rounded-lg overflow-hidden">
            {/* Layout responsive : côte à côte sur desktop, empilé sur mobile */}
            <div className="flex flex-col lg:flex-row h-full">
                {/* Panel Code */}
                <div className="flex-1 min-h-0">
                    <div className="h-full overflow-hidden border-r-2 border-module">
                        <SyntaxHighlighter
                            language={language}
                            customStyle={{
                                margin: 0,
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                height: '100%',
                            }}
                            wrapLongLines={true}
                            showLineNumbers={true}
                        >
                            {codeContent}
                        </SyntaxHighlighter>
                    </div>
                </div>

                {/* Panel Preview */}
                <div className="flex-1 min-h-0">
                    <div className="h-full overflow-hidden">
                        <div className="bg-white h-full overflow-auto flex items-center justify-center">
                            {previewContent}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <BaseCard
            header={headerCard}
            content={content}
            withLed={false}
            withHover={false}
            withMarge={false}
        />
    );
}