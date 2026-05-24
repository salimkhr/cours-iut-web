"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import {Eye, EyeOff, Hash, Lock, Mail, Sparkles, User, UserPlus} from "lucide-react";
import {toast} from "sonner";
import {Controller, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

import {authClient} from "@/lib/auth-client";
import {Button} from "@/components/ui/button";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {Field, FieldError, FieldLabel} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {GROUPS, registerSchema, RegisterValues, STUDENT_EMAIL_DOMAIN} from "@/lib/schemas/register.schema";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toEmailPart(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")   // supprime les accents
        .replace(/['\s-]+/g, ".")           // espaces, tirets, apostrophes → point
        .replace(/[^a-z0-9.]/g, "")        // supprime les autres caractères spéciaux
        .replace(/\.+/g, ".")              // collapse les points multiples
        .replace(/^\.|\.$/, "");           // trim les points en début/fin
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RegisterForm() {
    const router = useRouter();
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isEmailManual, setIsEmailManual] = useState(false);

    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_TOKEN;
    const captchaRequired = !!sitekey;

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: {errors, isSubmitting},
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
    });

    const watchedFirstName = useWatch({control, name: "firstName"});
    const watchedLastName = useWatch({control, name: "lastName"});
    const watchedEmail = useWatch({control, name: "email"});
    const isStudent = (watchedEmail ?? "").endsWith(STUDENT_EMAIL_DOMAIN);

    useEffect(() => {
        if (!isStudent) setValue("group", undefined);
    }, [isStudent, setValue]);


    // ── Turnstile ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!sitekey) return;
        let widgetId: string | null = null;
        const checkTurnstile = () => {
            if (window.turnstile) {
                const container = document.querySelector(".captcha-container");
                if (container && container.innerHTML === "") {
                    widgetId = window.turnstile.render(".captcha-container", {
                        sitekey,
                        callback: (token: string) => setCaptchaToken(token),
                        theme: "auto",
                    });
                }
            } else {
                setTimeout(checkTurnstile, 100);
            }
        };
        checkTurnstile();
        return () => {
            if (widgetId && window.turnstile) try { window.turnstile.remove(widgetId); } catch { /* widget déjà nettoyé */ }
        };
    }, [sitekey]);

    function resetCaptcha() {
        if (window.turnstile) {
            window.turnstile.reset();
            setCaptchaToken(null);
        }
    }

    // ── Email auto-complétion ─────────────────────────────────────────────────

    const emailAutoFilled = !isEmailManual
        && !!(toEmailPart(watchedFirstName ?? "") || toEmailPart(watchedLastName ?? ""));

    useEffect(() => {
        if (isEmailManual) return;
        const first = toEmailPart(watchedFirstName ?? "");
        const last = toEmailPart(watchedLastName ?? "");
        if (!first && !last) return;
        const suggested = [first, last].filter(Boolean).join(".") + STUDENT_EMAIL_DOMAIN;
        setValue("email", suggested, {shouldValidate: false, shouldDirty: false, shouldTouch: false});
    }, [isEmailManual, watchedFirstName, watchedLastName, setValue]);

    // ── Submit ────────────────────────────────────────────────────────────────

    async function onSubmit(values: RegisterValues) {

        const fetchOptions = captchaToken
            ? {headers: {"x-captcha-response": captchaToken}}
            : undefined;

        try {
            type SignUpResult = {data?: {session?: unknown} | null; error?: {message?: string} | null};
            const res = await (authClient.signUp.email as unknown as (data: Record<string, unknown>) => Promise<SignUpResult>)({
                name: `${values.firstName} ${values.lastName}`,
                email: values.email,
                username: values.identifier,
                password: values.password,
                group: values.group,
                fetchOptions,
            });

            if (res.error) {
                toast.error(res.error.message ?? "Inscription impossible.");
                resetCaptcha();
                return;
            }

            const needsVerification = !res.data?.session;
            if (needsVerification) {
                toast.success("Compte créé !", {
                    description: `Un lien de confirmation a été envoyé à ${values.email}.`,
                    duration: 8000,
                });
            } else {
                toast.success("Compte créé avec succès !");
                router.refresh();
            }

            reset();
            resetCaptcha();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : String(err));
            resetCaptcha();
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            {sitekey && (
                <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                    async
                    defer
                />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* ── Prénom / Nom ── */}
                <div className="grid grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel htmlFor="firstName">Prénom</FieldLabel>
                        <InputGroup>
                            <InputGroupAddon><User className="h-4 w-4 text-brand-accent-dark/70"/></InputGroupAddon>
                            <InputGroupInput
                                id="firstName"
                                placeholder="Jean"
                                autoComplete="given-name"
                                aria-invalid={!!errors.firstName}
                                {...register("firstName")}
                            />
                        </InputGroup>
                        <FieldError className="text-brand-accent-dark" errors={[errors.firstName]}/>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="lastName">Nom</FieldLabel>
                        <InputGroup>
                            <InputGroupAddon><User className="h-4 w-4 text-brand-accent-dark/70"/></InputGroupAddon>
                            <InputGroupInput
                                id="lastName"
                                placeholder="Dupont"
                                autoComplete="family-name"
                                aria-invalid={!!errors.lastName}
                                {...register("lastName")}
                            />
                        </InputGroup>
                        <FieldError className="text-brand-accent-dark" errors={[errors.lastName]}/>
                    </Field>
                </div>

                {/* ── Email ── */}
                <Field>
                    <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="email">Email universitaire</FieldLabel>
                        {emailAutoFilled && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Sparkles className="h-3 w-3"/>
                                Suggéré — modifiable
                            </span>
                        )}
                    </div>
                    <InputGroup>
                        <InputGroupAddon><Mail className="h-4 w-4 text-brand-accent-dark/70"/></InputGroupAddon>
                        <InputGroupInput
                            id="email"
                            type="email"
                            placeholder={`prenom.nom${STUDENT_EMAIL_DOMAIN}`}
                            autoComplete="email"
                            aria-invalid={!!errors.email}
                            {...register("email", {
                                onChange: () => setIsEmailManual(true),
                            })}
                        />
                    </InputGroup>
                    <FieldError className="text-brand-accent-dark" errors={[errors.email]}/>
                </Field>

                {/* ── Identifiant + Groupe (étudiants) ── */}
                <div className={isStudent ? "grid grid-cols-2 gap-4" : undefined}>
                    <Field>
                        <FieldLabel htmlFor="identifier">Identifiant</FieldLabel>
                        <InputGroup>
                            <InputGroupAddon><Hash className="h-4 w-4 text-brand-accent-dark/70"/></InputGroupAddon>
                            <InputGroupInput
                                id="identifier"
                                placeholder="ab123456"
                                autoComplete="username"
                                aria-invalid={!!errors.identifier}
                                {...register("identifier")}
                            />
                        </InputGroup>
                        <FieldError className="text-brand-accent-dark" errors={[errors.identifier]}/>
                    </Field>

                    {isStudent && (
                        <Field>
                            <FieldLabel>Groupe TD</FieldLabel>
                            <Controller
                                name="group"
                                control={control}
                                render={({field}) => (
                                    <Select
                                        onValueChange={(v) => field.onChange(v === "__none__" ? undefined : v)}
                                        value={field.value ?? "__none__"}
                                    >
                                        <SelectTrigger
                                            className="w-full"
                                            aria-invalid={!!errors.group}
                                        >
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
                            <FieldError className="text-brand-accent-dark" errors={[errors.group]}/>
                        </Field>
                    )}
                </div>

                {/* ── Mot de passe ── */}
                <Field>
                    <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                    <InputGroup>
                        <InputGroupAddon><Lock className="h-4 w-4 text-brand-accent-dark/70"/></InputGroupAddon>
                        <InputGroupInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            aria-invalid={!!errors.password}
                            {...register("password")}
                        />
                        <InputGroupAddon align="inline-end">
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="text-brand-accent-dark/70 hover:text-brand-accent-dark transition-colors"
                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                            </button>
                        </InputGroupAddon>
                    </InputGroup>
                    <FieldError className="text-brand-accent-dark" errors={[errors.password]}/>
                </Field>

                {/* ── Captcha ── */}
                {sitekey && <div className="captcha-container"/>}

                {/* ── Submit ── */}
                <Button
                    type="submit"
                    disabled={isSubmitting || (captchaRequired && !captchaToken)}
                    size="lg"
                    className="group w-full h-auto rounded-lg bg-brand-accent-dark text-white hover:bg-brand-accent-dark hover:-translate-y-0.5 border-2 border-brand-accent-dark px-6 py-3 text-sm font-semibold tracking-wide shadow-[0_8px_24px_-10px_rgba(194,65,12,0.55)] hover:shadow-[0_14px_36px_-12px_rgba(194,65,12,0.75)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? "Inscription…" : captchaRequired && !captchaToken ? "Validation du captcha…" : (
                        <>
                            <UserPlus className="h-4 w-4"/>
                            S&apos;inscrire
                        </>
                    )}
                </Button>
            </form>

            <p className="text-center text-sm mt-6 text-muted-foreground">
                Déjà un compte ?{" "}
                <Link href="/login" className="font-bold underline underline-offset-4 text-brand-accent-dark hover:opacity-80">
                    Se connecter
                </Link>
            </p>
        </>
    );
}
