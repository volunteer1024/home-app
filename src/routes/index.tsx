import { createFileRoute } from '@tanstack/react-router'

import { redirectToMusicList } from '@/routes/-redirectToMusicList'

export const Route = createFileRoute('/')({
  beforeLoad: redirectToMusicList,
})
