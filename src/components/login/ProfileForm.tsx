"use client";

import {useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Camera, Save, User, X} from "lucide-react";
import {toast} from "sonner";

import {authClient} from "@/lib/auth-client";
import {Button} from "@/components/ui/button";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {Field, FieldError, FieldLabel} from "@/components/ui/field";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {GROUPS, Group, STUDENT_EMAIL_DOMAIN} from "@/lib/schemas/register.schema";
import {createProfileSchema, ProfileValues} from "@/lib/schemas/profile.schema";

type Props = {
    initialFirstName: string;
    initialLastName: string;
    email: string;
    imageUrl: string | null;
    group: Group | null;
};

export default function ProfileForm({initialFirstName, initialLastName, email, imageUrl, group}: Props) {
    const router = useRouter();
    const [preview, setPreview] = useState<string | null>(imageUrl);
    const [pictureChanged, setPictureChanged] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isStudent = email.endsWith(STUDENT_EMAIL_DOMAIN);

    const {register, handleSubmit, control, formState: {errors, isSubmitting}} = useForm<ProfileValues>({
        resolver: zodResolver(createProfileSchema(email)),
        defaultValues: {
            firstName: initialFirstName,
            lastName: initialLastName,
            group: group ?? undefined,
        },
    });

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, onChange: (f: File) => void) {
        const file = e.target.files?.[0];
        if (!file) return;
        onChange(file);
        setPreview(URL.createObjectURL(file));
        setPictureChanged(true);
    }

    function removePicture(onChange: (f: File | undefined) => void) {
        onChange(undefined as unknown as File);
        setPreview(null);
        setPictureChanged(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function onSubmit(values: ProfileValues) {
        let imageUrl: string | undefined | null = undefined;

        if (pictureChanged) {
            if (values.picture instanceof File) {
                const fd = new FormData();
                fd.append("file", values.picture);
                const res = await fetch("/api/upload-avatar", {method: "POST", body: fd});
                if (!res.ok) {
                    const {error} = await res.json();
                    toast.error(error ?? "Échec de l'upload.");
                    return;
                }
                const {url} = await res.json();
                imageUrl = url;
            } else {
                imageUrl = null; // suppression de l'avatar
            }
        }

        const updateData: Record<string, unknown> = {
            name: `${values.firstName} ${values.lastName}`,
            group: values.group ?? null,
        };
        if (imageUrl !== undefined) updateData.image = imageUrl;

        const res = await (authClient.updateUser as (data: Record<string, unknown>) => Promise<{error?: {message?: string}}>)(updateData);

        if (res?.error) {
            toast.error(res.error.message ?? "Mise à jour impossible.");
            return;
        }

        toast.success("Profil mis à jour !");
        setPictureChanged(false);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* ── Avatar ── */}
            <Field>
                <FieldLabel>Photo de profil</FieldLabel>
                <Controller
                    name="picture"
                    control={control}
                    render={({field: {onChange, value: _value, ...field}}) => (
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center bg-muted ${preview ? "border-brand-accent-dark" : "border-dashed border-border"}`}>
                                    {preview ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={preview} alt="Avatar" className="w-full h-full object-cover"/>
                                    ) : (
                                        <Camera className="h-6 w-6 text-muted-foreground"/>
                                    )}
                                </div>
                                {preview && (
                                    <button type="button" onClick={() => removePicture(onChange)}
                                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive hover:bg-destructive/80 flex items-center justify-center shadow transition-colors"
                                        aria-label="Supprimer la photo">
                                        <X className="h-3 w-3 text-white"/>
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-input text-sm hover:bg-accent transition-colors">
                                    <Camera className="h-3.5 w-3.5"/>
                                    {preview ? "Changer" : "Choisir une photo"}
                                </button>
                                <p className="text-xs text-muted-foreground">JPG, PNG, WebP — max 5 Mo</p>
                            </div>
                            <input {...field} ref={fileInputRef} type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                                onChange={(e) => handleFileChange(e, onChange)}/>
                        </div>
                    )}
                />
                <FieldError errors={[errors.picture]}/>
            </Field>

            {/* ── Prénom / Nom ── */}
            <div className="grid grid-cols-2 gap-4">
                <Field>
                    <FieldLabel htmlFor="firstName">Prénom</FieldLabel>
                    <InputGroup>
                        <InputGroupAddon><User className="h-4 w-4 text-brand-accent-dark/70"/></InputGroupAddon>
                        <InputGroupInput id="firstName" placeholder="Jean" aria-invalid={!!errors.firstName}
                            {...register("firstName")}/>
                    </InputGroup>
                    <FieldError errors={[errors.firstName]}/>
                </Field>

                <Field>
                    <FieldLabel htmlFor="lastName">Nom</FieldLabel>
                    <InputGroup>
                        <InputGroupAddon><User className="h-4 w-4 text-brand-accent-dark/70"/></InputGroupAddon>
                        <InputGroupInput id="lastName" placeholder="Dupont" aria-invalid={!!errors.lastName}
                            {...register("lastName")}/>
                    </InputGroup>
                    <FieldError errors={[errors.lastName]}/>
                </Field>
            </div>

            {/* ── Groupe (étudiants uniquement) ── */}
            {isStudent && (
                <Field>
                    <FieldLabel>Groupe TD</FieldLabel>
                    <Controller name="group" control={control}
                        render={({field}) => (
                            <Select
                                onValueChange={(v) => field.onChange(v === "__none__" ? undefined : v)}
                                value={field.value ?? "__none__"}
                            >
                                <SelectTrigger className="w-full" aria-invalid={!!errors.group}>
                                    <SelectValue placeholder="Choisir…"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__" disabled>—</SelectItem>
                                    {GROUPS.map((g) => (
                                        <SelectItem key={g} value={g}>{g}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <FieldError errors={[errors.group]}/>
                </Field>
            )}

            <Button type="submit" disabled={isSubmitting} size="lg"
                className="w-full bg-brand-accent-dark hover:bg-brand-accent-dark/90 text-white dark:text-brand-dark flex items-center gap-2">
                <Save className="h-4 w-4"/>
                {isSubmitting ? "Enregistrement…" : "Enregistrer les modifications"}
            </Button>
        </form>
    );
}
