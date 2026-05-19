import { create } from 'zustand'

export interface TocEntry {
    id: string
    text: string
    level: 2 | 3
}

interface TocStore {
    headings: Record<string, TocEntry[]>
    setHeadings: (key: string, entries: TocEntry[]) => void
}

export const useTocStore = create<TocStore>()((set) => ({
    headings: {},
    setHeadings: (key, entries) =>
        set((state) => ({ headings: { ...state.headings, [key]: entries } })),
}))
