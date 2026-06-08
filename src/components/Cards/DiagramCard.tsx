'use client'
import React, {useEffect, useState} from "react";
import mermaid from "mermaid";
import BaseCard from "@/components/Cards/BaseCard";
import {useTheme} from "next-themes";
import Text from "@/components/ui/Text";
import {useMounted} from "@/hook/useMounted";

type DiagramCardProps = {
    header?: string;
    chart: string;
};

function DiagramSkeleton() {
    return (
        <div
            className="h-48 w-full flex items-center justify-center gap-6 px-8 animate-pulse"
            role="status"
            aria-label="Chargement du diagramme"
        >
            <div className="h-12 w-20 rounded bg-bridge-300/50 dark:bg-bridge-700/50"/>
            <div className="h-px w-8 bg-bridge-400/50 dark:bg-bridge-600/50"/>
            <div className="h-12 w-20 rounded bg-bridge-300/50 dark:bg-bridge-700/50"/>
            <div className="h-px w-8 bg-bridge-400/50 dark:bg-bridge-600/50"/>
            <div className="h-12 w-20 rounded bg-bridge-300/50 dark:bg-bridge-700/50"/>
        </div>
    );
}

export default function DiagramCard({header, chart}: DiagramCardProps) {
    const mounted = useMounted();
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
                    <div dangerouslySetInnerHTML={{__html: svg}} className="w-full mx-auto overflow-x-auto [&_svg]:max-w-full"/>
                ) : (
                    <DiagramSkeleton/>
                )
            }
            withMarge={false}
            withHover={false}
            withLed={false}
            className="w-full"
        />
    );
}