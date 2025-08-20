"use client";

import {useForm} from "react-hook-form";
import User, {UserRole} from "@/types/User";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {useEffect} from "react";

export type UserFormData = Omit<User, "_id">;

interface UserFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'add' | 'edit';
    user?: User;
    onSubmit: (data: UserFormData) => void;
}

export default function UserForm({open, onOpenChange, mode, user, onSubmit}: UserFormProps) {
    const {register, handleSubmit, reset, setValue, formState: {errors}} = useForm<UserFormData>({
        defaultValues: {
            lastName: '',
            firstName: '',
            email: '',
            role: 'student',
            extraTime: false,
            scodocId: ''
        }
    });

    useEffect(() => {
        if (mode === 'edit' && user) {
            reset({
                lastName: user.lastName,
                firstName: user.firstName,
                email: user.email,
                role: user.role,
                extraTime: !!user.extraTime,
                scodocId: user.scodocId || ''
            });
        } else if (mode === 'add') {
            reset({lastName: '', firstName: '', email: '', role: 'student', extraTime: false, scodocId: ''});
        }
    }, [mode, user, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{mode === 'add' ? 'Ajouter un utilisateur' : 'Modifier un utilisateur'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Nom</Label>
                            <Input {...register('lastName', {required: 'Nom requis'})} />
                            {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
                        </div>
                        <div>
                            <Label>Prénom</Label>
                            <Input {...register('firstName', {required: 'Prénom requis'})} />
                            {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <Label>Email</Label>
                            <Input type="email" {...register('email', {required: 'Email requis'})} />
                            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                        </div>
                        <div>
                            <Label>Rôle</Label>
                            <Select onValueChange={(v: UserRole)=> setValue('role', v)} defaultValue={mode === 'edit' && user ? user.role : 'student'}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">student</SelectItem>
                                    <SelectItem value="admin">admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>scodocId</Label>
                            <Input {...register('scodocId')} />
                        </div>
                        <div className="flex items-center gap-3 md:col-span-2">
                            <Switch id="extraTime" {...register('extraTime')} />
                            <Label htmlFor="extraTime">Tiers temps</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                        <Button type="submit">{mode === 'add' ? 'Ajouter' : 'Enregistrer'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
