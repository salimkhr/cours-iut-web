'use client'
import {useEffect, useRef} from "react";
import mermaid, {RenderResult} from "mermaid";
import BaseCard from "@/components/Cards/BaseCard";

type DiagramCardProps = {
    header?: string;
    chart: string;
};

export default function DiagramCard({ header, chart }: DiagramCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            mermaid.initialize({ startOnLoad: true, theme: "default" });
            try {
                mermaid.render("mermaid-diagram", chart).then((result: RenderResult) => {
                    containerRef.current!.innerHTML = result.svg;

                    // Si bindFunctions est défini, on l’appelle
                    if (result.bindFunctions) {
                        result.bindFunctions(containerRef.current!);
                    }
                });
            } catch {
                containerRef.current.innerHTML = `<pre>${chart}</pre>`;
            }
        }
    }, [chart]);

    return (
        <BaseCard
            header={header}
            content={<div ref={containerRef} className="w-full overflow-x-auto mx-auto" />}
            withMarge={false}
            withHover={false}
            withLed={false}
        />
    );
}
