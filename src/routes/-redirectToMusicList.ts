import { redirect } from '@tanstack/react-router'

export function redirectToMusicList() {
  throw redirect({
    to: '/sleep/list',
  })
}
