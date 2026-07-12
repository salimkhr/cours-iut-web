'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DynamicLucideIcon, getAllLucideIconNames } from '@/components/ui/DynamicLucideIcon';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LucideIconPickerProps {
    value: string;
    onChange: (name: string) => void;
    className?: string;
    placeholder?: string;
}

export function LucideIconPicker({ value, onChange, className, placeholder = 'Choisir une icône…' }: LucideIconPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const allIcons = useMemo(() => getAllLucideIconNames(), []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return allIcons;
        return allIcons.filter((name) => name.toLowerCase().includes(q));
    }, [allIcons, search]);

    const handleSelect = useCallback((name: string) => {
        onChange(name);
        setOpen(false);
        setSearch('');
    }, [onChange]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        'w-full justify-start gap-2 font-normal text-left',
                        'bg-bridge-100/60 dark:bg-bridge-800/60 border-bridge-500/45',
                        !value && 'text-muted-foreground',
                        className,
                    )}
                >
                    {value ? (
                        <>
                            <DynamicLucideIcon name={value} size={16} />
                            <span className="flex-1 truncate">{value}</span>
                        </>
                    ) : (
                        <span className="flex-1">{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-3" align="start">
                {/* Search */}
                <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        autoFocus
                        placeholder="Rechercher…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 pr-8 h-8 text-sm"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Count */}
                <p className="text-xs text-muted-foreground mb-2">
                    {filtered.length} icône{filtered.length !== 1 ? 's' : ''}
                </p>

                {/* Grid */}
                <ScrollArea className="h-56">
                    <div className="grid grid-cols-7 gap-1 pr-3">
                        {filtered.slice(0, 350).map((name) => (
                            <button
                                key={name}
                                type="button"
                                title={name}
                                onClick={() => handleSelect(name)}
                                className={cn(
                                    'flex items-center justify-center rounded p-1.5 h-9 w-9 transition-colors',
                                    'hover:bg-accent hover:text-accent-foreground',
                                    value === name && 'bg-primary text-primary-foreground',
                                )}
                            >
                                <DynamicLucideIcon name={name} size={18} />
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <p className="col-span-7 text-xs text-muted-foreground text-center py-6">
                                Aucun résultat pour &laquo;{search}&raquo;
                            </p>
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
