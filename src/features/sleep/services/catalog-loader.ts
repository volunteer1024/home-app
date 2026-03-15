import type { SleepCatalog, SongItem } from '@/features/sleep/types'

function isSongItem(value: unknown): value is SongItem {
  if (!value || typeof value !== 'object') {
    return false
  }

  const song = value as SongItem

  return (
    typeof song.id === 'string' &&
    typeof song.title === 'string' &&
    typeof song.src === 'string' &&
    typeof song.durationSec === 'number' &&
    typeof song.order === 'number' &&
    Array.isArray(song.tags) &&
    Array.isArray(song.aliases)
  )
}

export async function loadSleepCatalog() {
  const response = await fetch('/data/sleep-catalog.v1.json', {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('歌单读取失败')
  }

  const data = (await response.json()) as SleepCatalog

  if (!data || typeof data.catalogVersion !== 'string' || !Array.isArray(data.songs)) {
    throw new Error('歌单格式不正确')
  }

  const songs = data.songs.filter(isSongItem).sort((a, b) => a.order - b.order)

  return {
    catalogVersion: data.catalogVersion,
    songs,
  }
}
