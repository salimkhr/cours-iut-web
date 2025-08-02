'use client';

import {createContext, useContext, useEffect, useState} from 'react'


type AuthContextType = {
    isLoggedIn: boolean;
    login: (login: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const hasSession = document.cookie.split('; ').some(cookie => cookie.startsWith('session='));
        setIsLoggedIn(hasSession);
    }, []);

    const login = async (login: string, password: string) => {
        const csrfRes = await fetch('/api/csrf-token');
        const {csrfToken} = await csrfRes.json();
        return fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'csrf-token': csrfToken,
            },
            body: JSON.stringify({login, password}),
        }).then((response) => response.json())
            .then((res) => {
                if (res.success !== undefined)
                    setIsLoggedIn(true);
                else
                    throw new Error(res.error);
                return res
            });
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

