'use client';

import {useEffect, useState} from 'react';
import axios from 'axios';
import User, {UserRole} from '@/types/User';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import UserForm, {UserFormData} from '@/components/admin/UserForm';
import {Pencil, Plus, Trash2} from 'lucide-react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [extraTimeFilter, setExtraTimeFilter] = useState<'all' | 'true' | 'false'>('all');

    const [openForm, setOpenForm] = useState(false);
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (q.trim()) params.q = q.trim();
            if (roleFilter !== 'all') params.role = roleFilter;
            if (extraTimeFilter !== 'all') params.extraTime = extraTimeFilter;
            const res = await axios.get('/api/admin/users', {params});
            setUsers(res.data.users || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [q, roleFilter, extraTimeFilter]);

    const onAdd = async (data: UserFormData) => {
        const res = await axios.post('/api/admin/users', data, {headers: {'Content-Type': 'application/json'}});
        if (res.status >= 200 && res.status < 300) {
            setUsers(prev => [res.data.user as User, ...prev]);
            setOpenForm(false);
        }
    };

    const onEdit = async (data: UserFormData) => {
        if (!editingUser?._id) return;
        const res = await axios.put(`/api/admin/users/${editingUser._id}`, data, {headers: {'Content-Type': 'application/json'}});
        if (res.status >= 200 && res.status < 300) {
            setUsers(prev => prev.map(u => String(u._id) === String(editingUser._id) ? (res.data.user as User) : u));
            setOpenForm(false);
        }
    };

    const onDelete = async (user: User) => {
        if (!confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) return;
        await axios.delete(`/api/admin/users/${user._id}`);
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
                    <Input placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} className="w-[220px]" />
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
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="true">Tiers temps</SelectItem>
                            <SelectItem value="false">Sans tiers temps</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={openAdd} variant="outline"><Plus className="mr-2"/>Ajouter</Button>
            </div>
            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Prénom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Tiers temps</TableHead>
                            <TableHead>scodocId</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(u => (
                            <TableRow key={String(u._id)}>
                                <TableCell>{u.lastName}</TableCell>
                                <TableCell>{u.firstName}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.role}</TableCell>
                                <TableCell>{u.extraTime ? 'Oui' : 'Non'}</TableCell>
                                <TableCell>{u.scodocId || ''}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => openEdit(u)}><Pencil
                                        className="size-4"/></Button>
                                    <Button size="sm" variant="destructive" onClick={() => onDelete(u)}><Trash2
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
