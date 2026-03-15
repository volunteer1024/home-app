import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/sleep/')({
  beforeLoad: () => {
    throw redirect({
      to: '/sleep/player',
    })
  },
})
