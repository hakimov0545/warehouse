import { create } from 'zustand'

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t)
}

const initialTheme = localStorage.getItem('theme') || 'dark'
applyTheme(initialTheme)

export const useThemeStore = create((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    localStorage.setItem('theme', next)
    set({ theme: next })
  },
  setTheme: (t) => {
    applyTheme(t)
    localStorage.setItem('theme', t)
    set({ theme: t })
  }
}))
