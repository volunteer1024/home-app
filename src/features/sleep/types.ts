export type PlaybackMode = 'single' | 'sequence' | 'shuffle'
export type ThemeMode = 'auto' | 'light' | 'dark'
export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'

export interface SongItem {
  id: string
  title: string
  src: string
  cover?: string
  durationSec: number
  tags: string[]
  aliases: string[]
  order: number
}

export interface SleepCatalog {
  catalogVersion: string
  songs: SongItem[]
}

export interface PersistedPlayerState {
  currentSongId: string | null
  currentTimeSec: number
  playbackMode: PlaybackMode
  lastNonSingleMode: Exclude<PlaybackMode, 'single'>
  themeMode: ThemeMode
  offlineCatalogVersion: string | null
}
