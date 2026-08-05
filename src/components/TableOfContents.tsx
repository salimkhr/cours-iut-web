'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { List, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTocStore, TocEntry } from '@/lib/store/tocStore'
import { usePref, writePref } from '@/lib/clientPrefs'
import { CONTENT_LABELS, ContentKey } from '@/lib/contentMeta'

const TOC_TABS: ContentKey[] = ['cours', 'TP', 'examen']
const TOC_OPEN_KEY = 'toc:open'
/** Ligne de lecture : un titre passé au-dessus est considéré comme entamé. */
const READING_LINE_PX = 140

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

    const [activeTab, setActiveTab] = useState<ContentKey>(currentContent)
    const [activeId, setActiveId] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Fermé par défaut ; on ne rouvre que si l'étudiant l'avait laissé ouvert.
    // Le snapshot serveur vaut `null`, donc pas d'écart d'hydratation.
    const isOpen = usePref(TOC_OPEN_KEY) === '1'

    function toggleOpen(next: boolean) {
        writePref(TOC_OPEN_KEY, next ? '1' : '0')
    }

    const visibleTabs = TOC_TABS.filter((t) => sectionContents.includes(t))

    // DOM scan + injection d'IDs slugifiés + peuplement du store
    useEffect(() => {
        const main = document.querySelector('main')
        if (!main) return

        const elements = Array.from(main.querySelectorAll('h2, h3')) as HTMLElement[]
        const extracted: TocEntry[] = []
        // Deux titres identiques dans une même page (« Rappel de HTML » en A puis
        // en 2) produisaient le même id : ancre ambiguë, et clés React en double.
        const used = new Map<string, number>()

        elements.forEach((el) => {
            const text = el.textContent?.trim() ?? ''
            if (!text) return
            if (!el.id) {
                const base = slugify(text)
                const seen = used.get(base) ?? 0
                used.set(base, seen + 1)
                el.id = seen === 0 ? base : `${base}-${seen + 1}`
            }
            // Le repère du plan (A / 2 / c) vit dans un `<span>` frère du titre :
            // sans lui, impossible de rapprocher une ligne du sommaire de la
            // section correspondante dans la page.
            const badge = el
                .closest('.course-section-head')
                ?.querySelector('.course-section-badge')
                ?.textContent?.trim()
            extracted.push({
                id: el.id,
                text,
                level: el.tagName === 'H2' ? 2 : 3,
                badge: badge || undefined,
            })
        })

        setHeadings(`${sectionSlug}/${currentContent}`, extracted)

        // Scroll vers l'ancre si présente dans l'URL (navigation inter-onglet via TOC)
        const hash = window.location.hash.slice(1)
        if (hash) {
            document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [sectionSlug, currentContent, setHeadings])

    // Les titres sont injectés par l'effet ci-dessus : on relance le suivi de
    // position quand leur nombre change.
    const displayedCount = (headings[`${sectionSlug}/${currentContent}`] ?? []).length

    // Section courante — actif uniquement sur l'onglet affiché.
    //
    // Un IntersectionObserver ne signalait la position que pendant qu'un titre
    // traversait une bande de 10 % de hauteur : entre deux titres éloignés,
    // plus rien n'était marqué. On retient plutôt le dernier titre passé
    // au-dessus de la ligne de lecture, ce qui donne toujours une réponse.
    useEffect(() => {
        if (activeTab !== currentContent) return

        const main = document.querySelector('main')
        if (!main) return

        const elements = Array.from(main.querySelectorAll('h2[id], h3[id]'))
        if (elements.length === 0) return

        let frame = 0
        const update = () => {
            frame = 0
            let current: string | null = null
            for (const el of elements) {
                if (el.getBoundingClientRect().top <= READING_LINE_PX) current = el.id
                else break
            }
            setActiveId(current ?? elements[0].id)
        }
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update)
        }

        update()
        window.addEventListener('scroll', schedule, { passive: true })
        window.addEventListener('resize', schedule)
        return () => {
            if (frame) cancelAnimationFrame(frame)
            window.removeEventListener('scroll', schedule)
            window.removeEventListener('resize', schedule)
        }
    }, [activeTab, currentContent, displayedCount])

    // Fermeture au clic extérieur — uniquement quand le panneau recouvre le
    // contenu. Sur écran large il est à côté du texte : le refermer dès qu'on
    // clique dans le cours le rendrait inutilisable.
    useEffect(() => {
        if (!isOpen) return
        if (window.matchMedia('(min-width: 1536px)').matches) return
        function handleMouseDown(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                toggleOpen(false)
            }
        }
        document.addEventListener('mousedown', handleMouseDown)
        return () => document.removeEventListener('mousedown', handleMouseDown)
    }, [isOpen])

    // Fermeture à la touche Escape
    useEffect(() => {
        if (!isOpen) return
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') toggleOpen(false)
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    const currentHeadings = headings[`${sectionSlug}/${currentContent}`] ?? []
    if (currentHeadings.length === 0) return null

    function handleEntryClick(entry: TocEntry) {
        if (activeTab === currentContent) {
            // Navigation dans la page courante : le sommaire reste ouvert, on
            // enchaîne d'une section à l'autre sans le rouvrir à chaque fois.
            document.getElementById(entry.id)?.scrollIntoView({ behavior: 'smooth' })
            return
        }
        router.push(`/${moduleSlug}/${sectionSlug}/${activeTab}#${entry.id}`, { scroll: false })
        toggleOpen(false)
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
                            onClick={() => toggleOpen(false)}
                            className="rounded-md text-brand-dark/40 dark:text-bridge-300/40 hover:text-brand-dark dark:hover:text-bridge-100 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Fermer le sommaire"
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
                                        toggleOpen(false)
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
                                        aria-current={isActive ? 'true' : undefined}
                                        className={cn(
                                            'w-full flex items-baseline gap-2 rounded-sm text-left px-3 py-1 transition-colors hover:bg-bridge-100 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-bridge-700/30',
                                            entry.level === 3 ? 'pl-6 text-xs' : 'text-sm font-semibold',
                                            isActive
                                                ? 'bg-bridge-100 dark:bg-bridge-700/40'
                                                : 'text-brand-dark/80 dark:text-bridge-200/80'
                                        )}
                                        style={isActive ? { color: moduleColor } : {}}
                                    >
                                        {entry.badge && (
                                            <span
                                                aria-hidden="true"
                                                className="shrink-0 font-mono text-xs uppercase opacity-60"
                                            >
                                                {entry.badge}
                                            </span>
                                        )}
                                        <span className="min-w-0">{entry.text}</span>
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
                onClick={() => toggleOpen(!isOpen)}
                aria-expanded={isOpen}
                className="flex size-10 items-center justify-center rounded-full shadow-[0_14px_30px_-12px_rgba(147,97,58,0.65)] text-white dark:text-brand-dark transition-[opacity,transform] hover:opacity-90 active:translate-y-px focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{ backgroundColor: moduleColor }}
                aria-label={isOpen ? 'Masquer le sommaire' : 'Afficher le sommaire'}
            >
                <List className="size-5" />
            </button>
        </div>
    )
}
