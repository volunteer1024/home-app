import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { SleepLayout } from '@/features/sleep/pages/SleepLayout'
import { useCatalogStore } from '@/features/sleep/stores/useCatalogStore'
import { usePlayerStore } from '@/features/sleep/stores/usePlayerStore'
import { useSettingsStore } from '@/features/sleep/stores/useSettingsStore'

function SleepRouteLayout() {
  const loadCatalog = useCatalogStore((state) => state.loadCatalog)
  const loaded = useCatalogStore((state) => state.loaded)
  const ensureReady = usePlayerStore((state) => state.ensureReady)
  const volume = useSettingsStore((state) => state.volume)
  const setVolume = useSettingsStore((state) => state.setVolume)

  useEffect(() => {
    if (!loaded) {
      void loadCatalog()
    }
  }, [loadCatalog, loaded])

  useEffect(() => {
    ensureReady()
    setVolume(volume)
  }, [ensureReady, setVolume, volume])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') {
        return
      }

      if (event.data.type === 'sleep-cache-progress') {
        useSettingsStore.getState().setOfflineProgress(event.data.progress, event.data.failedUrls)
      }

      if (event.data.type === 'sleep-cache-ready') {
        useSettingsStore.setState({
          offlineStatus: 'ready',
          offlineProgress: 100,
        })
      }
    }

    navigator.serviceWorker?.addEventListener('message', onMessage)
    return () => navigator.serviceWorker?.removeEventListener('message', onMessage)
  }, [])

  return (
    <SleepLayout>
      <Outlet />
    </SleepLayout>
  )
}

export const Route = createFileRoute('/sleep')({
  component: SleepRouteLayout,
})
