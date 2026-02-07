'use client';

import {createContext, useContext} from 'react'
import {useRouter} from "next/navigation";
import {authClient} from "@/lib/auth-client";

type User = typeof authClient.$Infer.Session.user;

type AuthContextType = {
    isLoggedIn: boolean;
    login: (email: string, password: string, captchaToken?: string, rememberMe?: boolean) => Promise<{
        success?: boolean;
        error?: string
    }>;
    register: (name: string, email: string, password: string, role?: "user" | "admin", captchaToken?: string) => Promise<{
        success?: boolean;
        error?: string
    }>;
    logout: () => void;
    user: User | null | undefined;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const {data: session, isPending} = authClient.useSession();
    const isLoggedIn = !!session;
    const user = session?.user;

    const router = useRouter();


    const login = async (email: string, password: string, captchaToken?: string, rememberMe?: boolean) => {
        const {data, error} = await authClient.signIn.email({
            email,
            password,
            rememberMe,
            fetchOptions: {
                headers: captchaToken ? {
                    "x-captcha-response": captchaToken,
                } : {},
            },
        });

        if (error) {
            throw new Error(error.message || "Erreur lors de la connexion");
        }

        const user = data?.user as { role?: string } | undefined;
        if (user?.role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/');
        }
        return {success: true};
    };

    const register = async (name: string, email: string, password: string, role?: "user" | "admin", captchaToken?: string) => {
        const {data, error} = await authClient.signUp.email({
            email,
            password,
            name,
            fetchOptions: {
                headers: captchaToken ? {
                    "x-captcha-response": captchaToken,
                } : {},
            },
        });

        if (error) {
            throw new Error(error.message || "Erreur lors de l'inscription");
        }

        // Si un rôle est spécifié, on l'assigne via l'API admin
        // Note: Cela nécessite soit que l'utilisateur soit connecté en tant qu'admin (après le premier compte)
        // soit que nous ayons temporairement levé les restrictions dans le plugin admin (via AC).
        if (role && role !== 'user') {
            try {
                // On attend un peu pour laisser le temps à la session d'être établie si nécessaire, 
                // bien que setRole devrait fonctionner si les permissions AC le permettent même sans session 
                // (ou avec la session fraîchement créée du nouvel utilisateur).
                const {error: roleError} = await authClient.admin.setRole({
                    userId: data.user.id,
                    role: role
                });
                if (roleError) {
                    console.error("Erreur lors de l'assignation du rôle (via API):", roleError.message);
                }
            } catch (roleError) {
                console.error("Erreur lors de l'assignation du rôle (catch):", roleError);
            }
        }

        return {success: true};
    };

    const logout = async () => {
        await authClient.signOut();
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{isLoggedIn, login, register, logout, user}}>
            {!isPending && children}
        </AuthContext.Provider>
    );
};

// Hook personnalisé pour consommer facilement le contexte
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return context;
};

