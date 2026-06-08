'use client';

import { useState } from 'react';
import UserRow from './UserRow';
import EditUserDialog from './EditUserDialog';

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: string;
    group?: string | null;
    username?: string | null;
    banned?: boolean | null;
    createdAt: string;
}

const EYEBROW = "text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55 text-left";

export default function UsersTable({ users: initialUsers }: { users: AdminUser[] }) {
    const [users, setUsers] = useState<AdminUser[]>(initialUsers);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    const handleDeleted = (userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
    };

    const handleUpdated = (updated: AdminUser) => {
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    };

    if (users.length === 0) {
        return (
            <p className="text-center text-bridge-500 dark:text-bridge-400 py-12">
                Aucun utilisateur trouvé.
            </p>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-bridge-500/45 overflow-x-auto bg-bridge-50 dark:bg-bridge-900">
                <table className="w-full min-w-[560px]">
                    <thead>
                        <tr className="border-b border-bridge-700/20 dark:border-bridge-500/20">
                            <th className={`px-4 py-2.5 ${EYEBROW}`}>Utilisateur</th>
                            <th className={`px-4 py-2.5 ${EYEBROW}`}>Groupe</th>
                            <th className={`px-4 py-2.5 ${EYEBROW}`}>Rôle</th>
                            <th className={`px-4 py-2.5 ${EYEBROW}`}>Inscrit le</th>
                            <th className={`px-4 py-2.5 ${EYEBROW}`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <UserRow
                                key={user.id}
                                user={user}
                                onDeleted={handleDeleted}
                                onEdit={setEditingUser}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {editingUser && (
                <EditUserDialog
                    user={editingUser}
                    open={!!editingUser}
                    onOpenChange={(open) => { if (!open) setEditingUser(null); }}
                    onUpdated={handleUpdated}
                />
            )}
        </>
    );
}
