'use client'
import React, {useEffect, useState} from "react";
import mermaid from "mermaid";
import BaseCard from "@/components/Cards/BaseCard";
import {useTheme} from "next-themes";
import Text from "@/components/ui/Text";

type DiagramCardProps = {
    header?: string;
    chart: string;
};

export default function DiagramCard({header, chart}: DiagramCardProps) {
    const [svg, setSvg] = useState<string>("");
    const {theme, systemTheme} = useTheme();
    const [mounted, setMounted] = useState(false);

    // Fix hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) {
            console.log("⏳ Attente du montage du composant...");
            return;
        }

        if (!chart || chart.trim() === "") {
            console.error("⚠️ Chart vide ou invalide");
            setSvg("<p>Aucun diagramme fourni</p>");
            return;
        }

        let isMounted = true;
        const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Déterminer le thème effectif
        const currentTheme = theme === "system" ? systemTheme : theme;
        const mermaidTheme = currentTheme === "dark" ? "dark" : "default";

        console.log("🎨 Render avec thème:", mermaidTheme);

        // Configuration Mermaid
        mermaid.initialize({
            theme: mermaidTheme,
            startOnLoad: false,
            securityLevel: 'loose',
            fontFamily: 'inherit'
        });

        // Render async
        const renderDiagram = async () => {
            try {
                const result = await mermaid.render(diagramId, chart);
                if (isMounted) {
                    console.log("✅ Diagramme rendu");
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
            <BaseCard
                header={<Text className="text-white">{header}</Text>}
                content={<div className="h-48 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"/>}
                withMarge={false}
                withHover={false}
                withLed={false}
                className="w-full"
            />
        );
    }

    return (
        <BaseCard
            header={<Text className="text-white">{header}</Text>}
            content={
                svg ? (
                    <div dangerouslySetInnerHTML={{__html: svg}} className="w-full mx-auto"/>
                ) : (
                    <div className="h-48 flex items-center justify-center text-gray-500">
                        Chargement du diagramme...
                    </div>
                )
            }
            withMarge={false}
            withHover={false}
            withLed={false}
            className="w-full"
        />
    );
}