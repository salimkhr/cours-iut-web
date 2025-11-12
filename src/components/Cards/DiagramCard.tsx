'use client'
import {useEffect, useState} from "react";
import mermaid from "mermaid";
import BaseCard from "@/components/Cards/BaseCard";
import {useTheme} from "next-themes"; // ou ton hook useTheme

type DiagramCardProps = {
    header?: string;
    chart: string;
};

export default function DiagramCard({ header, chart }: DiagramCardProps) {
    const [svg, setSvg] = useState<string>("");
    const { theme } = useTheme(); // récupère 'light' ou 'dark'

    useEffect(() => {
        let isMounted = true;
        const diagramId = `mermaid-diagram-${crypto.randomUUID()}`;

        // Définir le thème Mermaid en fonction du mode
        const mermaidTheme = theme === "dark" ? "dark" : "default";

        mermaid.initialize({ theme: mermaidTheme });

        mermaid.render(diagramId, chart)
            .then(result => {
                if (isMounted) setSvg(result.svg);
            })
            .catch(err => {
                console.error("Erreur Mermaid:", err);
                if (isMounted) setSvg(`<pre>${chart}</pre>`);
            });

        return () => { isMounted = false };
    }, [chart, theme]); // Re-render si le diagram ou le thème change

    return (
        <BaseCard
            header={header}
            content={<div dangerouslySetInnerHTML={{ __html: svg }} className="w-full mx-auto" />}
            withMarge={false}
            withHover={false}
            withLed={false}
            className="w-full"
        />
    );
}
