'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { List, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTocStore, TocEntry } from '@/lib/store/tocStore'
import { CONTENT_LABELS, ContentKey } from '@/lib/contentMeta'

const TOC_TABS: ContentKey[] = ['cours', 'TP', 'examen']

interface TableOfContentsProps {
    modulePath: string
    currentContent: ContentKey
    moduleSlug: string
    sectionSlug: string
    sectionContents: string[]
    accentColor?: string
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[''`'"]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export default function TableOfContents({
    modulePath,
    currentContent,
    moduleSlug,
    sectionSlug,
    sectionContents,
    accentColor,
}: TableOfContentsProps) {
    const router = useRouter()
    const { headings, setHeadings } = useTocStore()

    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<ContentKey>(currentContent)
    const [activeId, setActiveId] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const visibleTabs = TOC_TABS.filter((t) => sectionContents.includes(t))

    // DOM scan + injection d'IDs slugifiés + peuplement du store
    useEffect(() => {
        const main = document.querySelector('main')
        if (!main) return

        const elements = Array.from(main.querySelectorAll('h2, h3')) as HTMLElement[]
        const extracted: TocEntry[] = []

        elements.forEach((el) => {
            const text = el.textContent?.trim() ?? ''
            if (!text) return
            if (!el.id) el.id = slugify(text)
            extracted.push({ id: el.id, text, level: el.tagName === 'H2' ? 2 : 3 })
        })

        setHeadings(`${sectionSlug}/${currentContent}`, extracted)

        // Scroll vers l'ancre si présente dans l'URL (navigation inter-onglet via TOC)
        const hash = window.location.hash.slice(1)
        if (hash) {
            document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [sectionSlug, currentContent, setHeadings])

    // IntersectionObserver — actif uniquement sur l'onglet courant
    useEffect(() => {
        if (activeTab !== currentContent) return

        const main = document.querySelector('main')
        if (!main) return

        const elements = Array.from(main.querySelectorAll('h2[id], h3[id]'))

        const observer = new IntersectionObserver(
            (entries) => {
                const intersecting = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
                if (intersecting.length > 0) {
                    setActiveId(intersecting[0].target.id)
                }
            },
            { rootMargin: '-10% 0px -80% 0px' }
        )

        elements.forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [activeTab, currentContent, setActiveId])

    // Fermeture au clic extérieur
    useEffect(() => {
        if (!isOpen) return
        function handleMouseDown(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleMouseDown)
        return () => document.removeEventListener('mousedown', handleMouseDown)
    }, [isOpen])

    // Fermeture à la touche Escape
    useEffect(() => {
        if (!isOpen) return
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    const currentHeadings = headings[`${sectionSlug}/${currentContent}`] ?? []
    if (currentHeadings.length === 0) return null

    function handleEntryClick(entry: TocEntry) {
        if (activeTab === currentContent) {
            document.getElementById(entry.id)?.scrollIntoView({ behavior: 'smooth' })
        } else {
            router.push(`/${moduleSlug}/${sectionSlug}/${activeTab}#${entry.id}`, { scroll: false })
        }
        setIsOpen(false)
    }

    const displayedHeadings = headings[`${sectionSlug}/${activeTab}`] ?? []
    const moduleColor = accentColor ?? `var(--color-${modulePath})`

    return (
        <div ref={containerRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
            {isOpen && (
                <div className="w-64 max-h-[60vh] bg-bridge-50 dark:bg-bridge-800 border border-border rounded-xl shadow-[0_18px_36px_-14px_rgba(147,97,58,0.5)] dark:shadow-[0_18px_36px_-14px_rgba(0,0,0,0.75)] flex flex-col overflow-hidden">
                    {/* Header onglets */}
                    <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-bridge-100 dark:border-bridge-700 shrink-0">
                        <div className="flex gap-1">
                            {visibleTabs.map((tab) => (
                                <button
                                    type="button"
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        'rounded-t-sm text-xs font-semibold px-2 py-1 border-b-2 transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                                        activeTab !== tab && 'border-transparent text-brand-dark/40 dark:text-bridge-300/40'
                                    )}
                                    style={
                                        activeTab === tab
                                            ? { borderColor: moduleColor, color: moduleColor }
                                            : {}
                                    }
                                >
                                    {CONTENT_LABELS[tab]}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-md text-brand-dark/40 dark:text-bridge-300/40 hover:text-brand-dark dark:hover:text-bridge-100 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Fermer"
                        >
                            <X className="size-3.5" />
                        </button>
                    </div>

                    {/* Liste des headings */}
                    <div className="overflow-y-auto flex-1 py-2">
                        {displayedHeadings.length === 0 ? (
                            <div className="px-4 py-4 text-xs text-brand-dark/50 dark:text-bridge-300/50">
                                Visitez le {CONTENT_LABELS[activeTab]} pour charger sa table des matières.{' '}
                                <button
                                    type="button"
                                    className="underline hover:text-brand-dark dark:hover:text-bridge-100 transition-colors"
                                    onClick={() => {
                                        router.push(`/${moduleSlug}/${sectionSlug}/${activeTab}`)
                                        setIsOpen(false)
                                    }}
                                >
                                    Y aller →
                                </button>
                            </div>
                        ) : (
                            displayedHeadings.map((entry) => {
                                const isActive = activeTab === currentContent && entry.id === activeId
                                return (
                                    <button
                                        key={entry.id}
                                        onClick={() => handleEntryClick(entry)}
                                        className={cn(
                                            'w-full rounded-sm text-left px-3 py-1 transition-colors hover:bg-bridge-100 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-bridge-700/30',
                                            entry.level === 3 ? 'pl-7 text-xs' : 'text-sm font-semibold',
                                            !isActive && 'text-brand-dark/80 dark:text-bridge-200/80'
                                        )}
                                        style={isActive ? { color: moduleColor } : {}}
                                    >
                                        {entry.text}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Bouton flottant */}
            <button
                type="button"
                onClick={() => setIsOpen((p) => !p)}
                className="flex size-10 items-center justify-center rounded-full shadow-[0_14px_30px_-12px_rgba(147,97,58,0.65)] text-white dark:text-brand-dark transition-[opacity,transform] hover:opacity-90 active:translate-y-px focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{ backgroundColor: moduleColor }}
                aria-label="Table des matières"
            >
                <List className="size-5" />
            </button>
        </div>
    )
}
