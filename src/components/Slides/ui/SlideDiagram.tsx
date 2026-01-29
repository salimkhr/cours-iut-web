'use client';
import React, {useEffect, useState} from 'react';
import mermaid from "mermaid";
import {useTheme} from "next-themes";
import {cn} from "@/lib/utils";

interface SlideDiagramProps {
    chart: string;
    className?: string;
}

export const SlideDiagram: React.FC<SlideDiagramProps> = ({
                                                              chart,
                                                              className
                                                          }) => {
    const [svg, setSvg] = useState<string>("");
    const {theme, systemTheme} = useTheme();
    const [mounted, setMounted] = useState(false);

    // Fix hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) {
            return;
        }

        if (!chart || chart.trim() === "") {
            console.error("⚠️ Chart vide ou invalide");
            setSvg("<p>Aucun diagramme fourni</p>");
            return;
        }

        let isMounted = true;
        const diagramId = `mermaid-slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Déterminer le thème effectif
        const currentTheme = theme === "system" ? systemTheme : theme;
        const mermaidTheme = currentTheme === "dark" ? "dark" : "default";

        // Configuration Mermaid
        mermaid.initialize({
            theme: mermaidTheme,
            startOnLoad: false,
            securityLevel: 'loose',
            fontFamily: 'inherit',
            fontSize: 18,
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis',
                padding: 20,
                nodeSpacing: 80,
                rankSpacing: 80
            },
            sequence: {
                useMaxWidth: true,
                mirrorActors: true,
                messageMargin: 80,
                boxMargin: 20,
                actorMargin: 80
            }
        });

        // Render async
        const renderDiagram = async () => {
            try {
                const result = await mermaid.render(diagramId, chart);
                if (isMounted) {
                    setSvg(result.svg);
                }
            } catch (err: any) {
                console.error("❌ Erreur Mermaid:", err);
                if (isMounted) {
                    setSvg(`<pre style="color: red; white-space: pre-wrap;">${err.message || err}\n\n${chart}</pre>`);
                }
            }
        };

        renderDiagram();

        return () => {
            isMounted = false;
        };
    }, [chart, theme, systemTheme, mounted]);

    // Skeleton pendant le chargement
    if (!mounted) {
        return (
            <div className={cn("flex items-start justify-center w-full h-full min-h-[600px]", className)}>
                <div className="h-full w-full animate-pulse bg-gray-200 dark:bg-gray-700 rounded"/>
            </div>
        );
    }

    return (
        <div className={cn("flex items-start justify-center w-full h-full my-4", className)}>
            {svg ? (
                <div
                    dangerouslySetInnerHTML={{__html: svg}}
                    className="w-full max-w-full flex items-start justify-center slide-diagram-container"
                />
            ) : (
                <div className="h-[600px] flex items-start justify-center text-gray-500">
                    Chargement du diagramme...
                </div>
            )}
            <style jsx global>{`
                .slide-diagram-container svg {
                    max-width: 100%;
                    min-height: 500px;
                    height: auto;
                    margin: 0 auto;
                    transform: scale(1.3);
                    transform-origin: top center;
                }

                .slide-diagram-container {
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    min-height: 600px;
                    padding: 1rem 2rem;
                }
            `}</style>
        </div>
    );
};