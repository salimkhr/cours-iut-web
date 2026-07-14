'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserCog, ShieldBan, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { userEditSchema, type UserEditValues } from '@/lib/schemas/user-edit.schema';
import type { AdminUser } from './UsersTable';

function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55 mb-3">
            {children}
        </p>
    );
}

interface EditUserDialogProps {
    user: AdminUser;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated: (updated: AdminUser) => void;
}

interface EditFormProps {
    user: AdminUser;
    onOpenChange: (open: boolean) => void;
    onUpdated: (updated: AdminUser) => void;
}

/**
 * Inner form — rendered only when the dialog is open, so state initialises
 * fresh from `user` on every open (no useEffect + setState needed).
 */
function EditForm({ user, onOpenChange, onUpdated }: EditFormProps) {
    const [bannedState, setBannedState] = useState(user.banned ?? false);
    const [banning, setBanning] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<UserEditValues>({
        resolver: zodResolver(userEditSchema),
        defaultValues: {
            firstName: user.name.split(' ').slice(0, -1).join(' ') || user.name,
            lastName: user.name.split(' ').slice(-1)[0] ?? '',
            email: user.email,
            username: user.username ?? undefined,
            group: user.group ?? '',
            role: user.role === 'admin' ? 'admin' : 'user',
        },
    });

    const onFormSubmit = async (data: UserEditValues) => {
        setApiError(null);
        const res = await fetch(`/api/admin/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            setApiError((json as { error?: string }).error ?? 'Erreur lors de la mise à jour.');
            return;
        }

        onUpdated({
            ...user,
            name: data.lastName ? `${data.firstName} ${data.lastName}` : data.firstName,
            email: data.email,
            username: data.username || null,
            group: data.group || null,
            role: data.role,
            banned: bannedState,
        });
        onOpenChange(false);
    };

    const handleBanToggle = async () => {
        setBanning(true);
        setApiError(null);
        try {
            const newBanned = !bannedState;
            const res = await fetch(`/api/admin/users/${user.id}/ban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ banned: newBanned }),
            });

            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                setApiError((json as { error?: string }).error ?? 'Erreur lors du ban/unban.');
                return;
            }

            setBannedState(newBanned);
            onUpdated({ ...user, banned: newBanned });
        } finally {
            setBanning(false);
        }
    };

    const inputCn = "bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45 focus-visible:ring-bridge-500/50";
    const labelCn = "text-sm font-semibold text-brand-dark dark:text-bridge-200";

    return (
        <>
            {/* Header */}
            <div className="relative flex items-center gap-4 px-6 py-5 pr-14 overflow-hidden bg-brand-primary">
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"/>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 shrink-0">
                    <UserCog className="w-5 h-5 text-white" aria-hidden="true"/>
                </div>
                <DialogHeader className="p-0 space-y-0 text-left">
                    <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/60">Utilisateur</p>
                    <DialogTitle className="text-white font-bold text-xl leading-tight">
                        Modifier le compte
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
                                    <Label htmlFor="eu-firstname" className={labelCn}>Prénom *</Label>
                                    <Input
                                        id="eu-firstname"
                                        className={inputCn}
                                        aria-invalid={errors.firstName ? 'true' : 'false'}
                                        {...register('firstName')}
                                    />
                                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="eu-lastname" className={labelCn}>Nom</Label>
                                    <Input
                                        id="eu-lastname"
                                        className={inputCn}
                                        aria-invalid={errors.lastName ? 'true' : 'false'}
                                        {...register('lastName')}
                                    />
                                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="eu-email" className={labelCn}>Email *</Label>
                                <Input
                                    id="eu-email"
                                    type="email"
                                    className={inputCn}
                                    aria-invalid={errors.email ? 'true' : 'false'}
                                    {...register('email')}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="eu-username" className={labelCn}>Nom d&apos;utilisateur</Label>
                                <Input
                                    id="eu-username"
                                    className={inputCn}
                                    aria-invalid={errors.username ? 'true' : 'false'}
                                    {...register('username')}
                                />
                                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                    {/* Administration */}
                    <section>
                        <Eyebrow>Administration</Eyebrow>
                        <div className="flex flex-col gap-3">
                            <div>
                                <Label htmlFor="eu-group" className={labelCn}>Groupe</Label>
                                <Input
                                    id="eu-group"
                                    className={inputCn}
                                    placeholder="F1, G2…"
                                    {...register('group')}
                                />
                            </div>
                            <div>
                                <Label htmlFor="eu-role" className={labelCn}>Rôle *</Label>
                                <Controller
                                    control={control}
                                    name="role"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="eu-role" className={cn(inputCn, "w-full")}>
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

                    <div className="h-px bg-bridge-700/20 dark:bg-bridge-500/20 -mx-6"/>

                    {/* Accès */}
                    <section>
                        <Eyebrow>Accès</Eyebrow>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleBanToggle}
                            disabled={banning}
                            className={cn(
                                "w-full justify-start gap-2 text-sm font-semibold",
                                bannedState
                                    ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                    : "text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            )}
                        >
                            {bannedState
                                ? <ShieldCheck className="w-4 h-4"/>
                                : <ShieldBan className="w-4 h-4"/>
                            }
                            {banning
                                ? 'Traitement…'
                                : bannedState
                                    ? 'Débannir cet utilisateur'
                                    : 'Bannir cet utilisateur'
                            }
                        </Button>
                    </section>
                </div>

                {apiError && (
                    <p className="px-6 pb-3 text-red-500 text-xs">{apiError}</p>
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
                        {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
                    </Button>
                </div>
            </form>
        </>
    );
}

export default function EditUserDialog({ user, open, onOpenChange, onUpdated }: EditUserDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <EditForm user={user} onOpenChange={onOpenChange} onUpdated={onUpdated}/>
                )}
            </DialogContent>
        </Dialog>
    );
}
