import { createFileRoute } from '@tanstack/react-router'

import { SleepSettingsPage } from '@/features/sleep/pages/SleepSettingsPage'

export const Route = createFileRoute('/sleep/settings')({
  component: SleepSettingsPage,
})
