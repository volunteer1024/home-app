import { createFileRoute } from '@tanstack/react-router'

import { SleepListPage } from '@/features/sleep/pages/SleepListPage'

export const Route = createFileRoute('/sleep/list')({
  component: SleepListPage,
})
