import {cn} from "@/lib/utils";

interface StatProps {
    Icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number | string;
    withDivider?: boolean;
    modulePath?: string;
}

export default function Stat({Icon, label, value, withDivider, modulePath}: StatProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left px-2 sm:px-4",
                withDivider && "sm:border-l sm:border-bridge-700/25 dark:sm:border-bridge-500/30"
            )}
        >
            <div
                className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl bg-bridge-700/15 text-brand-dark dark:bg-bridge-500/25 dark:text-bridge-100">
                <Icon className="w-5 h-5"/>
            </div>

            <div className="flex flex-col min-w-0">
                <span
                    className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-dark/70 dark:text-bridge-200/70">
                    <Icon className="w-3.5 h-3.5 sm:hidden"/>
                    {label}
                </span>

                <span
                    className={cn(
                        "text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight tabular-nums leading-none mt-1",
                        modulePath ? `text-${modulePath}` : "text-brand-dark dark:text-bridge-50"
                    )}
                >
                    {value}
                </span>
            </div>
        </div>
    );
}
