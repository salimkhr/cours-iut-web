"use client";

import {cn} from '@/lib/utils';
import {useTheme} from "next-themes";

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    variant: 'default' | 'muted' | 'light';
}

type ThemeType = 'light' | 'dark';

export default function Text({ className = '', variant = 'default', ...props }: TextProps) {
    const { theme } = useTheme();

    // Mapping strict
    const variants: Record<TextProps['variant'], Record<ThemeType, string>> = {
        default: { light: 'text-gray-800', dark: 'text-gray-200' },
        muted: { light: 'text-gray-600', dark: 'text-gray-400' },
        light: { light: 'text-gray-500', dark: 'text-gray-500' },
    };

    // Forcer le type avec fallback
    const currentTheme: ThemeType = (theme === 'dark' ? 'dark' : 'light') as ThemeType;

    const resolvedVariant = variants[variant][currentTheme];

    return (
        <p
            className={cn(
                resolvedVariant,
                'transition-colors duration-300',
                className
            )}
            {...props}
        />
    );
}
