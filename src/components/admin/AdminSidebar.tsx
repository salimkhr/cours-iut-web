"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {FileText, GraduationCap, Users, Wrench} from "lucide-react";
import {cn} from "@/lib/utils";
import {ADMIN_NAV_GROUPS, type AdminNavIconId, type AdminNavItem} from "@/components/admin/adminDashboardConfig";

const NAV_ICONS: Record<AdminNavIconId, typeof Users> = {
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
        <nav
            aria-label="Navigation administration"
            className="sticky top-(--navbar-h) z-30 -mx-4 border-b border-bridge-500/25 bg-background/95 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
            <div className="flex gap-5 overflow-x-auto">
                    {ADMIN_NAV_GROUPS.map((group) => (
                        <div key={group.label} className="flex shrink-0 gap-5">
                            {group.items.map((item: AdminNavItem) => {
                                const Icon = NAV_ICONS[item.icon];
                                const active = isActive(item.href, item.exact);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        aria-current={active ? "page" : undefined}
                                        title={item.label}
                                        className={cn(
                                            "flex min-h-14 shrink-0 items-center justify-center gap-2 whitespace-nowrap border-b-2 px-1 text-sm font-semibold transition-colors",
                                            active
                                                ? "border-brand-primary text-brand-primary"
                                                : "border-transparent text-brand-dark/60 hover:border-bridge-500/45 hover:text-brand-dark dark:text-bridge-100/60 dark:hover:text-bridge-100",
                                        )}
                                    >
                                        <Icon className="size-4 shrink-0" aria-hidden="true"/>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
            </div>
        </nav>
    );
}
