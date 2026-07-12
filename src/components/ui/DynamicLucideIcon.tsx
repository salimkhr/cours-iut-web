'use client';

import * as LucideIcons from 'lucide-react';
import type React from 'react';

type IconComponent = React.ComponentType<{ className?: string; size?: number | string }>;

export function DynamicLucideIcon({ name, className, size }: { name: string; className?: string; size?: number }) {
    const Icon = (LucideIcons as Record<string, unknown>)[name] as IconComponent | undefined;
    if (!Icon) return null;
    return <Icon className={className} size={size} />;
}

export function getAllLucideIconNames(): string[] {
    return Object.keys(LucideIcons).filter((key) => {
        if (!/^[A-Z]/.test(key)) return false;
        if (key.endsWith('Icon')) return false;
        const val = (LucideIcons as Record<string, unknown>)[key];
        return typeof val === 'function' || (typeof val === 'object' && val !== null && !Array.isArray(val));
    });
}
