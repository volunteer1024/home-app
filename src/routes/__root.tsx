import { Outlet, createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { useSettingsStore } from '@/features/sleep/stores/useSettingsStore'
import { applyTheme } from '@/shared/utils/theme'

function RootLayout() {
  const themeMode = useSettingsStore((state) => state.themeMode)

  useEffect(() => {
    applyTheme(themeMode)
  }, [themeMode])

  return <Outlet />
}

export const Route = createRootRoute({
  component: RootLayout,
})
