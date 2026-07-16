'use client';

import { useCallback, useMemo, useState } from 'react';
import { Pencil, Search } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import EditUserDialog from './EditUserDialog';
import DeleteUserDialog from './DeleteUserDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminDataTable from '@/components/admin/ui/AdminDataTable';
import { avatarColor, avatarInitials, cn } from '@/lib/utils';
import type AdminUser from '@/types/AdminUser';

export type { default as AdminUser } from '@/types/AdminUser';

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

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function UsersTable({ users: initialUsers }: { users: AdminUser[] }) {
    const [users, setUsers] = useState<AdminUser[]>(initialUsers);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

    const handleDeleted = useCallback((userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
    }, []);

    const handleUpdated = useCallback((updated: AdminUser) => {
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    }, []);

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

    const columns = useMemo<ColumnDef<AdminUser>[]>(() => [
        {
            accessorKey: 'name',
            header: 'Utilisateur',
            cell: ({ row }) => {
                const user = row.original;
                const initials = avatarInitials(user.name);
                const color = avatarColor(user.name);

                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="size-9 shrink-0">
                            <AvatarImage src={user.image ?? undefined} alt={user.name}/>
                            <AvatarFallback className="text-xs font-semibold text-white" style={{ backgroundColor: color }}>
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-1.5">
                                <p className="truncate text-sm font-semibold text-brand-dark dark:text-bridge-100">
                                    {user.name}
                                </p>
                                {user.banned && (
                                    <Badge
                                        variant="outline"
                                        className="border-destructive/25 bg-destructive/10 text-destructive dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-400"
                                    >
                                        Banni
                                    </Badge>
                                )}
                            </div>
                            <p className="truncate text-xs text-bridge-500 dark:text-bridge-400">
                                {user.email}
                            </p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'group',
            header: 'Groupe',
            cell: ({ row }) => (
                <p className="text-sm text-bridge-600 dark:text-bridge-400">
                    {row.original.group ?? '—'}
                </p>
            ),
        },
        {
            accessorKey: 'role',
            header: 'Rôle',
            cell: ({ row }) => {
                const isAdmin = row.original.role === 'admin';

                return (
                    <Badge
                        variant="outline"
                        className={cn(
                            isAdmin
                                ? 'border-brand-primary bg-brand-primary text-white dark:text-brand-dark'
                                : 'border-bridge-500/30 bg-bridge-200/60 text-bridge-700 dark:bg-bridge-700/60 dark:text-bridge-300'
                        )}
                    >
                        {isAdmin ? 'Admin' : 'Étudiant'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'createdAt',
            header: 'Inscrit le',
            cell: ({ row }) => (
                <p className="text-xs text-bridge-500 dark:text-bridge-400">
                    {formatDate(row.original.createdAt)}
                </p>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-11 text-bridge-600 hover:bg-brand-primary/10 hover:text-brand-primary dark:text-bridge-300"
                        aria-label={`Modifier ${row.original.name}`}
                        onClick={() => setEditingUser(row.original)}
                    >
                        <Pencil aria-hidden="true"/>
                    </Button>
                    <DeleteUserDialog
                        userId={row.original.id}
                        userName={row.original.name}
                        onDeleted={handleDeleted}
                    />
                </div>
            ),
        },
    ], [handleDeleted]);

    return (
        <section className="flex flex-col gap-4">
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

            <AdminDataTable
                columns={columns}
                data={filteredUsers}
                emptyMessage={users.length === 0 ? 'Aucun utilisateur trouvé.' : 'Aucun compte ne correspond aux filtres.'}
            />

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
