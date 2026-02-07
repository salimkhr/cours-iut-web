'use client';

import {createContext, useContext} from 'react'
import {useRouter} from "next/navigation";
import {authClient} from "@/lib/auth-client";


type AuthContextType = {
    isLoggedIn: boolean;
    login: (email: string, password: string, captchaToken?: string) => Promise<{ success?: boolean; error?: string }>;
    register: (name: string, email: string, password: string, role?: "user" | "admin", captchaToken?: string) => Promise<{
        success?: boolean;
        error?: string
    }>;
    logout: () => void;
    user: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const {data: session, isPending} = authClient.useSession();
    const isLoggedIn = !!session;
    const user = session?.user;

    const router = useRouter();


    const login = async (email: string, password: string, captchaToken?: string) => {
        const {data, error} = await authClient.signIn.email({
            email,
            password,
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
        const payload = {email, password, name, role} as any;
        const {data, error} = await authClient.signUp.email({
            ...payload,
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
                await authClient.admin.setRole({
                    userId: data.user.id,
                    role: role
                });
            } catch (roleError: any) {
                console.error("Erreur lors de l'assignation du rôle:", roleError);
                // On ne bloque pas tout le processus si juste le rôle échoue, 
                // mais on pourrait choisir de le faire.
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

