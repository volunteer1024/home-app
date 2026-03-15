import { createFileRoute } from '@tanstack/react-router'

import { SleepPlayerPage } from '@/features/sleep/pages/SleepPlayerPage'

export const Route = createFileRoute('/sleep/player')({
  component: SleepPlayerPage,
})
