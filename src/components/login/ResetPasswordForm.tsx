"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

const schema = z.object({
    newPassword: z.string().min(7, "Minimum 7 caractères"),
    confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});
type FormValues = z.infer<typeof schema>;

function EyeButton({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="text-brand-accent-dark/70 hover:text-brand-accent-dark transition-colors"
            aria-label={visible ? "Masquer" : "Afficher"}
        >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
    );
}

interface ResetPasswordFormProps {
    token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const router = useRouter();
    const [show, setShow] = useState({ next: false, confirm: false });
    const toggle = (field: keyof typeof show) =>
        setShow((s) => ({ ...s, [field]: !s[field] }));

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    async function onSubmit(values: FormValues) {
        const res = await authClient.resetPassword({
            newPassword: values.newPassword,
            token,
        });

        if (res.error) {
            toast.error(res.error.message ?? "Lien invalide ou expiré.");
            return;
        }

        toast.success("Mot de passe réinitialisé ! Vous pouvez vous connecter.");
        router.push("/login");
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field>
                <FieldLabel htmlFor="newPassword">Nouveau mot de passe</FieldLabel>
                <InputGroup>
                    <InputGroupAddon><Lock className="h-4 w-4 text-brand-accent-dark/70" /></InputGroupAddon>
                    <InputGroupInput
                        id="newPassword"
                        type={show.next ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        aria-invalid={!!errors.newPassword}
                        {...register("newPassword")}
                    />
                    <InputGroupAddon align="inline-end">
                        <EyeButton visible={show.next} onToggle={() => toggle("next")} />
                    </InputGroupAddon>
                </InputGroup>
                <FieldError errors={[errors.newPassword]} />
            </Field>

            <Field>
                <FieldLabel htmlFor="confirmPassword">Confirmer le mot de passe</FieldLabel>
                <InputGroup>
                    <InputGroupAddon><Lock className="h-4 w-4 text-brand-accent-dark/70" /></InputGroupAddon>
                    <InputGroupInput
                        id="confirmPassword"
                        type={show.confirm ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        aria-invalid={!!errors.confirmPassword}
                        {...register("confirmPassword")}
                    />
                    <InputGroupAddon align="inline-end">
                        <EyeButton visible={show.confirm} onToggle={() => toggle("confirm")} />
                    </InputGroupAddon>
                </InputGroup>
                <FieldError errors={[errors.confirmPassword]} />
            </Field>

            <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full bg-brand-accent-dark hover:bg-brand-accent-dark/90 text-white dark:text-brand-dark flex items-center gap-2"
            >
                <ShieldCheck className="h-4 w-4" />
                {isSubmitting ? "Réinitialisation…" : "Définir le nouveau mot de passe"}
            </Button>
        </form>
    );
}
