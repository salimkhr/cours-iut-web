'use client';

import {createContext, useContext} from 'react'
import {useRouter} from "next/navigation";
import {authClient} from "@/lib/auth-client";
import {revalidateAuth} from "@/app/actions/auth-actions";

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

        // 🔑 Revalider côté serveur + refresh client
        await revalidateAuth();
        router.refresh();

        // Petit délai pour s'assurer que la revalidation est terminée
        await new Promise(resolve => setTimeout(resolve, 150));

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

        if (role && role !== 'user') {
            try {
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

        // 🔑 Revalider côté serveur + refresh client
        await revalidateAuth();
        router.refresh();

        // Petit délai pour s'assurer que la revalidation est terminée
        await new Promise(resolve => setTimeout(resolve, 150));

        router.push('/');
    };

    return (
        <AuthContext.Provider value={{isLoggedIn, login, register, logout, user}}>
            {!isPending && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return context;
};