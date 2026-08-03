'use client';
import React, {useEffect, useState} from 'react';
import {useTheme} from "next-themes";
import {cn} from "@/lib/utils";
import {useMounted} from "@/hook/useMounted";
import {mermaidThemeVariables} from "@/lib/mermaidTheme";

interface SlideDiagramProps {
    chart: string;
    className?: string;
}

export const SlideDiagram: React.FC<SlideDiagramProps> = ({
                                                              chart,
                                                              className
                                                          }) => {
    const mounted = useMounted();
    const hostRef = React.useRef<HTMLDivElement>(null);
    const {theme, systemTheme} = useTheme();
    const chartIsEmpty = !chart || chart.trim() === "";
    const [svg, setSvg] = useState<string>(
        chartIsEmpty ? "<p>Aucun diagramme fourni</p>" : ""
    );

    useEffect(() => {
        if (!mounted || chartIsEmpty) {
            return;
        }

        let isMounted = true;
        const diagramId = `mermaid-slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Déterminer le thème effectif
        const currentTheme = theme === "system" ? systemTheme : theme;
        const mermaidTheme = currentTheme === "dark" ? "dark" : "default";

        // Render async
        const renderDiagram = async () => {
            try {
                const mermaid = (await import("mermaid")).default;

                // Configuration Mermaid.
                // `useMaxWidth: false` laisse le SVG porter son viewBox sans
                // largeur figée : le CSS peut alors l'étirer à la scène, au lieu
                // du rendu timbre-poste perdu au milieu de la slide.
                mermaid.initialize({
                    theme: mermaidTheme,
                    themeVariables: mermaidThemeVariables(
                        currentTheme === "dark",
                        hostRef.current?.closest(".header-module")
                    ),
                    startOnLoad: false,
                    securityLevel: 'loose',
                    fontFamily: 'inherit',
                    fontSize: 18,
                    flowchart: {
                        useMaxWidth: false,
                        htmlLabels: true,
                        curve: 'basis',
                        padding: 20,
                        nodeSpacing: 80,
                        rankSpacing: 80
                    },
                    sequence: {
                        useMaxWidth: false,
                        mirrorActors: true,
                        messageMargin: 80,
                        boxMargin: 20,
                        actorMargin: 80
                    }
                });

                const result = await mermaid.render(diagramId, chart);
                if (isMounted) {
                    setSvg(result.svg);
                }
            } catch (err) {
                console.error("❌ Erreur Mermaid:", err);
                if (isMounted) {
                    const message = err instanceof Error ? err.message : String(err);
                    setSvg(`<pre style="color: red; white-space: pre-wrap;">${message}\n\n${chart}</pre>`);
                }
            }
        };

        renderDiagram();

        return () => {
            isMounted = false;
        };
    }, [chart, chartIsEmpty, theme, systemTheme, mounted]);

    // Skeleton pendant le chargement
    if (!mounted) {
        return (
            <div className={cn("flex min-h-0 flex-1 items-center justify-center w-full", className)}>
                <div className="h-full w-full animate-pulse bg-bridge-200/70 dark:bg-bridge-700/55 rounded"/>
            </div>
        );
    }

    // Le diagramme occupe la place disponible et se centre : plus de hauteur
    // plancher en px ni de `scale()` qui poussaient le SVG hors de la scène.
    return (
        <div ref={hostRef} className={cn("flex min-h-0 min-w-0 flex-1 items-center justify-center w-full my-2", className)}>
            {svg ? (
                <div
                    dangerouslySetInnerHTML={{__html: svg}}
                    className="slide-diagram-container"
                />
            ) : (
                <div className="flex items-center justify-center text-bridge-500 dark:text-bridge-300">
                    Chargement du diagramme...
                </div>
            )}
            <style jsx global>{`
                .slide-diagram-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    min-height: 0;
                    padding: 0.5rem 1rem;
                }

                /* Le viewBox porte le ratio : le SVG remplit la scène et se
                   centre tout seul (preserveAspectRatio par défaut). */
                .slide-diagram-container svg {
                    width: 100%;
                    height: 100%;
                    max-width: 100%;
                    max-height: 100%;
                    margin: 0 auto;
                }
            `}</style>
        </div>
    );
};
