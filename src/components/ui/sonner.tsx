"use client"

import {Toaster as Sonner, ToasterProps} from "sonner"
import {useIsDark} from "@/hook/useIsDark";

function Toaster({...props}: ToasterProps) {
    const isDark = useIsDark();

    return (
        <Sonner
            theme={isDark ? "dark" : "light"}
            className="toaster group"
            position="top-right"
            toastOptions={{
                classNames: {
                    toast: "group toast group-[.toaster]:bg-bridge-50 group-[.toaster]:dark:bg-bridge-800 group-[.toaster]:text-bridge-900 group-[.toaster]:dark:text-bridge-100 group-[.toaster]:border-bridge-400/40 group-[.toaster]:dark:border-bridge-500/45 group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-bridge-600 group-[.toast]:dark:text-bridge-300",
                    actionButton: "group-[.toast]:bg-brand-accent-dark group-[.toast]:text-white",
                    cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                    success: "group-[.toaster]:!text-green-700 group-[.toaster]:dark:!text-green-400",
                    error: "group-[.toaster]:!text-red-700 group-[.toaster]:dark:!text-red-400",
                },
            }}
            {...props}
        />
    )
}

export {Toaster}
