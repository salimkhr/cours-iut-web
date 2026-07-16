import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminDashboardLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                <AdminSidebar/>
                <main className="min-w-0 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
