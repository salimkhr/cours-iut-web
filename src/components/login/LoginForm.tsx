"use client";

import {useState} from "react";
import {useAuth} from "@/context/AuthContext";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import BaseCard from "@/components/Cards/BaseCard";
import {useRouter} from "next/navigation";

export default function LoginForm() {
    const {login} = useAuth();
    const [loginValue, setLoginValue] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        login(loginValue, password)
            .then(
                () => {
                    router.push('/admin');
                })
            .catch((err) => {
                console.log(err);
                setError(err.message);
                setLoading(false)
            });
    }

    return (
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
                            value={loginValue}
                            onChange={(e) => setLoginValue(e.target.value)}
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
            footer={<span className="text-red-900">{error}</span>}
        />
    );
}
