'use client'
import React, {useEffect, useState} from "react";
import mermaid from "mermaid";
import BaseCard from "@/components/Cards/BaseCard";
import {useTheme} from "next-themes";
import Text from "@/components/ui/Text";
import {useMounted} from "@/hook/useMounted";
import type Module from "@/types/Module";
import DiagramSkeleton from "@/components/Cards/DiagramSkeleton";
import {mermaidThemeVariables} from "@/lib/mermaidTheme";

type DiagramCardProps = {
    header?: string;
    chart: string;
    currentModule?: Module;
};

export default function DiagramCard({header, chart, currentModule}: DiagramCardProps) {
    const mounted = useMounted();
    const hostRef = React.useRef<HTMLDivElement>(null);
    // Exception au pattern "Tailwind dark: only" : Mermaid s'initialise via un
    // appel JS impératif `mermaid.initialize({ theme })` qui prend une string,
    // pas une classe CSS. On a donc besoin de lire le thème en JS via next-themes.
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
        const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const currentTheme = theme === "system" ? systemTheme : theme;
        const mermaidTheme = currentTheme === "dark" ? "dark" : "default";

        mermaid.initialize({
            theme: mermaidTheme,
            // Les thèmes livrés de Mermaid sortent en lavande/bleu : hors palette
            // et contraires à « La Règle des Couleurs Chaudes » (DESIGN.md).
            // Mêmes variables que SlideDiagram, pour que cours et slides rendent
            // un diagramme identique.
            themeVariables: mermaidThemeVariables(
                currentTheme === "dark",
                hostRef.current?.closest(".header-module")
            ),
            startOnLoad: false,
            securityLevel: 'loose',
            fontFamily: 'inherit'
        });

        const renderDiagram = async () => {
            try {
                const result = await mermaid.render(diagramId, chart);
                if (isMounted) {
                    setSvg(result.svg);
                }
            } catch (err) {
                console.error("Erreur Mermaid:", err);
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

    return (
        <BaseCard
            header={<Text className="text-white">{header}</Text>}
            content={
                svg ? (
                    <div ref={hostRef} dangerouslySetInnerHTML={{__html: svg}} className="w-full mx-auto overflow-x-auto [&_svg]:max-w-full"/>
                ) : (
                    <div ref={hostRef}><DiagramSkeleton/></div>
                )
            }
            currentModule={currentModule}
            withMarge={false}
            withHover={false}
            withLed={false}
            className="w-full"
        />
    );
}