import AdminUsers from '@/components/admin/AdminUsers';

export default function Page() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-center my-4">Gestion des utilisateurs</h1>
            <AdminUsers/>
        </div>
    );
}
