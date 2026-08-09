'use client'
import {useMemo, useState} from 'react';
import BaseCard from "@/components/Cards/BaseCard";
import {Code2, Eye} from "lucide-react";
import {CopyIcon} from "@/components/icons/copy";
import {SyntaxHighlighter, normalizeLanguage, courseCodeDark, courseCodeLight} from '@/lib/syntaxHighlighter';
import {buildPreviewDocument, type PreviewSources} from "@/lib/previewDocument";
import {cn} from "@/lib/utils";
import type Module from "@/types/Module";

export interface CodePanelData {
    language: string;
    code: string;
}

interface CodeWithPreviewCardProps {
    panels: CodePanelData[];
    /** Absent → carte sans aperçu : uniquement les panneaux de code, pas d'iframe. */
    sources?: PreviewSources;
    className?: string;
    currentModule?: Module;
}

type MobileTab = 'code' | 'preview';

export default function CodeWithPreviewCard({panels, sources, className, currentModule}: CodeWithPreviewCardProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [mobileTab, setMobileTab] = useState<MobileTab>('code');

    // Nommé `previewDoc`, jamais `document` : ce nom masquerait le `document`
    // global du DOM à l'intérieur du composant.
    const previewDoc = useMemo(() => (sources ? buildPreviewDocument(sources) : null), [sources]);

    const handleCopy = (code: string, index: number) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    const headerCard = (
        <div className="flex items-center gap-3 w-full min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                {panels.map((panel, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded px-2.5 py-1 text-xs font-mono text-white/95"
                    >
                        {panel.language.toLowerCase()}
                    </span>
                ))}
                {previewDoc && (
                    <span className="hidden lg:inline text-[11px] font-semibold tracking-[0.18em] uppercase text-white/45">
                        + aperçu
                    </span>
                )}
            </div>
        </div>
    );

    const highlighterProps = (language: string) => ({
        language: normalizeLanguage(language),
        customStyle: {
            margin: 0,
            fontSize: '0.8125rem',
            lineHeight: '1.65',
            height: 'auto',
            background: 'transparent',
        },
        wrapLongLines: false,
        showLineNumbers: true,
    });

    const codePanels = panels.map((panel, index) => (
        <div key={index} className="flex flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-bridge-400/40 px-3 py-1.5 dark:border-bridge-600/40">
                <span className="text-xs font-mono uppercase text-bridge-500 dark:text-bridge-400">
                    {panel.language.toLowerCase()}
                </span>
                <button
                    onClick={() => handleCopy(panel.code, index)}
                    className="flex items-center gap-1.5 text-xs text-bridge-500 hover:text-bridge-800 dark:text-bridge-400 dark:hover:text-bridge-100"
                    aria-label={`Copier le code ${panel.language}`}
                >
                    <CopyIcon size={14} className="shrink-0"/>
                    {copiedIndex === index ? 'Copié !' : 'Copier'}
                </button>
            </div>
            <div className="block dark:hidden">
                <SyntaxHighlighter style={courseCodeLight} {...highlighterProps(panel.language)}>
                    {panel.code}
                </SyntaxHighlighter>
            </div>
            <div className="hidden dark:block">
                <SyntaxHighlighter style={courseCodeDark} {...highlighterProps(panel.language)}>
                    {panel.code}
                </SyntaxHighlighter>
            </div>
        </div>
    ));

    const codeColumn = (
        <div className="divide-y divide-bridge-400/40 dark:divide-bridge-600/40">
            {codePanels}
        </div>
    );

    const previewFrame = previewDoc && (
        <iframe
            srcDoc={previewDoc.html}
            sandbox={previewDoc.needsScripts ? "allow-scripts" : ""}
            title="Aperçu du code"
            className="w-full border-0 bg-white"
        />
    );

    // Sans aperçu (ex. bloc PHP + HTML) : pas d'onglets, pas de colonne d'aperçu,
    // seulement les panneaux de code empilés.
    const content = !previewDoc ? (
        <div className="w-full h-full overflow-x-auto">
            {codeColumn}
        </div>
    ) : (
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
                    <div className="code-with-preview-mobile-scroll overflow-x-auto">
                        {codeColumn}
                    </div>
                ) : (
                    <div className="code-with-preview-preview p-0 text-left max-h-[60dvh] overflow-auto">
                        {previewFrame}
                    </div>
                )}
            </div>

            {/* ── Desktop : côte à côte ── */}
            <div className="hidden lg:flex h-full">
                <div className="flex-1 min-w-0 overflow-x-auto border-r border-bridge-400/40 dark:border-bridge-600/40">
                    {codeColumn}
                </div>
                <div className="code-with-preview-preview flex-1 min-w-0 overflow-auto p-0 text-left">
                    {previewFrame}
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
