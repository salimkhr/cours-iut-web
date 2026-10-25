'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { userCreateSchema, type UserCreateValues } from '@/lib/schemas/user-create.schema';
import type AdminUser from '@/types/AdminUser';

function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55 mb-3">
            {children}
        </p>
    );
}

interface CreateFormProps {
    onOpenChange: (open: boolean) => void;
    onCreated: (created: AdminUser) => void;
}

/**
 * Inner form — rendered only when the dialog is open, so the form is reset
 * on every open.
 */
function CreateForm({ onOpenChange, onCreated }: CreateFormProps) {
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<UserCreateValues>({
        resolver: zodResolver(userCreateSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            username: '',
            group: '',
            role: 'user',
            password: '',
        },
    });

    const onFormSubmit = async (data: UserCreateValues) => {
        setApiError(null);
        const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            setApiError((json as { error?: string }).error ?? 'Erreur lors de la création.');
            return;
        }

        onCreated((json as { user: AdminUser }).user);
        onOpenChange(false);
    };

    const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
    const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

    return (
        <>
            {/* Header */}
            <div className="relative flex items-center gap-4 px-6 py-5 pr-14 overflow-hidden bg-brand-primary">
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"/>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 shrink-0">
                    <UserPlus className="w-5 h-5 text-white" aria-hidden="true"/>
                </div>
                <DialogHeader className="p-0 space-y-0 text-left">
                    <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/60">Utilisateur</p>
                    <DialogTitle className="text-white font-bold text-xl leading-tight">
                        Créer un compte
                    </DialogTitle>
                </DialogHeader>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit(onFormSubmit)}>
                <div className="px-6 py-5 flex flex-col gap-5">

                    {/* Profil */}
                    <section>
                        <Eyebrow>Profil</Eyebrow>
                        <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="cu-firstname" className={labelCn}>Prénom *</Label>
                                    <Input
                                        id="cu-firstname"
                                        className={inputCn}
                                        aria-invalid={errors.firstName ? 'true' : 'false'}
                                        {...register('firstName')}
                                    />
                                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="cu-lastname" className={labelCn}>Nom</Label>
                                    <Input
                                        id="cu-lastname"
                                        className={inputCn}
                                        aria-invalid={errors.lastName ? 'true' : 'false'}
                                        {...register('lastName')}
                                    />
                                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="cu-email" className={labelCn}>Email *</Label>
                                <Input
                                    id="cu-email"
                                    type="email"
                                    autoComplete="off"
                                    className={inputCn}
                                    aria-invalid={errors.email ? 'true' : 'false'}
                                    {...register('email')}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="cu-username" className={labelCn}>Nom d&apos;utilisateur</Label>
                                <Input
                                    id="cu-username"
                                    autoComplete="off"
                                    className={inputCn}
                                    aria-invalid={errors.username ? 'true' : 'false'}
                                    {...register('username')}
                                />
                                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="cu-password" className={labelCn}>Mot de passe *</Label>
                                <Input
                                    id="cu-password"
                                    type="password"
                                    autoComplete="new-password"
                                    className={inputCn}
                                    aria-invalid={errors.password ? 'true' : 'false'}
                                    {...register('password')}
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                    {/* Administration */}
                    <section>
                        <Eyebrow>Administration</Eyebrow>
                        <div className="flex flex-col gap-3">
                            <div>
                                <Label htmlFor="cu-group" className={labelCn}>Groupe</Label>
                                <Input
                                    id="cu-group"
                                    className={inputCn}
                                    placeholder="F1, G2…"
                                    {...register('group')}
                                />
                            </div>
                            <div>
                                <Label htmlFor="cu-role" className={labelCn}>Rôle *</Label>
                                <Controller
                                    control={control}
                                    name="role"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="cu-role" className={cn(inputCn, "w-full")}>
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">Étudiant</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {apiError && (
                    <p className="px-6 pb-3 text-red-500 text-xs" role="alert">{apiError}</p>
                )}

                {/* Footer */}
                <div className="border-t border-bridge-700/20 dark:border-bridge-500/20 px-6 py-4 flex items-center justify-between gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-brand-dark dark:text-bridge-200"
                        onClick={() => onOpenChange(false)}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-brand-primary hover:opacity-90 text-white dark:text-brand-dark font-semibold"
                    >
                        {isSubmitting ? 'Création…' : 'Créer le compte'}
                    </Button>
                </div>
            </form>
        </>
    );
}

export default function CreateUserDialog({ onCreated }: { onCreated: (created: AdminUser) => void }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="min-h-11 gap-2 bg-brand-primary font-semibold text-white hover:opacity-90 dark:text-brand-dark">
                    <UserPlus aria-hidden="true"/>
                    Nouvel utilisateur
                </Button>
            </DialogTrigger>
            <DialogContent
                className={cn(
                    "max-w-md p-0 overflow-hidden",
                    "bg-card",
                    "border border-bridge-500/45 dark:border-bridge-500/35",
                    "shadow-[0_22px_44px_-14px_rgba(147,97,58,0.55)] dark:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.75)]",
                    "[&>button]:text-white [&>button]:ring-offset-transparent [&>button:focus-visible]:ring-white/50",
                )}
            >
                {open && (
                    <CreateForm onOpenChange={setOpen} onCreated={onCreated}/>
                )}
            </DialogContent>
        </Dialog>
    );
}
