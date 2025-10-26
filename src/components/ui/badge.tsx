import * as React from "react"
import {Slot} from "@radix-ui/react-slot"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow,background-color] overflow-hidden",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90 dark:[a&]:hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 dark:[a&]:hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/80 dark:[a&]:hover:bg-destructive/70",
                outline:
                    "text-foreground border-border [a&]:hover:bg-accent [a&]:hover:text-accent-foreground dark:border-gray-700 dark:[a&]:hover:bg-gray-800 dark:text-gray-200",
                success:
                    "border-transparent bg-green-500 text-white [a&]:hover:bg-green-600 dark:bg-green-600/90 dark:[a&]:hover:bg-green-700 dark:text-green-50",
                warning:
                    "border-transparent bg-yellow-500 text-white [a&]:hover:bg-yellow-600 dark:bg-yellow-600/90 dark:[a&]:hover:bg-yellow-700 dark:text-yellow-50",
                info:
                    "border-transparent bg-blue-500 text-white [a&]:hover:bg-blue-600 dark:bg-blue-600/90 dark:[a&]:hover:bg-blue-700 dark:text-blue-50",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({
                   className,
                   variant,
                   asChild = false,
                   ...props
               }: React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "span"

    return (
        <Comp
            data-slot="badge"
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    )
}

export { Badge, badgeVariants }