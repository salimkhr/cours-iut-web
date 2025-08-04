"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import {cn} from "@/lib/utils";


function Switch({className}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
    return (
        <SwitchPrimitive.Root
            className={cn("peer inline-flex h-6 w-11 items-center rounded-full border", className)}
            defaultChecked={false}
            id="toggle"
        >
            <SwitchPrimitive.Thumb
                className="block h-5 w-5 rounded-full bg-black shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=checked]:bg-module"
            />
        </SwitchPrimitive.Root>
    );
}


export {Switch}
