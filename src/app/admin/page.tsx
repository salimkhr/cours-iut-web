import Link from "next/link";
import {Book, CircleHelp, User} from "lucide-react";

function AdminLink({
                       href,
                       icon: Icon,
                       children,
                   }: {
    href: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl p-4 hover:bg-gray-100 transition-colors shadow-sm border"
        >
            <Icon className="w-8 h-8"/>
            <span className="text-sm font-medium">{children}</span>
        </Link>
    );
}

export default function Page() {
    return (
        <div className="p-6 text-center w-full">
            <h1 className="text-2xl font-bold">Administration</h1>
            <div className="my-6 grid grid-cols-3 gap-6 max-w-md mx-auto">
                <AdminLink href="/admin/modules" icon={Book}>
                    Modules
                </AdminLink>
                <AdminLink href="/admin/users" icon={User}>
                    Utilisateurs
                </AdminLink>
                <AdminLink href="/admin/quizzes" icon={CircleHelp}>
                    Quizz
                </AdminLink>
            </div>
        </div>
    );
}
