"use client";

import type {ReactNode} from "react";
import {motion, useReducedMotion} from "motion/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {cn} from "@/lib/utils";
import {ADMIN_CARD} from "@/components/admin/ui/adminStyles";

const MotionTableRow = motion.create(TableRow);

export interface AdminColumn<TData> {
    /** Identifiant unique de la colonne, utilisé comme clé React. */
    id: string;
    header: ReactNode;
    cell: (row: TData) => ReactNode;
}

interface AdminDataTableProps<TData> {
    columns: AdminColumn<TData>[];
    data: TData[];
    emptyMessage: string;
    /** Clé React stable par ligne. À défaut, l'index de la ligne est utilisé. */
    getRowKey?: (row: TData, index: number) => string;
    className?: string;
    tableClassName?: string;
}

const headClassName =
    "px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55";

export default function AdminDataTable<TData>({
    columns,
    data,
    emptyMessage,
    getRowKey,
    className,
    tableClassName,
}: AdminDataTableProps<TData>) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <div className={cn(ADMIN_CARD, "overflow-hidden", className)}>
            <Table className={cn("min-w-[560px]", tableClassName)}>
                <TableHeader>
                    <TableRow className="border-b border-bridge-700/20 hover:bg-transparent dark:border-bridge-500/20">
                        {columns.map((column) => (
                            <TableHead key={column.id} className={headClassName}>
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length ? (
                        data.map((row, rowIndex) => (
                            // L'animation d'entrée ne se joue qu'au montage d'une ligne : avec une clé
                            // stable (getRowKey), seules les lignes réellement nouvelles s'animent —
                            // filtrer ne ré-anime pas le tableau entier.
                            <MotionTableRow
                                key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
                                initial={prefersReducedMotion ? false : {opacity: 0, y: -4}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.18, ease: "easeOut"}}
                                className="border-b border-bridge-700/10 last:border-b-0 dark:border-bridge-500/10"
                            >
                                {columns.map((column) => (
                                    <TableCell key={column.id} className="px-4 py-3">
                                        {column.cell(row)}
                                    </TableCell>
                                ))}
                            </MotionTableRow>
                        ))
                    ) : (
                        <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={columns.length} className="h-24 text-center text-bridge-500 dark:text-bridge-400">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
