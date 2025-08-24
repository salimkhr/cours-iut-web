'use client';

import {createContext, useContext, useEffect, useState} from 'react'
import {useRouter} from "next/navigation";
import useAuthApi from "@/hook/useAuthApi";


type AuthContextType = {
    isLoggedIn: boolean;
    login: (login: string, password: string) => Promise<{ success?: boolean; error?: string }>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const hasSession = document.cookie.split('; ').some(cookie => cookie.startsWith('session='));
        setIsLoggedIn(hasSession);
    }, []);

    const router = useRouter();

    const { login: loginApi } = useAuthApi();

    const login = async (login: string, password: string) => {
        const res = await loginApi(login, password);
        if (res.success !== undefined) {
            setIsLoggedIn(true);
            router.push('/admin');
        } else {
            throw new Error(res.error);
        }
        return res;
    };

    const logout = () => {
        document.cookie = 'session=; Max-Age=0; Path=/; Secure; SameSite=Strict';
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{isLoggedIn, login, logout}}>
            {children}
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

