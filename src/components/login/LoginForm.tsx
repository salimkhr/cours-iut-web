"use client";

import {useState} from "react";
import {useAuth} from "@/context/AuthContext";
import {Button} from "@/components/ui/button";
import {InputGroup, InputGroupAddon, InputGroupInput,} from "@/components/ui/input-group";
import {Label} from "@/components/ui/label";
import {HeaderSvg} from "@/components/HeaderSvg";
import {AlertCircle, Lock, LogIn, Mail, ShieldCheck,} from "lucide-react";
import {FooterSvg} from "@/components/FooterSvg";

export default function LoginForm() {
    const {login} = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const fullEmail = email.includes('@') ? email : `${email}@salimkhraimeche.dev`;
            await login(fullEmail, password);

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col w-full max-w-7xl mx-auto">
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
                                Connexion
                            </p>

                            {/* Sous-titre explicatif */}
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 text-center">
                                Connectez-vous avec le même compte que l'intranet.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                        autoComplete="current-password"
                                        required
                                    />
                                    <InputGroupAddon>
                                        <Lock className="h-5 w-5 text-gray-400"/>
                                    </InputGroupAddon>
                                </InputGroup>
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
                                    "Connexion…"
                                ) : (
                                    <>
                                        <LogIn className="h-4 w-4"/>
                                        Se connecter
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* <div className="text-center text-sm">
                            Pas encore de compte ?{" "}
                            <Link href="/register" className="font-bold hover:underline text-primary">
                                S'inscrire
                            </Link>
                        </div>*/}
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
