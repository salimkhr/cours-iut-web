"use client";

import {useEffect, useState} from "react";
import {useAuth} from "@/context/AuthContext";
import {Button} from "@/components/ui/button";
import {InputGroup, InputGroupAddon, InputGroupInput,} from "@/components/ui/input-group";
import {Label} from "@/components/ui/label";
import {HeaderSvg} from "@/components/HeaderSvg";
import {AlertCircle, CheckCircle2, Lock, Mail, ShieldCheck, User, UserCog,} from "lucide-react";
import {FooterSvg} from "@/components/FooterSvg";
import Link from "next/link";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import Script from "next/script";

declare global {
    interface Window {
        turnstile: any;
        onTurnstileSuccess: (token: string) => void;
    }
}

export default function RegisterForm() {
    const {register} = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"user" | "admin">("user");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        let widgetId: string | null = null;
        const checkTurnstile = () => {
            if (window.turnstile) {
                const container = document.querySelector(".captcha-container");
                if (container && container.innerHTML === "") {
                    widgetId = window.turnstile.render(".captcha-container", {
                        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_TOKEN,
                        callback: (token: string) => {
                            setCaptchaToken(token);
                        },
                    });
                }
            } else {
                setTimeout(checkTurnstile, 100);
            }
        };

        checkTurnstile();

        return () => {
            if (widgetId && window.turnstile) {
                window.turnstile.remove(widgetId);
            }
        };
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!captchaToken) {
            setError("Veuillez valider le captcha");
            setLoading(false);
            return;
        }

        try {
            const fullEmail = email.includes('@') ? email : `${email}@salimkhraimeche.dev`;
            await register(name, fullEmail, password, role, captchaToken);
            setSuccess(true);
            setLoading(false);
            setName("");
            setEmail("");
            setPassword("");
            // Reset captcha after success
            if (window.turnstile) {
                window.turnstile.reset();
                setCaptchaToken(null);
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
            // Reset captcha on error
            if (window.turnstile) {
                window.turnstile.reset();
                setCaptchaToken(null);
            }
        }
    }

    return (
        <div className="min-h-screen flex flex-col w-full max-w-7xl mx-auto">
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                async
                defer
            />
            <main className="flex-1 flex">
                {/* LEFT — HEADER */}
                <section
                    className="relative w-1/2 hidden lg:flex flex-col justify-center px-16 text-white">
                    <div className="absolute inset-0 pointer-events-none">
                        <HeaderSvg size={500} color=""/>
                    </div>
                </section>

                {/* SPLIT LINE */}
                <div
                    className="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent"/>

                {/* RIGHT — FORM */}
                <section
                    className="relative flex-1 flex items-center justify-center px-6 z-10">
                    <div className="w-full max-w-sm space-y-8">
                        <div className="mb-8 text-center lg:text-left space-y-2">
                            {/* Icône visuel */}
                            <div className="flex justify-center mb-2">
                                <ShieldCheck className="h-10 w-10"/>
                            </div>

                            {/* Titre */}
                            <p
                                className="text-3xl font-bold text-center">
                                Inscription
                            </p>

                            {/* Sous-titre explicatif */}
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 text-center">
                                Créez un nouveau compte utilisateur.
                            </p>
                        </div>

                        {success && (
                            <div
                                className="flex gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-300 mb-6">
                                <CheckCircle2 className="h-5 w-5 text-green-500"/>
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    Compte créé avec succès !
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* NAME */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom</Label>
                                <InputGroup>
                                    <InputGroupInput
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Votre nom"
                                        autoComplete="name"
                                        required
                                    />
                                    <InputGroupAddon>
                                        <User className="h-5 w-5 text-gray-400"/>
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>

                            {/* IDENTIFIANT (EMAIL) */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Identifiant</Label>
                                <InputGroup>
                                    <InputGroupInput
                                        id="email"
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="votre identifiant"
                                        autoComplete="username"
                                        required
                                    />
                                    <InputGroupAddon>
                                        <Mail className="h-5 w-5 text-gray-400"/>
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>

                            {/* PASSWORD */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <InputGroup>
                                    <InputGroupInput
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        required
                                    />
                                    <InputGroupAddon>
                                        <Lock className="h-5 w-5 text-gray-400"/>
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>

                            {/* ROLE */}
                            <div className="space-y-2">
                                <Label htmlFor="role">Rôle</Label>
                                <Select value={role} onValueChange={(value) => setRole(value as "user" | "admin")}>
                                    <SelectTrigger className="w-full h-12">
                                        <div className="flex items-center gap-2">
                                            <UserCog className="h-5 w-5 text-gray-400"/>
                                            <SelectValue placeholder="Choisir un rôle"/>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">Utilisateur</SelectItem>
                                        <SelectItem value="admin">Administrateur</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* CAPTCHA */}
                            <div className="flex justify-center min-h-[65px]">
                                <div className="captcha-container"/>
                            </div>

                            {/* ERROR */}
                            {error && (
                                <div
                                    className="flex gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-300">
                                    <AlertCircle className="h-5 w-5 text-red-500"/>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* SUBMIT */}
                            <Button
                                variant="outline"
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    "Inscription…"
                                ) : (
                                    <>
                                        <User className="h-4 w-4"/>
                                        S'inscrire
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="text-center text-sm">
                            Déjà un compte ?{" "}
                            <Link href="/login" className="font-bold hover:underline text-primary">
                                Se connecter
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <div className="hidden lg:flex justify-center w-full mt-8"
                 style={{animationDelay: '0.5s', marginBottom: '45px', marginTop: '-40px'}}>
                <FooterSvg size={500} color=""/>
            </div>
        </div>
    );
}
