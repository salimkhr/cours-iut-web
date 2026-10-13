'use client';

import React from 'react';
import {renderInline} from "@/lib/inlineMarkdown";
import {cn} from "@/lib/utils";
import {slideTextSizes, TextSize} from "@/components/Slides/ui/config/slideConfig";

interface SlideTableProps {
    headers: string[];
    rows: string[][];
    size?: TextSize;
    className?: string;
}

/**
 * Tableau projeté. Volontairement distinct du bloc `table` des cours : à la
 * distance d'une salle, la densité qui convient à une page lue à 50 cm devient
 * illisible. On garde donc la même donnée (`headers` / `rows`) mais l'échelle
 * typographique des slides, avec des cellules compactes pour garder les
 * tableaux de synthèse visibles dans la hauteur de la scène.
 *
 * Le débordement horizontal est autorisé plutôt que la troncature : un tableau
 * trop large se voit tout de suite en préparation, alors qu'une colonne coupée
 * passe inaperçue jusqu'au cours.
 */
export const SlideTable: React.FC<SlideTableProps> = ({
                                                          headers,
                                                          rows,
                                                          size = "default",
                                                          className,
                                                      }) => {
    if (headers.length === 0 && rows.length === 0) return null;

    return (
        <div className={cn("w-full min-w-0 min-h-0 overflow-auto", className)}>
            <table className={cn("w-full border-collapse text-left", slideTextSizes.table[size])}>
                {headers.length > 0 && (
                    <thead>
                    <tr className="border-b-2 border-(--module-color)">
                        {headers.map((header, i) => (
                            <th
                                key={i}
                                className="px-3 py-2 leading-tight font-bold text-(--module-color) dark:text-(--module-color-dark)"
                            >
                                {renderInline(header)}
                            </th>
                        ))}
                    </tr>
                    </thead>
                )}
                <tbody>
                {rows.map((row, i) => (
                    <tr key={i} className="border-b border-bridge-500/25 last:border-b-0">
                        {row.map((cell, j) => (
                            <td key={j} className="px-3 py-2 align-top leading-tight">
                                {renderInline(cell)}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};
