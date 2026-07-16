"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {BookOpen, FileText, GraduationCap, LayoutDashboard, Users, Wrench} from "lucide-react";
import {cn} from "@/lib/utils";
import {ADMIN_NAV_GROUPS, type AdminNavIconId, type AdminNavItem} from "@/components/admin/adminDashboardConfig";

const NAV_ICONS: Record<AdminNavIconId, typeof LayoutDashboard> = {
    overview: LayoutDashboard,
    modules: BookOpen,
    users: Users,
    tools: Wrench,
    calibrage: GraduationCap,
    pedagogie: FileText,
};

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

    return (
        <nav aria-label="Navigation administration" className="lg:w-56 lg:shrink-0">
            <div className="lg:sticky lg:top-[calc(var(--navbar-h)+1.5rem)]">
                {/* Mobile : pills horizontales scrollables — Desktop : rail vertical groupé */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:gap-6 lg:overflow-visible lg:pb-0">
                    {ADMIN_NAV_GROUPS.map((group) => (
                        <div key={group.label} className="flex shrink-0 gap-1.5 lg:flex-col lg:gap-1">
                            <p className="hidden text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55 lg:block lg:px-3 lg:pb-1.5">
                                {group.label}
                            </p>
                            {group.items.map((item: AdminNavItem) => {
                                const Icon = NAV_ICONS[item.icon];
                                const active = isActive(item.href, item.exact);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        aria-current={active ? "page" : undefined}
                                        className={cn(
                                            "flex min-h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors",
                                            active
                                                ? "bg-brand-primary text-white shadow-[0_2px_10px_-4px_rgba(147,97,58,0.5)] dark:text-brand-dark dark:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.5)]"
                                                : "text-brand-dark/70 hover:bg-bridge-300/40 hover:text-brand-dark dark:text-bridge-100/70 dark:hover:bg-bridge-700/40 dark:hover:text-bridge-100",
                                        )}
                                    >
                                        <Icon className="size-4 shrink-0" aria-hidden="true"/>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </nav>
    );
}
