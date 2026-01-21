'use client'
import React, {ReactNode, useEffect, useState} from 'react';
import BaseCard from "@/components/Cards/BaseCard";
import {ClipboardCopyIcon} from "lucide-react";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {Button} from "@/components/ui/button";
import {oneDark, oneLight} from "react-syntax-highlighter/dist/esm/styles/prism";
import {useTheme} from "next-themes";

interface CodeWithPreviewCardProps {
    language: string;
    children: React.ReactNode;
    className?: string;
}

interface CodePanelProps {
    children?: string;
}

interface PreviewPanelProps {
    children?: React.ReactNode;
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

export default function CodeWithPreviewCard({language, children}: CodeWithPreviewCardProps) {
    let codeContent = "";
    let previewContent: ReactNode = null;

    const [copied, setCopied] = useState(false);
    const {theme} = useTheme();

    useEffect(() => setMounted(true), []);
    const [mounted, setMounted] = useState(false);

    if (!mounted) return null; // SSR-safe

    const isDark = theme === 'dark';

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
            {/* Layout responsive : côte à côte sur desktop, empilé sur mobile */}
            <div className="flex flex-col lg:flex-row h-full">
                {/* Panel Code */}
                <div className="flex-1 min-h-0">
                    <div className="h-full overflow-hidden lg:border-r-2 border-b-2 lg:border-b-0 border-module">
                        <SyntaxHighlighter
                            language={language}
                            style={isDark ? oneDark : oneLight}
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
                        <div className="h-full text-left p-4">
                            {previewContent}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="my-8">
            <BaseCard
                header={headerCard}
                content={content}
                withLed={false}
                withHover={false}
                withMarge={false}
            />
        </div>
    );
}