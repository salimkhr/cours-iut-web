'use client';

import {useCallback, useEffect, useState} from 'react';
// API calls are encapsulated in a dedicated hook
import useAdminUsersApi, {UserPayload} from '@/hook/admin/useAdminUsersApi';
import User, {UserRole} from '@/types/User';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import UserForm, {UserFormData} from '@/components/admin/UserForm';
import {Clock4, Pencil, Plus, Trash2} from 'lucide-react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import Link from "next/link";

export default function AdminUsers() {
    const {listUsers, addUser, editUser, deleteUser} = useAdminUsersApi();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [extraTimeFilter, setExtraTimeFilter] = useState<'all' | 'true' | 'false'>('all');
    const [groupeFilter, setGroupeFilter] = useState<'all' | 'F' | 'G'>('all');

    const [openForm, setOpenForm] = useState(false);
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (q.trim()) params.q = q.trim();
            if (roleFilter !== 'all') params.role = roleFilter;
            if (extraTimeFilter !== 'all') params.extraTime = extraTimeFilter;
            if (groupeFilter !== 'all') params.groupe = groupeFilter;

            const list = await listUsers(params);
            setUsers(list);
        } finally {
            setLoading(false);
        }
        // listUsers  est volontairement pas ajouté au dependence
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, roleFilter, extraTimeFilter, groupeFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const onAdd = async (data: UserFormData) => {
        const created = await addUser(data as unknown as UserPayload);
        setUsers(prev => [created as User, ...prev]);
        setOpenForm(false);
    };

    const onEdit = async (data: UserFormData) => {
        if (!editingUser?._id) return;
        const updated = await editUser(String(editingUser._id), data as unknown as UserPayload);
        setUsers(prev => prev.map(u => String(u._id) === String(editingUser._id) ? (updated as User) : u));
        setOpenForm(false);
    };

    const onDelete = async (user: User) => {
        if (!confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) return;
        await deleteUser(String(user._id!));
        setUsers(prev => prev.filter(u => String(u._id) !== String(user._id)));
    };

    const openAdd = () => {
        setMode('add');
        setEditingUser(undefined);
        setOpenForm(true);
    };
    const openEdit = (u: User) => {
        setMode('edit');
        setEditingUser(u);
        setOpenForm(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <Input placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)}
                           className="w-[220px]"/>
                    <Select value={roleFilter} onValueChange={(v: UserRole | 'all') => setRoleFilter(v)}>
                        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Rôle"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les rôles</SelectItem>
                            <SelectItem value="student">student</SelectItem>
                            <SelectItem value="admin">admin</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={extraTimeFilter}
                            onValueChange={(v: 'all' | 'true' | 'false') => setExtraTimeFilter(v)}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tiers temps"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Avec - Sans 1/3 temps</SelectItem>
                            <SelectItem value="true">Avec 1/3 temps</SelectItem>
                            <SelectItem value="false">Sans 1/3 temps</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={groupeFilter}
                            onValueChange={(v: 'all' | 'F' | 'G') => setGroupeFilter(v)}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Groupe"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les groupes</SelectItem>
                            <SelectItem value="F">F</SelectItem>
                            <SelectItem value="G">G</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={openAdd} variant="outline"><Plus className="mr-2"/>Ajouter</Button>
            </div>
            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Photo</TableHead>
                            <TableHead>Login</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Prénom</TableHead>
                            <TableHead>Groupe</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>1/3</TableHead>
                            <TableHead>Rôle</TableHead>


                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(u => (
                            <TableRow key={String(u._id)}>
                                <TableCell>{u.scodocId || ''}</TableCell>
                                <TableCell>{u.login}</TableCell>
                                <TableCell>{u.lastName}</TableCell>
                                <TableCell>{u.firstName}</TableCell>
                                <TableCell>{u.groupe}</TableCell>
                                <TableCell><Link target="_blank" href={`mailto:${u.email}`}
                                                 className="text-blue-500">{u.email}</Link></TableCell>
                                <TableCell>{!u.extraTime ? <Clock4/> : null}</TableCell>
                                <TableCell>{u.role}</TableCell>

                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => openEdit(u)}><Pencil
                                        className="size-4"/></Button>
                                    <Button size="sm" variant="outline" className="text-red-600"
                                            onClick={() => onDelete(u)}><Trash2
                                        className="size-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7}
                                           className="text-center text-muted-foreground">{loading ? 'Chargement...' : 'Aucun utilisateur'}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <UserForm
                open={openForm}
                onOpenChange={setOpenForm}
                mode={mode}
                user={editingUser}
                onSubmit={mode === 'add' ? onAdd : onEdit}
            />
        </div>
    );
}
