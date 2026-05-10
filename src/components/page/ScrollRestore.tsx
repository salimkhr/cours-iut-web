'use client';

import {useEffect, useLayoutEffect} from 'react';

const PREFIX = 'scroll:';
const SAVE_DEBOUNCE_MS = 150;

interface ScrollRestoreProps {
    storageKey: string;
}

const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function ScrollRestore({storageKey}: ScrollRestoreProps) {
    useIsomorphicLayoutEffect(() => {
        const fullKey = PREFIX + storageKey;

        if (!window.location.hash) {
            const saved = sessionStorage.getItem(fullKey);
            const y = saved !== null ? parseInt(saved, 10) || 0 : 0;
            window.scrollTo(0, y);
        }

        return () => {
            sessionStorage.setItem(fullKey, String(window.scrollY));
        };
    }, [storageKey]);

    useEffect(() => {
        const fullKey = PREFIX + storageKey;
        let timeout: ReturnType<typeof setTimeout> | null = null;
        const save = () => sessionStorage.setItem(fullKey, String(window.scrollY));
        const debouncedSave = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(save, SAVE_DEBOUNCE_MS);
        };
        window.addEventListener('scroll', debouncedSave, {passive: true});
        return () => {
            window.removeEventListener('scroll', debouncedSave);
            if (timeout) clearTimeout(timeout);
        };
    }, [storageKey]);

    return null;
}
