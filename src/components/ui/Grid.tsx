'use client'
import React, {CSSProperties, useEffect, useState} from "react";

type TemplateColumns = {
    base?: string;
    sm?: string;
    md?: string;
    lg?: string;
};

type GridProps = {
    templateColumns?: TemplateColumns;
    gap?: number | string;
    width?: string;
    children: React.ReactNode;
    className?: string;
};

const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
};

type GridItemProps = {
    colStart?: number;
    colEnd?: number;
    rowStart?: number;
    rowEnd?: number;
    children: React.ReactNode;
    className?: string;
    style?: CSSProperties;
};


export function GridItem({
                             colStart,
                             colEnd,
                             rowStart,
                             rowEnd,
                             children,
                             className = "",
                             style = {},
                         }: GridItemProps) {
    const gridStyles: CSSProperties = {
        gridColumnStart: colStart,
        gridColumnEnd: colEnd,
        gridRowStart: rowStart,
        gridRowEnd: rowEnd,
        ...style,
    };

    return (
        <div className={className} style={gridStyles}>
            {children}
        </div>
    );
}

export default function Grid({
                                 templateColumns = {base: "1fr"},
                                 gap = 6,
                                 width = "100%",
                                 children,
                                 className = "",
                             }: GridProps) {
    const [columns, setColumns] = useState(templateColumns.base || "1fr");

    useEffect(() => {
        function updateColumns() {
            const w = window.innerWidth;

            if (w >= breakpoints.lg && templateColumns.lg) setColumns(templateColumns.lg);
            else if (w >= breakpoints.md && templateColumns.md) setColumns(templateColumns.md);
            else if (w >= breakpoints.sm && templateColumns.sm) setColumns(templateColumns.sm);
            else setColumns(templateColumns.base || "1fr");
        }

        updateColumns();

        window.addEventListener("resize", updateColumns);
        return () => window.removeEventListener("resize", updateColumns);
    }, [templateColumns]);

    return (
        <div
            className={className}
            style={{
                display: "grid",
                gridTemplateColumns: columns || templateColumns?.base,
                gap: typeof gap === "number" ? `${gap * 4}px` : gap, // gap * 4 = Tailwind gap-6 = 24px
                width,
            }}
        >
            {children}
        </div>
    );
}