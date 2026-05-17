"use client"

import * as React from "react"
import {useSyncExternalStore} from "react"
import {useTheme} from "next-themes"
import {cn} from "@/lib/utils"

function useIsDark(): boolean {
    const {resolvedTheme} = useTheme()
    return useSyncExternalStore(
        () => () => {},
        () => resolvedTheme === "dark",
        () => false
    )
}

function Table({ className, ...props }: React.ComponentProps<"table">) {
    return (
        <div
            data-slot="table-container"
            className="relative w-full overflow-x-auto"
            role="region"
            aria-label="Table"
            tabIndex={0}
        >
            <table
                data-slot="table"
                className={cn("w-full caption-bottom text-sm", className)}
                {...props}
            />
        </div>
    )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
    const isDark = useIsDark()
    const borderColor = isDark ? "border-gray-700" : "border-gray-300"

    return (
        <thead
            data-slot="table-header"
            className={cn("[&_tr]:border-b", `[&_tr]:${borderColor}`, className)}
            {...props}
        />
    )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
    return (
        <tbody
            data-slot="table-body"
            className={cn("[&_tr:last-child]:border-0", className)}
            {...props}
        />
    )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
    const isDark = useIsDark()
    const bgColor = isDark ? "bg-gray-800/50" : "bg-gray-100/50"
    const borderColor = isDark ? "border-gray-700" : "border-gray-300"

    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                bgColor,
                borderColor,
                "border-t font-medium [&>tr]:last:border-b-0",
                "transition-colors duration-300",
                "motion-reduce:transition-none",
                className
            )}
            {...props}
        />
    )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
    const isDark = useIsDark()
    const hoverColor = isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-100/50"
    const selectedColor = isDark ? "data-[state=selected]:bg-gray-800" : "data-[state=selected]:bg-gray-100"
    const borderColor = isDark ? "border-gray-700" : "border-gray-300"

    return (
        <tr
            data-slot="table-row"
            className={cn(
                hoverColor,
                selectedColor,
                borderColor,
                "border-b transition-colors duration-300",
                "motion-reduce:transition-none",
                "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2",
                isDark ? "focus-within:outline-blue-500" : "focus-within:outline-blue-600",
                className
            )}
            {...props}
        />
    )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
    const isDark = useIsDark()
    const textColor = isDark ? "text-gray-100" : "text-gray-900"

    return (
        <th
            data-slot="table-head"
            scope="col"
            className={cn(
                textColor,
                "h-10 px-2 text-left align-middle font-semibold whitespace-nowrap",
                "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
                "transition-colors duration-300",
                "motion-reduce:transition-none",
                className
            )}
            {...props}
        />
    )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
    const isDark = useIsDark()
    const textColor = isDark ? "text-gray-200" : "text-gray-800"

    return (
        <td
            data-slot="table-cell"
            className={cn(
                textColor,
                "p-2 align-middle whitespace-nowrap",
                "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
                "transition-colors duration-300",
                "motion-reduce:transition-none",
                className
            )}
            {...props}
        />
    )
}

function TableCaption({
                          className,
                          ...props
                      }: React.ComponentProps<"caption">) {
    const isDark = useIsDark()
    const textColor = isDark ? "text-gray-400" : "text-gray-600"

    return (
        <caption
            data-slot="table-caption"
            className={cn(
                textColor,
                "mt-4 text-sm",
                "transition-colors duration-300",
                "motion-reduce:transition-none",
                className
            )}
            {...props}
        />
    )
}

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}
