import type { ThemeMode } from '@/features/sleep/types'

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'light' || mode === 'dark') {
    return mode
  }

  if (typeof window !== 'undefined' && 'matchMedia' in window) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const hour = new Date().getHours()
  return hour >= 20 || hour < 6 ? 'dark' : 'light'
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.theme = resolveTheme(mode)
}
