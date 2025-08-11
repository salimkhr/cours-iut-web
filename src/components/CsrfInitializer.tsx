'use client';
import {useEffect} from 'react';
import {initCsrf} from "@/lib/api";


export default function CsrfInitializer() {
    useEffect(() => {
        initCsrf().catch(console.error);
    }, []);
    return null;
}
