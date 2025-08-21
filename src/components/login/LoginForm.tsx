"use client";

import {useState} from "react";
import {useAuth} from "@/context/AuthContext";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import BaseCard from "@/components/Cards/BaseCard";
import {useRouter} from "next/navigation";
import {Eye, EyeOff} from "lucide-react";
import {AxiosError} from "axios";

export default function LoginForm() {
    const {login} = useAuth();
    const [loginValue, setLoginValue] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(loginValue, password);
            router.push("/admin");
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                console.error("Erreur lors de la connexion :", err.response?.data.error);
                setError(err.response?.data.error);
            } else {
                setError("Échec de la connexion. Veuillez réessayer.");
            }
        } finally {
            setLoading(false);
        }
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
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                tabIndex={-1} // pour ne pas prendre le focus dans le form
                            >
                                {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                        variant="outline"
                        aria-busy={loading}
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </Button>
                </form>
            }
            footer={
                error && (
                    <span className="text-red-900 text-sm" aria-live="polite">
            {error}
          </span>
                )
            }
        />
    );
}
