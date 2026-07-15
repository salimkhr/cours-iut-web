import {auth, getServerSession} from "@/lib/auth";
import {headers} from "next/headers";
import {notFound} from "next/navigation";
import AdminTabs from "@/components/admin/AdminTabs";
import type {AdminUser} from "@/components/admin/users/UsersTable";
import getModules from "@/lib/getModules";

export default async function AdminPage() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        notFound();
    }

    const modules = await getModules();
    let users: AdminUser[] = [];

    try {
        // reason: better-auth admin plugin types not fully exposed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (auth.api as any).listUsers({
            headers: await headers(),
            query: {limit: "200", sortBy: "createdAt", sortDirection: "desc"},
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
                role: u.role ?? "user",
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
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <div className="mb-6">
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55">
                    Administration
                </p>
                <h1 className="mt-1 text-2xl font-bold text-brand-dark dark:text-bridge-100">
                    Tableau de bord
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-bridge-600 dark:text-bridge-300">
                    Gere les modules, les sections, les comptes et les outils internes depuis un seul espace.
                </p>
            </div>

            <AdminTabs users={users} modules={modules}/>
        </main>
    );
}
