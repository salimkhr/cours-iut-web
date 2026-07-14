import { auth, getServerSession } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import UsersTable from "@/components/admin/users/UsersTable";
import type { AdminUser } from "@/components/admin/users/UsersTable";
import MigrateButton from "@/components/admin/MigrateButton";

export default async function AdminPage() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        notFound();
    }

    let users: AdminUser[] = [];
    try {
        // reason: better-auth admin plugin types not fully exposed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (auth.api as any).listUsers({
            headers: await headers(),
            query: { limit: "200", sortBy: "createdAt", sortDirection: "desc" },
        });
        users = (result?.users ?? []).map(
            (u: {
                id: string;
                name: string;
                email: string;
                image?: string | null;
                role?: string;
                group?: string | null;
                username?: string | null;
                banned?: boolean | null;
                createdAt: Date | string;
            }) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                image: u.image ?? null,
                role: u.role ?? 'user',
                group: u.group ?? null,
                username: u.username ?? null,
                banned: u.banned ?? false,
                createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
            })
        );
    } catch (error) {
        console.error("[admin] listUsers error:", error);
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55">
                    Administration
                </p>
                <h1 className="text-2xl font-bold text-brand-dark dark:text-bridge-100 mt-0.5">
                    Gestion des utilisateurs
                </h1>
                <p className="text-sm text-bridge-500 dark:text-bridge-400 mt-1">
                    {users.length} compte{users.length !== 1 ? 's' : ''} enregistré{users.length !== 1 ? 's' : ''}
                </p>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <MigrateButton />
                <Link
                    href="/admin/calibrage"
                    className="inline-flex items-center gap-1.5 rounded-md border border-bridge-500/30 px-3 py-1.5 text-sm font-medium text-bridge-600 dark:text-bridge-300 hover:bg-bridge-100/50 dark:hover:bg-bridge-800/30 transition-colors"
                >
                    Calibrage pédagogique
                </Link>
                <Link
                    href="/admin/pedagogie"
                    className="inline-flex items-center gap-1.5 rounded-md border border-bridge-500/30 px-3 py-1.5 text-sm font-medium text-bridge-600 dark:text-bridge-300 hover:bg-bridge-100/50 dark:hover:bg-bridge-800/30 transition-colors"
                >
                    Briefs &amp; curriculums
                </Link>
            </div>
            <UsersTable users={users} />
        </div>
    );
}
