"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import BaseCard from "@/components/Cards/BaseCard";

export default function LoginPage() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const csrfRes = await fetch('/api/csrf-token');
            const {csrfToken} = await csrfRes.json();

            const res = await fetch("/api/login", {
                method: "POST",
                headers: {"Content-Type": "application/json", 'csrf-token': csrfToken,},
                body: JSON.stringify({login, password}),
            });

            if (!res.ok) {
                throw new Error("Login ou mot de passe invalide");
            }

            // toast({
            //     title: "Connecté",
            //     description: "Vous êtes maintenant connecté.",
            // });

            window.location.href = "/admin";

        } catch (err) {
            // toast({
            //     title: "Erreur",
            //     description: (err as Error).message,
            //     variant: "destructive",
            // });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center p-4 pt-50 header-login">
            <BaseCard
                header={<span className="text-sm text-white font-mono">Connexion</span>}
                content={
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="login">Login</Label>
                            <Input
                                type="text"
                                id="login"
                                placeholder="Votre login"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading} variant="outline">
                            {loading ? "Connexion..." : "Se connecter"}
                        </Button>
                    </form>
                }
            />
        </div>
    );
}
