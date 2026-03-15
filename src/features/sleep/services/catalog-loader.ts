import type { SleepCatalog, SongItem } from '@/features/sleep/types'

function resolvePublicPath(path: string) {
  if (!path.startsWith('/')) {
    return path
  }

  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin)
  return new URL(path.slice(1), baseUrl).toString()
}

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
  const catalogUrl = new URL('data/sleep-catalog.v1.json', new URL(import.meta.env.BASE_URL, window.location.origin))

  const response = await fetch(catalogUrl, {
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

  const songs = data.songs
    .filter(isSongItem)
    .map((song) => ({
      ...song,
      src: resolvePublicPath(song.src),
      cover: song.cover ? resolvePublicPath(song.cover) : song.cover,
    }))
    .sort((a, b) => a.order - b.order)

  return {
    catalogVersion: data.catalogVersion,
    songs,
  }
}
