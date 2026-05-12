"use client";

import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import {AlertCircle, Camera, CheckCircle2, Eye, EyeOff, Lock, Mail, User, UserPlus, X} from "lucide-react";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

import {authClient} from "@/lib/auth-client";
import {Button} from "@/components/ui/button";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {Label} from "@/components/ui/label";
import {registerSchema, RegisterValues} from "@/lib/schemas/register.schema";

// ─── Turnstile types ────────────────────────────────────────────────────────────

interface TurnstileOptions {
    sitekey: string;
    callback?: (token: string) => void;
    "error-callback"?: () => void;
    "expired-callback"?: () => void;
    "timeout-callback"?: () => void;
    theme?: "light" | "dark" | "auto";
    size?: "normal" | "compact";
    tabindex?: number;
    action?: string;
    cData?: string;
    language?: string;
    appearance?: "always" | "execute" | "interaction-only";
}

declare global {
    interface Window {
        turnstile: {
            render: (container: string | HTMLElement, options: TurnstileOptions) => string;
            reset: (widgetId?: string) => void;
            remove: (widgetId: string) => void;
        };
    }
}

const SCHOOL_DOMAIN = "salimkhraimeche.dev";

// ─── Component ─────────────────────────────────────────────────────────────────

export default function RegisterForm() {
    const router = useRouter();
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_TOKEN;
    const captchaRequired = !!sitekey;

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: {errors, isSubmitting},
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
    });

    // ── Turnstile ────────────────────────────────────────────────────────────────

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
            if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
        };
    }, [sitekey]);

    function resetCaptcha() {
        if (window.turnstile) {
            window.turnstile.reset();
            setCaptchaToken(null);
        }
    }

    // ── Submit ───────────────────────────────────────────────────────────────────

    async function onSubmit(values: RegisterValues) {
        setServerError(null);

        if (captchaRequired && !captchaToken) {
            setServerError("Veuillez valider le captcha");
            return;
        }

        const isEmail = values.identifier.includes("@");
        const email = isEmail ? values.identifier : `${values.identifier}@${SCHOOL_DOMAIN}`;
        const username = isEmail ? values.identifier.split("@")[0] : values.identifier;

        const fetchOptions = captchaToken
            ? {headers: {"x-captcha-response": captchaToken}}
            : undefined;

        try {
            const res = await authClient.signUp.email({
                name: values.name,
                email,
                username,
                password: values.password,
                fetchOptions,
            });

            if (res.error) {
                setServerError(res.error.message ?? "Inscription impossible.");
                resetCaptcha();
                return;
            }

            setSuccess(true);
            reset();
            setPreview(null);
            resetCaptcha();
            router.refresh();
        } catch (err) {
            setServerError(err instanceof Error ? err.message : String(err));
            resetCaptcha();
        }
    }

    // ── Picture helpers ──────────────────────────────────────────────────────────

    function handleFileChange(
        e: React.ChangeEvent<HTMLInputElement>,
        onChange: (file: File) => void
    ) {
        const file = e.target.files?.[0];
        if (!file) return;
        onChange(file);
        setPreview(URL.createObjectURL(file));
    }

    function removePicture(onChange: (file: File | undefined) => void) {
        onChange(undefined as unknown as File);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    // ── Render ───────────────────────────────────────────────────────────────────

    return (
        <>
            {sitekey && (
                <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                    async
                    defer
                />
            )}

            {/* Success */}
            {success && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 mb-5">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5"/>
                    <p className="text-sm text-green-700 dark:text-green-300">
                        Compte créé avec succès !
                    </p>
                </div>
            )}

            {/* Server error */}
            {serverError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 mb-5">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5"/>
                    <p className="text-sm text-red-700 dark:text-red-300">{serverError}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* ── Name ── */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-brand-dark dark:text-brand-light">
                        Nom
                    </Label>
                    <InputGroup>
                        <InputGroupInput
                            id="name"
                            type="text"
                            placeholder="Votre nom"
                            autoComplete="name"
                            {...register("name")}
                        />
                        <InputGroupAddon>
                            <User className="h-5 w-5 text-brand-accent-dark/70"/>
                        </InputGroupAddon>
                    </InputGroup>
                    {errors.name && (
                        <p className="text-xs text-red-500">{errors.name.message}</p>
                    )}
                </div>

                {/* ── Identifier ── */}
                <div className="space-y-2">
                    <Label htmlFor="identifier" className="text-brand-dark dark:text-brand-light">
                        Identifiant
                    </Label>
                    <InputGroup>
                        <InputGroupInput
                            id="identifier"
                            type="text"
                            placeholder="votre identifiant"
                            autoComplete="username"
                            {...register("identifier")}
                        />
                        <InputGroupAddon>
                            <Mail className="h-5 w-5 text-brand-accent-dark/70"/>
                        </InputGroupAddon>
                    </InputGroup>
                    {errors.identifier && (
                        <p className="text-xs text-red-500">{errors.identifier.message}</p>
                    )}
                </div>

                {/* ── Password ── */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-brand-dark dark:text-brand-light">
                        Mot de passe
                    </Label>

                    <InputGroup className="relative">
                        <InputGroupInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            {...register("password")}
                        />

                        {/* LOCK à gauche */}
                        <InputGroupAddon>
                            <Lock className="h-5 w-5 text-brand-accent-dark/70" />
                        </InputGroupAddon>

                        {/* 👁️ Oeil à droite (FORCÉ) */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="text-brand-accent-dark/70 hover:text-brand-accent-dark transition-colors"
                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </InputGroup>

                    {errors.password && (
                        <p className="text-xs text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {/* ── Picture ── */}
                <div className="space-y-2">
                    <Label className="text-brand-dark dark:text-brand-light">
                        Photo de profil
                    </Label>

                    <Controller
                        name="picture"
                        control={control}
                        render={({field: {onChange, value: _value, ...field}}) => (
                            <div className="flex items-center gap-4">
                                {/* Avatar preview / placeholder */}
                                <div className="relative shrink-0">
                                    <div
                                        className={`
                                            w-20 h-20 rounded-full overflow-hidden border-2 flex items-center justify-center
                                            ${preview
                                            ? "border-brand-accent-dark"
                                            : "border-dashed border-brand-gray-400 dark:border-brand-gray-600 bg-brand-gray-100 dark:bg-brand-gray-800"
                                        }
                                        `}
                                    >
                                        {preview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={preview}
                                                alt="Aperçu"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-8 w-8 text-brand-gray-400 dark:text-brand-gray-500"/>
                                        )}
                                    </div>

                                    {/* Remove button */}
                                    {preview && (
                                        <button
                                            type="button"
                                            onClick={() => removePicture(onChange)}
                                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow transition-colors"
                                            aria-label="Supprimer la photo"
                                        >
                                            <X className="h-3 w-3 text-white"/>
                                        </button>
                                    )}
                                </div>

                                {/* Upload button */}
                                <div className="flex flex-col gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-accent-dark/60 text-brand-accent-dark hover:bg-brand-accent-dark/5 text-sm font-medium transition-colors"
                                    >
                                        <Camera className="h-4 w-4"/>
                                        {preview ? "Changer la photo" : "Choisir une photo"}
                                    </button>
                                    <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400">
                                        JPG, PNG, WebP — max 5 Mo
                                    </p>
                                </div>

                                {/* Hidden file input */}
                                <input
                                    {...field}
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, onChange)}
                                />
                            </div>
                        )}
                    />

                    {errors.picture && (
                        <p className="text-xs text-red-500 mt-1">{errors.picture.message}</p>
                    )}
                </div>

                {/* ── Captcha ── */}
                {sitekey && <div className="captcha-container"/>}

                {/* ── Submit ── */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="group w-full h-auto rounded-lg bg-brand-accent-dark text-white hover:bg-brand-accent-dark hover:-translate-y-0.5 border-2 border-brand-accent-dark px-6 py-3 text-sm font-semibold tracking-wide shadow-[0_8px_24px_-10px_rgba(194,65,12,0.55)] hover:shadow-[0_14px_36px_-12px_rgba(194,65,12,0.75)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? "Inscription…" : (
                        <>
                            <UserPlus className="h-4 w-4"/>
                            S&apos;inscrire
                        </>
                    )}
                </Button>
            </form>

            <p className="text-center text-sm mt-6 text-brand-gray-700 dark:text-brand-gray-300">
                Déjà un compte ?{" "}
                <Link
                    href="/login"
                    className="font-bold underline underline-offset-4 text-brand-accent-dark hover:opacity-80"
                >
                    Se connecter
                </Link>
            </p>
        </>
    );
}