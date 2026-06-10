'use client';

import { Pencil } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { avatarColor, avatarInitials } from '@/lib/utils';
import DeleteUserDialog from './DeleteUserDialog';
import type { AdminUser } from './UsersTable';

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

interface UserRowProps {
    user: AdminUser;
    onDeleted: (userId: string) => void;
    onEdit: (user: AdminUser) => void;
}

export default function UserRow({ user, onDeleted, onEdit }: UserRowProps) {
    const isAdmin = user.role === 'admin';
    const initials = avatarInitials(user.name);
    const color = avatarColor(user.name);

    return (
        <tr className="border-b border-bridge-700/10 dark:border-bridge-500/10 last:border-b-0">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <Avatar className="size-9 flex-shrink-0">
                        <AvatarImage src={user.image ?? undefined} alt={user.name} />
                        <AvatarFallback className="text-white text-xs font-semibold" style={{ backgroundColor: color }}>
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-brand-dark dark:text-bridge-100 truncate">
                                {user.name}
                            </p>
                            {user.banned && (
                                <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/15 text-red-500">
                                    Banni
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-bridge-500 dark:text-bridge-400 truncate">
                            {user.email}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <p className="text-sm text-bridge-600 dark:text-bridge-400">
                    {user.group ?? '—'}
                </p>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    isAdmin
                        ? 'bg-brand-primary text-white dark:text-brand-dark'
                        : 'bg-bridge-200/60 dark:bg-bridge-700/60 text-bridge-700 dark:text-bridge-300'
                }`}>
                    {isAdmin ? 'Admin' : 'Étudiant'}
                </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <p className="text-xs text-bridge-500 dark:text-bridge-400">
                    {formatDate(user.createdAt)}
                </p>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-bridge-400 hover:text-brand-primary hover:bg-brand-primary/10"
                        aria-label={`Modifier ${user.name}`}
                        onClick={() => onEdit(user)}
                    >
                        <Pencil className="w-4 h-4"/>
                    </Button>
                    <DeleteUserDialog userId={user.id} userName={user.name} onDeleted={onDeleted} />
                </div>
            </td>
        </tr>
    );
}
