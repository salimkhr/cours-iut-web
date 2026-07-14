"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import Script from "next/script";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {AlertCircle, Mail, Send} from "lucide-react";
import {authClient} from "@/lib/auth-client";
import {Button} from "@/components/ui/button";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {Label} from "@/components/ui/label";

const schema = z.object({
    email: z.string().email("Adresse email invalide"),
});
type Values = z.infer<typeof schema>;

export default function ResendVerificationForm() {
    const [sent, setSent] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_TOKEN;
    const captchaRequired = !!sitekey;

    const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<Values>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (!sitekey) return;

        let widgetId: string | null = null;

        const check = () => {
            if (window.turnstile) {
                const el = document.querySelector(".captcha-container-resend");
                if (el && el.innerHTML === "") {
                    widgetId = window.turnstile.render(".captcha-container-resend", {
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

    async function onSubmit(values: Values) {
        setServerError(null);

        const fetchOptions = captchaToken
            ? {headers: {"x-captcha-response": captchaToken}}
            : undefined;

        const {error} = await authClient.sendVerificationEmail({
            email: values.email,
            callbackURL: "/email-verifie",
            fetchOptions,
        });

        if (error) {
            console.error("[resend-verification]", error);
            setServerError(error.message ?? "Une erreur est survenue.");
            resetCaptcha();
            return;
        }

        setSent(true);
    }

    if (sent) {
        return (
            <div className="text-center space-y-5">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                    <Send className="w-6 h-6 text-green-600 dark:text-green-400"/>
                </div>
                <p className="text-sm text-brand-gray-700 dark:text-brand-gray-300">
                    Si un compte non vérifié est associé à cette adresse, un nouveau lien de confirmation vient d&apos;être envoyé.
                    Pensez à vérifier vos spams.
                </p>
                <Link
                    href="/login"
                    className="text-sm font-bold underline underline-offset-4 text-brand-accent-dark hover:opacity-80"
                >
                    Retour à la connexion
                </Link>
            </div>
        );
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {serverError && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0"/>
                        <p className="text-sm text-red-700 dark:text-red-300">{serverError}</p>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Adresse email</Label>
                    <InputGroup>
                        <InputGroupInput
                            type="email"
                            placeholder="vous@exemple.com"
                            autoComplete="email"
                            {...register("email")}
                        />
                        <InputGroupAddon>
                            <Mail className="h-5 w-5 text-brand-accent-dark/70"/>
                        </InputGroupAddon>
                    </InputGroup>
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                {sitekey && <div className="captcha-container-resend"/>}

                <Button
                    type="submit"
                    disabled={isSubmitting || (captchaRequired && !captchaToken)}
                    size="lg"
                    className="w-full bg-brand-accent-dark text-white dark:text-brand-dark hover:bg-brand-accent-dark/90 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? "Envoi…" : captchaRequired && !captchaToken ? "Validation du captcha…" : <><Send className="h-4 w-4"/>Renvoyer le lien de confirmation</>}
                </Button>

                <p className="text-center text-sm text-brand-gray-700 dark:text-brand-gray-300">
                    <Link
                        href="/login"
                        className="font-bold underline underline-offset-4 text-brand-accent-dark hover:opacity-80"
                    >
                        Retour à la connexion
                    </Link>
                </p>
            </form>
        </>
    );
}
