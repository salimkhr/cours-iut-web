"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import {AlertCircle, Lock, LogIn, Mail} from "lucide-react";

import {authClient} from "@/lib/auth-client";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Field, FieldContent, FieldDescription, FieldLabel, FieldTitle} from "@/components/ui/field";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {Label} from "@/components/ui/label";

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

export default function LoginForm() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_TOKEN;
    const captchaRequired = !!sitekey;

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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
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
        const isEmail = identifier.includes("@");

        try {
            const res = isEmail
                ? await authClient.signIn.email({
                    email: identifier,
                    password,
                    rememberMe,
                    fetchOptions,
                })
                : await authClient.signIn.username({
                    username: identifier,
                    password,
                    rememberMe,
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
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5"/>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="identifier" className="text-brand-dark dark:text-brand-light">
                        Identifiant
                    </Label>
                    <InputGroup>
                        <InputGroupInput
                            id="identifier"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="votre identifiant"
                            autoComplete="username"
                            required
                        />
                        <InputGroupAddon>
                            <Mail className="h-5 w-5 text-brand-accent-dark/70"/>
                        </InputGroupAddon>
                    </InputGroup>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-brand-dark dark:text-brand-light">
                        Mot de passe
                    </Label>
                    <InputGroup>
                        <InputGroupInput
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            minLength={7}
                            required
                        />
                        <InputGroupAddon>
                            <Lock className="h-5 w-5 text-brand-accent-dark/70"/>
                        </InputGroupAddon>
                    </InputGroup>
                </div>

                <FieldLabel>
                    <Field orientation="horizontal">
                        <Checkbox
                            id="rememberMe"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(!!checked)}
                        />
                        <FieldContent>
                            <FieldTitle>Rester connecté</FieldTitle>
                            <FieldDescription>
                                Conserver ma session active sur cet appareil.
                            </FieldDescription>
                        </FieldContent>
                    </Field>
                </FieldLabel>

                {sitekey && (
                    <div className="flex justify-center min-h-[65px]">
                        <div className="captcha-container"/>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="group w-full h-auto rounded-lg bg-brand-accent-dark text-white hover:bg-brand-accent-dark hover:-translate-y-0.5 border-2 border-brand-accent-dark px-6 py-3 text-sm font-semibold tracking-wide shadow-[0_8px_24px_-10px_rgba(194,65,12,0.55)] hover:shadow-[0_14px_36px_-12px_rgba(194,65,12,0.75)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                    {loading ? "Connexion…" : (
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
        </>
    );
}
