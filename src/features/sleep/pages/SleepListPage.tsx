import { startTransition, useDeferredValue } from 'react'
import {
  AudioLines,
  Ellipsis,
  PauseCircle,
  PlayCircle,
  Search,
  Shuffle,
} from 'lucide-react'

import { useCatalogStore } from '@/features/sleep/stores/useCatalogStore'
import { usePlayerStore } from '@/features/sleep/stores/usePlayerStore'
import { useSettingsStore } from '@/features/sleep/stores/useSettingsStore'
import { zhCN } from '@/shared/copy/zh-CN'

import styles from './SleepListPage.module.less'

const fallbackCover = '/media/sleep/v1/covers/moon-river.svg'

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function SleepListPage() {
  const songs = useCatalogStore((state) => state.songs)
  const searchKeyword = useCatalogStore((state) => state.searchKeyword)
  const searchIndex = useCatalogStore((state) => state.searchIndex)
  const setSearchKeyword = useCatalogStore((state) => state.setSearchKeyword)
  const currentSongId = usePlayerStore((state) => state.currentSongId)
  const playerStatus = usePlayerStore((state) => state.status)
  const playSong = usePlayerStore((state) => state.playSong)
  const pause = usePlayerStore((state) => state.pause)
  const resumeCurrent = usePlayerStore((state) => state.resumeCurrent)
  const errorMessage = usePlayerStore((state) => state.errorMessage)
  const themeMode = useSettingsStore((state) => state.themeMode)
  const setThemeMode = useSettingsStore((state) => state.setThemeMode)
  const deferredKeyword = useDeferredValue(searchKeyword)

  const filteredSongs = deferredKeyword
    ? songs.filter((song) => searchIndex[song.id]?.includes(deferredKeyword))
    : songs

  const featuredSong =
    filteredSongs.find((song) => song.id === currentSongId) ??
    songs.find((song) => song.id === currentSongId) ??
    filteredSongs[0] ??
    songs[0] ??
    null

  const listSongs = featuredSong ? filteredSongs.filter((song) => song.id !== featuredSong.id) : filteredSongs
  const isCurrentFeatured = featuredSong?.id === currentSongId
  const isPlayingFeatured = isCurrentFeatured && playerStatus === 'playing'
  const isPausedFeatured = isCurrentFeatured && playerStatus === 'paused'
  const featuredSubtitle = isPlayingFeatured
    ? `正在播放 · ${featuredSong?.tags[0] ?? '自然音效'}`
    : isPausedFeatured
      ? `已暂停 · ${featuredSong?.tags[0] ?? '自然音效'}`
    : featuredSong
      ? `${featuredSong.tags[0] ?? '自然音效'} · ${formatDuration(featuredSong.durationSec)}`
      : '暂时还没有可播放的内容'

  async function handleSongAction(songId: string) {
    if (songId === currentSongId && playerStatus === 'playing') {
      pause()
      return
    }

    if (songId === currentSongId && playerStatus === 'paused') {
      await resumeCurrent()
      return
    }

    await playSong(songId, 0)
  }

  async function handleShufflePlay() {
    const pool = filteredSongs.length ? filteredSongs : songs
    if (!pool.length) {
      return
    }

    const nextSong = pool[Math.floor(Math.random() * pool.length)]
    await playSong(nextSong.id, 0)
  }

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <h1 className={styles.title}>助眠音乐</h1>
            <button
              type="button"
              className={styles.iconButton}
              aria-label={themeMode === 'dark' ? zhCN.home.switchToLight : zhCN.home.switchToDark}
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            >
              <Ellipsis size={28} />
            </button>
          </div>

          <label className={styles.searchWrap}>
            <span className={styles.searchIcon}>
              <Search size={24} />
            </span>
            <input
              className={styles.searchInput}
              value={searchKeyword}
              placeholder="搜索歌曲或艺人"
              type="text"
              onChange={(event) => {
                startTransition(() => {
                  setSearchKeyword(event.target.value)
                })
              }}
            />
          </label>
        </header>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <p className={styles.counter}>
              {deferredKeyword ? '搜索结果' : '全部歌曲'} ({filteredSongs.length})
            </p>
            <button type="button" className={styles.shuffleButton} onClick={() => void handleShufflePlay()}>
              <Shuffle size={20} />
              随机播放
            </button>
          </div>

          {featuredSong ? (
            <button
              type="button"
              className={styles.featuredCard}
              onClick={() => void handleSongAction(featuredSong.id)}
            >
              <div className={styles.featuredCoverWrap}>
                <div
                  className={styles.featuredCover}
                  style={{ backgroundImage: `url("${featuredSong.cover ?? fallbackCover}")` }}
                />
                <div className={styles.featuredOverlay}>
                  {isPlayingFeatured ? <PauseCircle size={44} /> : <PlayCircle size={44} />}
                </div>
              </div>

              <div className={styles.featuredContent}>
                <p className={styles.featuredTitle}>{featuredSong.title}</p>
                <p className={styles.featuredMeta}>{featuredSubtitle}</p>
              </div>

              <div className={styles.featuredSignal}>
                <AudioLines size={28} />
              </div>
            </button>
          ) : null}

          <div className={styles.songList}>
            {listSongs.length ? (
              listSongs.map((song) => (
                <div key={song.id} className={styles.songRow}>
                  <button type="button" className={styles.songMain} onClick={() => void handleSongAction(song.id)}>
                    <div
                      className={styles.songCover}
                      style={{ backgroundImage: `url("${song.cover ?? fallbackCover}")` }}
                    />
                    <div className={styles.songText}>
                      <p className={styles.songTitle}>{song.title}</p>
                      <p className={styles.songMeta}>
                        {(song.tags[0] ?? '自然音') + ' · ' + formatDuration(song.durationSec)}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={styles.songAction}
                    aria-label={`${song.id === currentSongId && playerStatus === 'playing' ? '暂停' : '播放'} ${song.title}`}
                    onClick={() => void handleSongAction(song.id)}
                  >
                    {song.id === currentSongId && playerStatus === 'playing' ? (
                      <PauseCircle size={34} />
                    ) : (
                      <PlayCircle size={34} />
                    )}
                  </button>
                </div>
              ))
            ) : (
              <div className={styles.empty}>{zhCN.sleep.noSong}</div>
            )}
          </div>
          {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
        </main>
      </div>
    </section>
  )
}
