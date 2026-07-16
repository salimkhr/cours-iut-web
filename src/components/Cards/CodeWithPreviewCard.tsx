'use client'
import React, {ReactNode, useState} from 'react';
import BaseCard from "@/components/Cards/BaseCard";
import {ClipboardCopyIcon, Code2, Eye} from "lucide-react";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {oneDark, oneLight} from "react-syntax-highlighter/dist/esm/styles/prism";
import {cn} from "@/lib/utils";
import type Module from "@/types/Module";

interface CodeWithPreviewCardProps {
    language: string;
    children: React.ReactNode;
    className?: string;
    currentModule?: Module;
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

type MobileTab = 'code' | 'preview';

export default function CodeWithPreviewCard({language, children, className, currentModule}: CodeWithPreviewCardProps) {
    let codeContent = "";
    let previewContent: ReactNode = null;

    const [copied, setCopied] = useState(false);
    const [mobileTab, setMobileTab] = useState<MobileTab>('code');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeContent).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

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
        <div className="flex items-center gap-3 w-full min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded px-2.5 py-1 text-xs font-mono text-white/95">
                    {language.toLowerCase()}
                </span>
                <span className="hidden lg:inline text-[10px] font-semibold tracking-[0.18em] uppercase text-white/45">
                    + aperçu
                </span>
            </div>

            <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Copier le code"
            >
                <ClipboardCopyIcon className="w-3.5 h-3.5"/>
                <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier'}</span>
            </button>
        </div>
    );

    const sharedHighlighterProps = {
        language,
        customStyle: {
            margin: 0,
            fontSize: '0.875rem',
            lineHeight: '1.6',
            height: '100%',
            background: 'transparent',
        },
        wrapLongLines: true,
        showLineNumbers: true,
    };

    const codePanel = (
        <div className="block dark:hidden h-full">
            <SyntaxHighlighter style={oneLight} {...sharedHighlighterProps}>
                {codeContent}
            </SyntaxHighlighter>
            </div>
    );

    const codePanelDark = (
        <div className="hidden dark:block h-full">
            <SyntaxHighlighter style={oneDark} {...sharedHighlighterProps}>
                {codeContent}
            </SyntaxHighlighter>
        </div>
    );

    const content = (
        <div className="w-full h-full overflow-hidden">

            {/* ── Tab strip mobile uniquement ── */}
            <div className="flex lg:hidden border-b border-bridge-400/40 dark:border-bridge-600/40">
                <button
                    onClick={() => setMobileTab('code')}
                    className={cn(
                        "flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
                        mobileTab === 'code'
                            ? "border-bridge-500 text-bridge-800 dark:text-bridge-100"
                            : "border-transparent text-bridge-500 dark:text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200"
                    )}
                >
                    <Code2 className="w-3.5 h-3.5"/>
                    Code
                </button>
                <button
                    onClick={() => setMobileTab('preview')}
                    className={cn(
                        "flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
                        mobileTab === 'preview'
                            ? "border-bridge-500 text-bridge-800 dark:text-bridge-100"
                            : "border-transparent text-bridge-500 dark:text-bridge-400 hover:text-bridge-700 dark:hover:text-bridge-200"
                    )}
                >
                    <Eye className="w-3.5 h-3.5"/>
                    Aperçu
                </button>
            </div>

            {/* ── Mobile : un seul panel à la fois ── */}
            <div className="lg:hidden">
                {mobileTab === 'code' ? (
                    <div className="overflow-x-auto">
                        {codePanel}
                        {codePanelDark}
                    </div>
                ) : (
                    <div className="p-4 text-left max-h-[60dvh] overflow-auto">
                        {previewContent}
                    </div>
                )}
            </div>

            {/* ── Desktop : côte à côte ── */}
            <div className="hidden lg:flex h-full">
                <div className="flex-1 min-w-0 overflow-x-auto border-r border-bridge-400/40 dark:border-bridge-600/40">
                    {codePanel}
                    {codePanelDark}
                </div>
                <div className="flex-1 min-w-0 overflow-auto p-4 text-left">
                    {previewContent}
                </div>
            </div>

        </div>
    );

    return (
        <div className={cn("course-code-card my-8 sm:my-10", className)}>
            <BaseCard
                header={headerCard}
                content={content}
                currentModule={currentModule}
                withLed={false}
                withHover={false}
                withMarge={false}
            />
        </div>
    );
}
