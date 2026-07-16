import Link from "next/link";
import type {LucideIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {ADMIN_CARD} from "@/components/admin/ui/adminStyles";

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    detail?: string;
    href?: string;
}

export default function StatCard({icon: Icon, label, value, detail, href}: StatCardProps) {
    const inner = (
        <>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/12 text-brand-accent-dark dark:bg-brand-primary/20 dark:text-brand-primary">
                <Icon className="size-5" aria-hidden="true"/>
            </span>
            <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55">
                    {label}
                </p>
                <p className="mt-0.5 text-2xl font-bold leading-tight text-brand-dark dark:text-bridge-100">
                    {value}
                </p>
                {detail && (
                    <p className="mt-0.5 text-xs text-bridge-600 dark:text-bridge-300">{detail}</p>
                )}
            </div>
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className={cn(
                    ADMIN_CARD,
                    "flex items-start gap-3 p-4 transition-all duration-300 ease-out",
                    "hover:-translate-y-1 hover:shadow-[0_14px_28px_-12px_rgba(147,97,58,0.5)] dark:hover:shadow-[0_14px_28px_-12px_rgba(0,0,0,0.7)]",
                )}
            >
                {inner}
            </Link>
        );
    }

    return (
        <div className={cn(ADMIN_CARD, "flex items-start gap-3 p-4")}>
            {inner}
        </div>
    );
}
