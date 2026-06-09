import { auth, getServerSession } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import UsersTable from "@/components/admin/users/UsersTable";
import type { AdminUser } from "@/components/admin/users/UsersTable";
import SetupActions from "@/components/admin/SetupActions";
import { connectToDB } from "@/lib/mongodb";
import { getContentTypes } from "@/types/CourseContent";
import type Module from "@/types/Module";

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

    let modules: Module[] = [];
    try {
        const db = await connectToDB();
        modules = await db.collection<Module>("modules").find({}).sort({ order: 1 }).toArray();
    } catch (error) {
        console.error("[admin] modules error:", error);
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
            <div className="mb-6">
                <SetupActions />
            </div>
            <UsersTable users={users} />

            <div className="mt-10">
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55 mb-2">
                    Builder de contenu
                </p>
                <h2 className="text-xl font-bold text-brand-dark dark:text-bridge-100 mb-4">
                    Modules
                </h2>
                <div className="flex flex-col gap-4">
                    {modules.map((mod) => (
                        <div key={mod.path} className="border rounded-lg p-4">
                            <div className="font-semibold mb-2">{mod.title}</div>
                            <div className="flex flex-col gap-1">
                                {mod.sections?.map((section) =>
                                    getContentTypes(section.contents ?? []).map((ct) => (
                                        <Link
                                            key={`${section.path}-${ct}`}
                                            href={`/admin/content/${mod.path}/${section.path}/${ct}`}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            {section.title} — {ct}
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
