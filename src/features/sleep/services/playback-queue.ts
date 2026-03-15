import type { PlaybackMode, SongItem } from '@/features/sleep/types'

export function buildShuffleQueue(songs: SongItem[], currentSongId: string | null) {
  const ids = songs.map((song) => song.id)

  for (let index = ids.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[ids[index], ids[randomIndex]] = [ids[randomIndex], ids[index]]
  }

  if (currentSongId && ids.includes(currentSongId)) {
    ids.splice(ids.indexOf(currentSongId), 1)
    ids.unshift(currentSongId)
  }

  return ids
}

export function getSequenceNextId(songs: SongItem[], currentSongId: string | null) {
  if (!songs.length) {
    return null
  }

  if (!currentSongId) {
    return songs[0]?.id ?? null
  }

  const currentIndex = songs.findIndex((song) => song.id === currentSongId)
  if (currentIndex === -1 || currentIndex >= songs.length - 1) {
    return null
  }

  return songs[currentIndex + 1]?.id ?? null
}

export function getSequencePrevId(songs: SongItem[], currentSongId: string | null) {
  if (!songs.length) {
    return null
  }

  if (!currentSongId) {
    return songs[0]?.id ?? null
  }

  const currentIndex = songs.findIndex((song) => song.id === currentSongId)
  if (currentIndex <= 0) {
    return songs[0]?.id ?? null
  }

  return songs[currentIndex - 1]?.id ?? null
}

export function getShuffleNextId(
  songs: SongItem[],
  queue: string[],
  cursor: number,
  currentSongId: string | null,
) {
  const safeQueue = queue.length ? queue : buildShuffleQueue(songs, currentSongId)
  const safeCursor = cursor >= 0 ? cursor : 0
  const nextCursor = safeCursor + 1

  if (nextCursor < safeQueue.length) {
    return {
      nextId: safeQueue[nextCursor] ?? null,
      queue: safeQueue,
      cursor: nextCursor,
    }
  }

  const rebuiltQueue = buildShuffleQueue(songs, currentSongId)

  return {
    nextId: rebuiltQueue[0] ?? null,
    queue: rebuiltQueue,
    cursor: 0,
  }
}

export function getShufflePrevId(queue: string[], cursor: number) {
  if (!queue.length) {
    return null
  }

  const nextCursor = Math.max(0, cursor - 1)
  return {
    prevId: queue[nextCursor] ?? null,
    cursor: nextCursor,
  }
}

export function resolveBaseMode(mode: PlaybackMode, lastNonSingleMode: 'sequence' | 'shuffle') {
  return mode === 'single' ? lastNonSingleMode : mode
}
