import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminDashboardLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8 lg:pb-12">
            <div className="flex flex-col gap-7">
                <AdminSidebar/>
                <main className="min-w-0 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
