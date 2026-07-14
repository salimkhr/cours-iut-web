'use client'

import {useTheme} from 'next-themes'
import {useMounted} from '@/hook/useMounted'
import {Moon, Sun} from 'lucide-react'

export function ThemeToggle() {
    const mounted = useMounted()
    const { theme, setTheme } = useTheme()

    if (!mounted) {
        return null
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex size-9 items-center justify-center rounded-full text-bridge-900 transition-colors hover:bg-brand-primary/12 hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-ring dark:text-bridge-100 dark:hover:bg-brand-primary/18"
            aria-label="Changer le thème"
        >
            {theme === 'dark' ? (
                <Sun className="size-5" aria-hidden="true" />
            ) : (
                <Moon className="size-5" aria-hidden="true" />
            )}
        </button>
    )
}
