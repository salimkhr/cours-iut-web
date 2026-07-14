"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import {cn} from "@/lib/utils";

function Switch({
                    className,
                    onCheckedChange,
                    checked,
                    disabled,
                    ...props
                }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
    return (
        <SwitchPrimitive.Root
            onCheckedChange={onCheckedChange}
            checked={checked}
            disabled={disabled}
            className={cn(
                "peer inline-flex h-6 w-11 items-center rounded-full border border-input bg-muted transition-colors data-[state=checked]:bg-primary data-[state=checked]:bg-module focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer",
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                className={cn(
                    "block size-5 rounded-full bg-brand-dark shadow-[0_2px_8px_-4px_rgba(147,97,58,0.7)] ring-0 transition-transform dark:bg-bridge-50",
                    "data-[state=checked]:translate-x-5 data-[state=checked]:bg-brand-light dark:data-[state=checked]:bg-brand-dark",
                    "data-[disabled]:bg-bridge-400"
                )}
            />
        </SwitchPrimitive.Root>
    );
}

export {Switch};
