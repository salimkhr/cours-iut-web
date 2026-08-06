'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { BotIcon } from '@/components/icons/bot';
import type { BotIconHandle } from '@/components/icons/bot';

interface PromptModeButtonProps {
    accentColor: string;
    sectionTitle: string;
}

type ExtractionState = 'idle' | 'loading' | 'ready';

export default function PromptModeButton({ accentColor, sectionTitle }: PromptModeButtonProps) {
    const botRef = useRef<BotIconHandle>(null);
    const [open, setOpen] = useState(false);
    const [state, setState] = useState<ExtractionState>('idle');
    const [markdown, setMarkdown] = useState('');
    const [copied, setCopied] = useState(false);

    const extractMarkdown = useCallback(async () => {
        setState('loading');

        const main = document.querySelector('main');
        if (!main) {
            setState('idle');
            return;
        }

        const clone = main.cloneNode(true) as HTMLElement;

        // Remplacer chaque CodeCard par un <pre data-lang> propre
        clone.querySelectorAll('[data-code-block]').forEach((codeEl) => {
            const lang = (codeEl as HTMLElement).getAttribute('data-code-lang') ?? '';
            const code = codeEl.textContent ?? '';
            const pre = document.createElement('pre');
            pre.setAttribute('data-lang', lang);
            pre.textContent = code;
            const wrapper = codeEl.parentElement;
            if (wrapper?.parentNode) {
                wrapper.parentNode.replaceChild(pre, wrapper);
            }
        });

        // Supprimer les SVG (icônes Lucide)
        clone.querySelectorAll('svg').forEach((svg) => svg.remove());

        // Import dynamique pour ne pas alourdir le bundle initial
        const TurndownService = (await import('turndown')).default;
        const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

        td.addRule('codeblock', {
            filter: (node) =>
                node.nodeName === 'PRE' && node.hasAttribute('data-lang'),
            replacement: (_content, node) => {
                const lang = node.getAttribute('data-lang') ?? '';
                const code = node.textContent ?? '';
                return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
            },
        });

        setMarkdown(td.turndown(clone.innerHTML));
        setState('ready');
    }, []);

    const handleOpenChange = (value: boolean) => {
        setOpen(value);
        if (value && state === 'idle') extractMarkdown();
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenChange(true)}
                onMouseEnter={() => botRef.current?.startAnimation()}
                onMouseLeave={() => botRef.current?.stopAnimation()}
                aria-label="Copier ce contenu pour une IA"
                title="Copier ce contenu au format Markdown, pour le coller dans une IA"
                className="shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-2 h-11 sm:h-8 rounded-md text-brand-dark/55 dark:text-bridge-100/55 hover:text-brand-dark active:translate-y-px dark:hover:text-bridge-100 hover:bg-bridge-300/40 dark:hover:bg-bridge-700/40"
            >
                <BotIcon ref={botRef} size={16} className="shrink-0" />
                {/* « Prompt » ne disait rien à un étudiant : le libellé nomme
                    maintenant l'action, pas le jargon. */}
                <span className="hidden sm:inline text-sm font-medium">Copier pour l&apos;IA</span>
            </Button>

            <Sheet open={open} onOpenChange={handleOpenChange}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-2xl flex flex-col gap-0 bg-background text-foreground"
                >
                    <SheetHeader className="px-4 pb-4 border-b border-bridge-300/40 dark:border-bridge-700/40">
                        <SheetTitle className="flex items-center gap-2 text-base">
                            <BotIcon size={16} />
                            Copier pour l&apos;IA : {sectionTitle}
                        </SheetTitle>
                        <p className="text-sm text-brand-dark/60 dark:text-bridge-100/60">
                            Le contenu de cette page au format Markdown, à coller dans un assistant
                            (ChatGPT, Claude…) pour vous faire expliquer un point.
                        </p>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4">
                        {state === 'loading' && (
                            <p className="text-sm text-brand-dark/60 dark:text-bridge-100/60 animate-pulse">
                                Génération du Markdown…
                            </p>
                        )}
                        {state === 'ready' && (
                            <pre className="text-xs font-mono whitespace-pre-wrap break-words leading-relaxed text-brand-dark dark:text-bridge-100">
                                {markdown}
                            </pre>
                        )}
                    </div>

                    <SheetFooter className="px-4 pt-4 border-t border-bridge-300/40 dark:border-bridge-700/40">
                        <Button
                            onClick={handleCopy}
                            disabled={state !== 'ready'}
                            style={{'--module-color': accentColor} as React.CSSProperties}
                            className="w-full bg-(--module-color) text-bridge-50 hover:opacity-90 active:translate-y-px dark:text-brand-dark"
                        >
                            {copied ? 'Copié ✓' : "Copier pour l'IA"}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
