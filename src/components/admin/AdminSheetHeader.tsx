import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface AdminSheetHeaderProps {
    /** Icône Lucide affichée dans le badge carré */
    icon: LucideIcon;
    /** Texte eyebrow (uppercase, petit) */
    eyebrow: string;
    /** Titre principal (SheetTitle) */
    title: string;
    /** Description visible sous le titre (SheetDescription) */
    description?: React.ReactNode;
    /** Description accessible uniquement (sr-only) — mutuellement exclusif avec description */
    srDescription?: string;
    /** Classe de fond (modules prédéfinis) ou omise quand style est utilisé. */
    className?: string;
    /** Style inline — utilisé pour passer backgroundColor via moduleColor() sur les nouveaux modules. */
    style?: React.CSSProperties;
}

export default function AdminSheetHeader({
    icon: Icon,
    eyebrow,
    title,
    description,
    srDescription,
    className,
    style,
}: AdminSheetHeaderProps) {
    return (
        <div
            className={cn(
                'relative flex items-center gap-4 px-6 py-5 pr-14 overflow-hidden shrink-0',
                className,
            )}
            style={style}
        >
            {/* Ligne de lumière sur le bord supérieur */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />

            {/* Badge icône */}
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 dark:bg-brand-dark/15 shrink-0">
                <Icon className="w-5 h-5 text-white dark:text-brand-dark" aria-hidden="true" />
            </div>

            {/* Texte */}
            <div className="flex flex-col gap-0.5">
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/60 dark:text-brand-dark/60">
                    {eyebrow}
                </p>
                <SheetTitle className="text-white dark:text-brand-dark font-bold text-xl leading-tight p-0 m-0">
                    {title}
                </SheetTitle>
                {description && (
                    <SheetDescription className="text-white/70 dark:text-brand-dark/70 text-sm mt-0.5">
                        {description}
                    </SheetDescription>
                )}
                {srDescription && (
                    <SheetDescription className="sr-only">
                        {srDescription}
                    </SheetDescription>
                )}
            </div>
        </div>
    );
}
