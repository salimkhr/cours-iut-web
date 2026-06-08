"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import {AlertCircle, Lock, LogIn, Mail} from "lucide-react";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

import {authClient} from "@/lib/auth-client";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Field, FieldContent, FieldDescription, FieldLabel, FieldTitle} from "@/components/ui/field";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {Label} from "@/components/ui/label";

import {loginSchema, LoginValues} from "@/lib/schemas/login.schema";


export default function LoginForm() {
    const router = useRouter();

    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_TOKEN;
    const captchaRequired = !!sitekey;

    const {
        register,
        handleSubmit,
        control,
        formState: {errors},
        setValue,
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            rememberMe: true,
        },
    });

    const rememberMe = useWatch({control, name: "rememberMe"});

    // ── Turnstile ───────────────────────────────────────────────

    useEffect(() => {
        if (!sitekey) return;

        let widgetId: string | null = null;

        const check = () => {
            if (window.turnstile) {
                const el = document.querySelector(".captcha-container");
                if (el && el.innerHTML === "") {
                    widgetId = window.turnstile.render(".captcha-container", {
                        sitekey,
                        callback: (token: string) => setCaptchaToken(token),
                        theme: "auto",
                    });
                }
            } else {
                setTimeout(check, 100);
            }
        };

        check();

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

    // ── Submit ───────────────────────────────────────────────

    async function onSubmit(values: LoginValues) {
        setLoading(true);
        setError(null);

        if (captchaRequired && !captchaToken) {
            setError("Veuillez valider le captcha");
            setLoading(false);
            return;
        }

        const fetchOptions = captchaToken
            ? {headers: {"x-captcha-response": captchaToken}}
            : undefined;

        const isEmail = values.identifier.includes("@");

        try {
            const res = isEmail
                ? await authClient.signIn.email({
                    email: values.identifier,
                    password: values.password,
                    rememberMe: values.rememberMe,
                    fetchOptions,
                })
                : await authClient.signIn.username({
                    username: values.identifier,
                    password: values.password,
                    rememberMe: values.rememberMe,
                    fetchOptions,
                });

            if (res.error) {
                setError(res.error.message ?? "Identifiants invalides.");
                resetCaptcha();
                setLoading(false);
                return;
            }

            router.push("/");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            resetCaptcha();
            setLoading(false);
        }
    }

    return (
        <>
            {sitekey && (
                <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                    async
                    defer
                />
            )}

            {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 mb-5">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5"/>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Identifier */}
                <div className="space-y-2">
                    <Label>Identifiant</Label>
                    <InputGroup>
                        <InputGroupInput
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

                {/* Password */}
                <div className="space-y-2">
                    <Label>Mot de passe</Label>
                    <InputGroup>
                        <InputGroupInput
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            {...register("password")}
                        />
                        <InputGroupAddon>
                            <Lock className="h-5 w-5 text-brand-accent-dark/70"/>
                        </InputGroupAddon>
                    </InputGroup>
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password.message}</p>
                    )}
                </div>

                {/* Mot de passe oublié */}
                <div className="flex justify-end -mt-2">
                    <Link
                        href="/forgot-password"
                        className="text-xs text-brand-accent-dark hover:opacity-80 underline underline-offset-4"
                    >
                        Mot de passe oublié ?
                    </Link>
                </div>

                {/* Remember me */}
                <FieldLabel>
                    <Field orientation="horizontal">
                        <Checkbox
                            checked={rememberMe}
                            onCheckedChange={(v) => setValue("rememberMe", !!v)}
                        />
                        <FieldContent>
                            <FieldTitle>Rester connecté</FieldTitle>
                            <FieldDescription>
                                Conserver ma session active sur cet appareil.
                            </FieldDescription>
                        </FieldContent>
                    </Field>
                </FieldLabel>

                {/* Captcha */}
                {sitekey && (
                    <div className="overflow-x-auto w-full">
                        <div className="captcha-container"/>
                    </div>
                )}

                {/* Submit */}
                <Button type="submit" disabled={loading || (captchaRequired && !captchaToken)} size="lg" className="group w-full h-auto rounded-lg bg-brand-accent-dark text-white hover:bg-brand-accent-dark hover:-translate-y-0.5 border-2 border-brand-accent-dark px-6 py-3 text-sm font-semibold tracking-wide shadow-[0_8px_24px_-10px_rgba(194,65,12,0.55)] hover:shadow-[0_14px_36px_-12px_rgba(194,65,12,0.75)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                    {loading ? "Connexion…" : captchaRequired && !captchaToken ? "Validation du captcha…" : (
                        <>
                            <LogIn className="h-4 w-4"/>
                            Se connecter
                        </>
                    )}
                </Button>
            </form>

            <p className="text-center text-sm mt-6 text-brand-gray-700 dark:text-brand-gray-300">
                Pas encore de compte ?{" "}
                <Link href="/register" className="font-bold underline underline-offset-4 text-brand-accent-dark hover:opacity-80">
                    S&apos;inscrire
                </Link>
            </p>
            <p className="text-center text-xs mt-3 text-brand-gray-700 dark:text-brand-gray-300">
                Email non confirmé ?{" "}
                <Link href="/resend-verification" className="font-bold underline underline-offset-4 text-brand-accent-dark hover:opacity-80">
                    Renvoyer le lien
                </Link>
            </p>
        </>
    );
}