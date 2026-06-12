"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineTextEditor } from "@/components/builder/InlineTextEditor";
import { renderInline } from "@/lib/inlineMarkdown";
import { cn } from "@/lib/utils";
import type { BlockEditorProps } from "@/lib/blockRegistry";

type CellRef = { row: number; col: number };
// row === -1 → cellule header

export function TableBlockEditor({ props, onChange }: BlockEditorProps) {
    const headers = (props.headers as string[]) ?? [];
    const rows = (props.rows as string[][]) ?? [];
    const colCount = Math.max(headers.length, 1);

    const [selected, setSelected] = useState<CellRef | null>(null);
    const [editing, setEditing] = useState<CellRef | null>(null);

    function update(nextHeaders: string[], nextRows: string[][]) {
        onChange({ ...props, headers: nextHeaders, rows: nextRows });
    }

    function getCellValue(row: number, col: number): string {
        if (row === -1) return headers[col] ?? "";
        return rows[row]?.[col] ?? "";
    }

    function setCellValue(row: number, col: number, value: string) {
        if (row === -1) {
            const next = [...headers];
            next[col] = value;
            update(next, rows);
        } else {
            const next = rows.map((r) => [...r]);
            if (!next[row]) next[row] = Array(colCount).fill("");
            next[row][col] = value;
            update(headers, next);
        }
    }

    function addRow() {
        update(headers, [...rows, Array(colCount).fill("")]);
    }

    function addCol() {
        update(
            [...headers, `En-tête ${headers.length + 1}`],
            rows.map((r) => [...r, ""]),
        );
    }

    function deleteRow(rowIdx: number) {
        setSelected(null);
        setEditing(null);
        update(headers, rows.filter((_, i) => i !== rowIdx));
    }

    function deleteCol(colIdx: number) {
        setSelected(null);
        setEditing(null);
        update(
            headers.filter((_, i) => i !== colIdx),
            rows.map((r) => r.filter((_, i) => i !== colIdx)),
        );
    }

    function isCellSelected(row: number, col: number) {
        return selected?.row === row && selected?.col === col;
    }

    function isCellEditing(row: number, col: number) {
        return editing?.row === row && editing?.col === col;
    }

    function selectCell(row: number, col: number) {
        setSelected({ row, col });
        setEditing(null);
    }

    function startEditing(row: number, col: number) {
        setSelected({ row, col });
        setEditing({ row, col });
    }

    function stopEditing() {
        setEditing(null);
    }

    function handleCellKeyDown(e: React.KeyboardEvent, row: number, col: number) {
        const inEdit = isCellEditing(row, col);

        if (e.key === "Enter" && !inEdit) {
            e.preventDefault();
            startEditing(row, col);
            return;
        }

        if (e.key === "Escape") {
            e.preventDefault();
            stopEditing();
            return;
        }

        if (e.key === "Tab") {
            e.preventDefault();
            stopEditing();
            if (!e.shiftKey) {
                if (col + 1 < colCount) {
                    setSelected({ row, col: col + 1 });
                } else if (row + 1 < rows.length) {
                    setSelected({ row: row + 1, col: 0 });
                } else if (row === rows.length - 1) {
                    // Dernière cellule : crée une ligne et sélectionne [newRow, 0]
                    addRow();
                    setSelected({ row: rows.length, col: 0 });
                } else {
                    setSelected({ row: 0, col: 0 });
                }
            } else {
                if (col - 1 >= 0) {
                    setSelected({ row, col: col - 1 });
                } else if (row - 1 >= -1) {
                    setSelected({ row: row - 1, col: colCount - 1 });
                }
            }
            return;
        }

        if (!inEdit) {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                setSelected({ row, col: Math.min(col + 1, colCount - 1) });
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                setSelected({ row, col: Math.max(col - 1, 0) });
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected({ row: Math.min(row + 1, rows.length - 1), col });
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelected({ row: Math.max(row - 1, -1), col });
            } else if (e.key === "Delete" || e.key === "Backspace") {
                e.preventDefault();
                setCellValue(row, col, "");
            }
        }
    }

    const selectedRow = selected?.row ?? null;
    const canDeleteRow = selectedRow !== null && selectedRow >= 0;
    const canDeleteCol = selected !== null && colCount > 1;

    const cellBaseCls =
        "relative px-3 py-2 text-sm text-left align-middle min-w-[80px] border border-bridge-300/50 dark:border-bridge-600/30 outline-none cursor-pointer";

    return (
        <div
            className="flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Toolbar */}
            <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-bridge-400/40 hover:border-brand-primary/50 hover:text-brand-primary cursor-pointer"
                    onClick={addRow}
                >
                    <Plus className="w-3 h-3" /> Ligne
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-bridge-400/40 hover:border-brand-primary/50 hover:text-brand-primary cursor-pointer"
                    onClick={addCol}
                >
                    <Plus className="w-3 h-3" /> Colonne
                </Button>
                <div className="w-px h-4 bg-bridge-400/30 dark:bg-bridge-500/25 mx-0.5" />
                <Button
                    size="sm"
                    variant="outline"
                    disabled={!canDeleteRow}
                    className="h-7 text-xs gap-1 border-bridge-400/40 hover:border-destructive/50 hover:text-destructive disabled:opacity-30 cursor-pointer"
                    onClick={() => { if (canDeleteRow) deleteRow(selectedRow!); }}
                >
                    <Trash2 className="w-3 h-3" /> Ligne
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={!canDeleteCol}
                    className="h-7 text-xs gap-1 border-bridge-400/40 hover:border-destructive/50 hover:text-destructive disabled:opacity-30 cursor-pointer"
                    onClick={() => { if (canDeleteCol) deleteCol(selected!.col); }}
                >
                    <Trash2 className="w-3 h-3" /> Colonne
                </Button>
            </div>

            {/* Grille */}
            <div className="overflow-x-auto rounded-lg border border-bridge-300/50 dark:border-bridge-600/30">
                <table className="border-collapse w-full table-auto">
                    <thead>
                        <tr>
                            {headers.map((_, col) => (
                                <th
                                    key={col}
                                    className={cn(
                                        cellBaseCls,
                                        "bg-bridge-100/60 dark:bg-bridge-800/60 font-semibold",
                                        isCellSelected(-1, col) && "ring-2 ring-inset ring-brand-primary",
                                    )}
                                    tabIndex={0}
                                    onClick={() => selectCell(-1, col)}
                                    onDoubleClick={() => startEditing(-1, col)}
                                    onKeyDown={(e) => handleCellKeyDown(e, -1, col)}
                                >
                                    {isCellEditing(-1, col) ? (
                                        <InlineTextEditor
                                            value={getCellValue(-1, col)}
                                            onChange={(v) => setCellValue(-1, col, v)}
                                            onBlur={stopEditing}
                                            onKeyDown={(e) => handleCellKeyDown(e, -1, col)}
                                            autoFocus
                                            aria-label={`En-tête colonne ${col + 1}`}
                                            className="w-full bg-transparent border-0 p-0 text-sm font-semibold h-auto shadow-none focus-visible:ring-0"
                                        />
                                    ) : (
                                        <span>
                                            {getCellValue(-1, col)
                                                ? renderInline(getCellValue(-1, col))
                                                : <span className="text-bridge-400 dark:text-bridge-500 font-normal italic text-xs">En-tête</span>
                                            }
                                        </span>
                                    )}
                                </th>
                            ))}
                            {/* Bouton ajout colonne */}
                            <th className="w-8 px-1 py-2 border border-bridge-300/50 dark:border-bridge-600/30 bg-bridge-100/60 dark:bg-bridge-800/60">
                                <button
                                    className="mx-auto w-5 h-5 rounded-full bg-brand-primary/10 hover:bg-brand-primary/25 text-brand-primary flex items-center justify-center transition-colors cursor-pointer"
                                    onClick={addCol}
                                    title="Ajouter une colonne"
                                    aria-label="Ajouter une colonne"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                                {row.map((_, col) => (
                                    <td
                                        key={col}
                                        className={cn(
                                            cellBaseCls,
                                            "bg-bridge-50 dark:bg-bridge-900/40",
                                            isCellSelected(rowIdx, col) && "ring-2 ring-inset ring-brand-primary",
                                        )}
                                        tabIndex={0}
                                        onClick={() => selectCell(rowIdx, col)}
                                        onDoubleClick={() => startEditing(rowIdx, col)}
                                        onKeyDown={(e) => handleCellKeyDown(e, rowIdx, col)}
                                    >
                                        {isCellEditing(rowIdx, col) ? (
                                            <InlineTextEditor
                                                value={getCellValue(rowIdx, col)}
                                                onChange={(v) => setCellValue(rowIdx, col, v)}
                                                onBlur={stopEditing}
                                                onKeyDown={(e) => handleCellKeyDown(e, rowIdx, col)}
                                                autoFocus
                                                aria-label={`Cellule ligne ${rowIdx + 1} colonne ${col + 1}`}
                                                className="w-full bg-transparent border-0 p-0 text-sm h-auto shadow-none focus-visible:ring-0"
                                            />
                                        ) : (
                                            <span>
                                                {getCellValue(rowIdx, col)
                                                    ? renderInline(getCellValue(rowIdx, col))
                                                    : <span className="text-bridge-400 dark:text-bridge-500 italic text-xs">—</span>
                                                }
                                            </span>
                                        )}
                                    </td>
                                ))}
                                <td className="w-8 px-1 border border-bridge-300/50 dark:border-bridge-600/30 bg-bridge-50 dark:bg-bridge-900/40" />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bouton ajout ligne */}
            <div className="flex justify-center">
                <button
                    className="flex items-center gap-1 px-3 py-1 text-xs text-bridge-500 dark:text-bridge-400 hover:text-brand-primary rounded-full hover:bg-brand-primary/5 transition-colors cursor-pointer"
                    onClick={addRow}
                    aria-label="Ajouter une ligne"
                >
                    <Plus className="w-3 h-3" /> Ligne
                </button>
            </div>
        </div>
    );
}
