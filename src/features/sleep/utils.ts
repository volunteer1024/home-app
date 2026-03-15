import type { SongItem } from '@/features/sleep/types'

export function normalizeSearchText(value: string) {
  return value.trim().toLowerCase()
}

export function buildSongSearchIndex(song: SongItem) {
  return normalizeSearchText([song.title, ...song.aliases, ...song.tags].join(' '))
}

export function formatTime(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
