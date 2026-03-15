import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { audioEngine } from '@/features/sleep/services/audio-engine'
import { clearOfflineCache, startOfflineCache } from '@/features/sleep/services/offline-cache'
import { sleepTimer } from '@/features/sleep/services/sleep-timer'
import type { ThemeMode } from '@/features/sleep/types'
import { useCatalogStore } from '@/features/sleep/stores/useCatalogStore'
import { zhCN } from '@/shared/copy/zh-CN'
import { clamp } from '@/shared/utils/clamp'

type SettingsState = {
  themeMode: ThemeMode
  volume: number
  volumeMax: number
  sleepTimerMinutes: number
  sleepTimerRemainingSec: number
  offlineCatalogVersion: string | null
  offlineStatus: 'idle' | 'caching' | 'ready' | 'error'
  offlineProgress: number
  offlineFailedUrls: string[]
  notice: string
  setThemeMode: (mode: ThemeMode) => void
  setVolume: (value: number) => void
  startSleepTimer: (minutes: number) => void
  stopSleepTimer: () => void
  setOfflineProgress: (progress: number, failedUrls?: string[]) => void
  startOfflineCache: () => void
  clearOfflineCache: () => void
  setNotice: (message: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'auto',
      volume: 0.3,
      volumeMax: 0.8,
      sleepTimerMinutes: 0,
      sleepTimerRemainingSec: 0,
      offlineCatalogVersion: null,
      offlineStatus: 'idle',
      offlineProgress: 0,
      offlineFailedUrls: [],
      notice: '',
      setThemeMode(mode) {
        set({ themeMode: mode })
      },
      setVolume(value) {
        const nextVolume = clamp(value, 0, 0.8)
        audioEngine.setVolume(nextVolume)
        set({ volume: nextVolume })
      },
      startSleepTimer(minutes) {
        sleepTimer.start(minutes, {
          onTick: (remainingSeconds) => {
            set({
              sleepTimerMinutes: minutes,
              sleepTimerRemainingSec: remainingSeconds,
            })
          },
          onDone: () => {
            const startVolume = useSettingsStore.getState().volume
            const steps = 24
            let step = 0

            const fadeTimer = window.setInterval(() => {
              step += 1
              const nextVolume = Math.max(0, startVolume * (1 - step / steps))
              audioEngine.setVolume(nextVolume)

              if (step >= steps) {
                window.clearInterval(fadeTimer)
                audioEngine.stop()
                audioEngine.setVolume(0.3)
                set({
                  volume: 0.3,
                  sleepTimerMinutes: 0,
                  sleepTimerRemainingSec: 0,
                })
              }
            }, 125)
          },
        })
      },
      stopSleepTimer() {
        sleepTimer.clear()
        set({
          sleepTimerMinutes: 0,
          sleepTimerRemainingSec: 0,
        })
      },
      setOfflineProgress(progress, failedUrls = []) {
        set({
          offlineProgress: progress,
          offlineFailedUrls: failedUrls,
        })
      },
      startOfflineCache() {
        const { songs, catalogVersion } = useCatalogStore.getState()
        const urls = songs.flatMap((song) => [song.src, song.cover].filter(Boolean) as string[])

        if (!urls.length) {
          set({
            notice: zhCN.sleep.noSongTip,
          })
          return
        }

        try {
          startOfflineCache(urls, catalogVersion || 'local')
          set({
            offlineStatus: 'caching',
            offlineProgress: 0,
            offlineFailedUrls: [],
            notice: '',
            offlineCatalogVersion: catalogVersion,
          })
        } catch (error) {
          set({
            offlineStatus: 'error',
            notice: error instanceof Error ? error.message : zhCN.sleep.offlineError,
          })
        }
      },
      clearOfflineCache() {
        try {
          clearOfflineCache()
          set({
            offlineCatalogVersion: null,
            offlineStatus: 'idle',
            offlineProgress: 0,
            offlineFailedUrls: [],
            notice: '',
          })
        } catch (error) {
          set({
            offlineStatus: 'error',
            notice: error instanceof Error ? error.message : zhCN.sleep.offlineError,
          })
        }
      },
      setNotice(message) {
        set({ notice: message })
      },
    }),
    {
      name: 'pai-settings',
      partialize: (state) => ({
        themeMode: state.themeMode,
        offlineCatalogVersion: state.offlineCatalogVersion,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
