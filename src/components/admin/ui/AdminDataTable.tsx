"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
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

interface AdminDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    emptyMessage: string;
    className?: string;
    tableClassName?: string;
}

const headClassName =
    "px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55";

export default function AdminDataTable<TData, TValue>({
    columns,
    data,
    emptyMessage,
    className,
    tableClassName,
}: AdminDataTableProps<TData, TValue>) {
    // TanStack Table is the implementation recommended by shadcn's data-table guide.
    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className={cn(ADMIN_CARD, "overflow-hidden", className)}>
            <Table className={cn("min-w-[560px]", tableClassName)}>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="border-b border-bridge-700/20 hover:bg-transparent dark:border-bridge-500/20"
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className={headClassName}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                className="border-b border-bridge-700/10 last:border-b-0 dark:border-bridge-500/10"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="px-4 py-3">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
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
