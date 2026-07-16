'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import UserRow from './UserRow';
import EditUserDialog from './EditUserDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ADMIN_CARD } from '@/components/admin/ui/adminStyles';
import type AdminUser from '@/types/AdminUser';

export type { default as AdminUser } from '@/types/AdminUser';

const EYEBROW = "text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55 text-left";

type RoleFilter = 'all' | 'admin' | 'user' | 'banned';

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
    { value: 'all', label: 'Tous' },
    { value: 'user', label: 'Étudiants' },
    { value: 'admin', label: 'Admins' },
    { value: 'banned', label: 'Bannis' },
];

function normalize(text: string): string {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function UsersTable({ users: initialUsers }: { users: AdminUser[] }) {
    const [users, setUsers] = useState<AdminUser[]>(initialUsers);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

    const handleDeleted = (userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
    };

    const handleUpdated = (updated: AdminUser) => {
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    };

    const normalizedQuery = normalize(query.trim());
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            if (roleFilter === 'admin' && user.role !== 'admin') return false;
            if (roleFilter === 'user' && user.role === 'admin') return false;
            if (roleFilter === 'banned' && !user.banned) return false;
            if (!normalizedQuery) return true;
            const haystack = normalize(
                `${user.name} ${user.email} ${user.group ?? ''} ${user.username ?? ''}`
            );
            return haystack.includes(normalizedQuery);
        });
    }, [users, normalizedQuery, roleFilter]);

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-bridge-500"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher par nom, email ou groupe…"
                        aria-label="Rechercher un compte"
                        className="min-h-11 border-bridge-500/35 bg-bridge-50 pl-9 dark:bg-bridge-800"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrer par rôle">
                    {ROLE_FILTERS.map(({ value, label }) => (
                        <Button
                            key={value}
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-pressed={roleFilter === value}
                            onClick={() => setRoleFilter(value)}
                            className={cn(
                                'min-h-9 border-bridge-500/45',
                                roleFilter === value &&
                                    'border-brand-primary bg-brand-primary text-white hover:bg-brand-accent-dark hover:text-white dark:text-brand-dark dark:hover:bg-brand-primary/80 dark:hover:text-brand-dark',
                            )}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </div>

            <p className="text-sm text-bridge-600 dark:text-bridge-300">
                {filteredUsers.length} compte{filteredUsers.length > 1 ? 's' : ''}
                {(normalizedQuery || roleFilter !== 'all') && ` sur ${users.length}`}
            </p>

            {filteredUsers.length === 0 ? (
                <p className="py-12 text-center text-bridge-500 dark:text-bridge-400">
                    {users.length === 0 ? 'Aucun utilisateur trouvé.' : 'Aucun compte ne correspond aux filtres.'}
                </p>
            ) : (
                <div className={`${ADMIN_CARD} overflow-x-auto`}>
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
                            {filteredUsers.map(user => (
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
            )}

            {editingUser && (
                <EditUserDialog
                    user={editingUser}
                    open={!!editingUser}
                    onOpenChange={(open) => { if (!open) setEditingUser(null); }}
                    onUpdated={handleUpdated}
                />
            )}
        </section>
    );
}
