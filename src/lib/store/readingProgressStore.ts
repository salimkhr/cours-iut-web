import { create } from 'zustand'

interface ReadingProgressStore {
    modulePath: string | null
    accentColor: string | null
    setModulePath: (path: string | null, accentColor?: string | null) => void
}

export const useReadingProgressStore = create<ReadingProgressStore>()((set) => ({
    modulePath: null,
    accentColor: null,
    setModulePath: (path, accentColor = null) => set({ modulePath: path, accentColor }),
}))
