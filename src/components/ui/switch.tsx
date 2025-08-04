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
                "peer inline-flex h-6 w-11 items-center rounded-full border transition-colors",
                disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer",
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                className={cn(
                    "block h-5 w-5 rounded-full bg-black shadow-lg ring-0 transition-transform",
                    "data-[state=checked]:translate-x-5 data-[state=checked]:bg-module",
                    "data-[disabled]:bg-gray-400"
                )}
            />
        </SwitchPrimitive.Root>
    );
}

export {Switch};
