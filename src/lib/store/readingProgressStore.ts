import { create } from 'zustand'

interface ReadingProgressStore {
    modulePath: string | null
    setModulePath: (path: string | null) => void
}

export const useReadingProgressStore = create<ReadingProgressStore>()((set) => ({
    modulePath: null,
    setModulePath: (path) => set({ modulePath: path }),
}))
