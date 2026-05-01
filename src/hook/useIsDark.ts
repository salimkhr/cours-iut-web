'use client';

import {useTheme} from 'next-themes';
import {useMounted} from '@/hook/useMounted';

export function useIsDark(): boolean {
    const mounted = useMounted();
    const {theme, systemTheme} = useTheme();

    if (!mounted) return false;
    const currentTheme = theme === 'system' ? systemTheme : theme;
    return currentTheme === 'dark';
}
