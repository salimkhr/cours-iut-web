"use client";

import {Fragment, type KeyboardEvent, type MouseEvent, type ReactNode} from "react";
import {useRouter} from "next/navigation";
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
    /**
     * Rend la ligne entière cliquable (retourne l'URL de destination, ou `undefined` pour la
     * désactiver au cas par cas). Les clics sur un élément interactif imbriqué (bouton, lien,
     * switch…) ne déclenchent pas la navigation.
     */
    getRowHref?: (row: TData, index: number) => string | undefined;
    /**
     * Désactive l'habillage carte (bordure/fond/ombre) — pour un tableau imbriqué dans une
     * surface déjà levée (ex: `SectionsStep`, dans la carte du workflow module).
     */
    card?: boolean;
    /**
     * Contenu secondaire rendu sur une ligne pleine largeur sous la ligne principale (retourner
     * `null` pour ne rien ajouter). Indispensable pour du texte long : les cellules portent
     * `whitespace-nowrap`, donc un paragraphe placé dans une colonne étire le tableau au lieu de
     * revenir à la ligne. Ici le `colSpan` couvre toute la largeur et le retour à la ligne est
     * rétabli.
     */
    renderSubRow?: (row: TData, index: number) => ReactNode;
}

const headClassName =
    "px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55";

const INTERACTIVE_SELECTOR = "a, button, input, select, textarea, [role=\"button\"], [role=\"switch\"]";

export default function AdminDataTable<TData>({
    columns,
    data,
    emptyMessage,
    getRowKey,
    className,
    tableClassName,
    getRowHref,
    card = true,
    renderSubRow,
}: AdminDataTableProps<TData>) {
    const prefersReducedMotion = useReducedMotion();
    const router = useRouter();

    return (
        <div className={cn(card && ADMIN_CARD, "overflow-hidden", className)}>
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
                        data.map((row, rowIndex) => {
                            const rowKey = getRowKey ? getRowKey(row, rowIndex) : String(rowIndex);
                            const rowHref = getRowHref?.(row, rowIndex);
                            const subRow = renderSubRow?.(row, rowIndex);

                            const navigateToRow = (target: EventTarget) => {
                                if ((target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
                                if (rowHref) router.push(rowHref);
                            };

                            return (
                                // L'animation d'entrée ne se joue qu'au montage d'une ligne : avec une clé
                                // stable (getRowKey), seules les lignes réellement nouvelles s'animent —
                                // filtrer ne ré-anime pas le tableau entier.
                                <Fragment key={rowKey}>
                                    <MotionTableRow
                                        initial={prefersReducedMotion ? false : {opacity: 0, y: -4}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{duration: 0.18, ease: "easeOut"}}
                                        className={cn(
                                            // Une ligne suivie de son sous-contenu ne porte pas de séparateur :
                                            // c'est la ligne du sous-contenu qui ferme le bloc.
                                            subRow
                                                ? "border-b-0"
                                                : "border-b border-bridge-700/10 last:border-b-0 dark:border-bridge-500/10",
                                            rowHref && "cursor-pointer",
                                        )}
                                        onClick={rowHref ? (e: MouseEvent<HTMLTableRowElement>) => navigateToRow(e.target) : undefined}
                                        onKeyDown={rowHref ? (e: KeyboardEvent<HTMLTableRowElement>) => {
                                            if (e.key !== "Enter" && e.key !== " ") return;
                                            if ((e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
                                            e.preventDefault();
                                            router.push(rowHref);
                                        } : undefined}
                                        tabIndex={rowHref ? 0 : undefined}
                                        role={rowHref ? "link" : undefined}
                                    >
                                        {columns.map((column) => (
                                            <TableCell key={column.id} className="px-4 py-3">
                                                {column.cell(row)}
                                            </TableCell>
                                        ))}
                                    </MotionTableRow>
                                    {subRow && (
                                        <TableRow className="border-b border-bridge-700/10 last:border-b-0 hover:bg-transparent dark:border-bridge-500/10">
                                            <TableCell
                                                colSpan={columns.length}
                                                className="whitespace-normal px-4 pb-3 pt-0"
                                            >
                                                {subRow}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </Fragment>
                            );
                        })
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
