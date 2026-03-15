export function createJsonStorage<T>(key: string, fallback: T) {
  return {
    get() {
      if (typeof window === 'undefined') {
        return fallback
      }

      const raw = window.localStorage.getItem(key)

      if (!raw) {
        return fallback
      }

      try {
        return JSON.parse(raw) as T
      } catch {
        return fallback
      }
    },
    set(value: T) {
      if (typeof window === 'undefined') {
        return
      }

      window.localStorage.setItem(key, JSON.stringify(value))
    },
    remove() {
      if (typeof window === 'undefined') {
        return
      }

      window.localStorage.removeItem(key)
    },
  }
}
