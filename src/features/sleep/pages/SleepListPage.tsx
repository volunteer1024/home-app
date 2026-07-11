import { startTransition, useDeferredValue, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import {
  Ellipsis,
  PauseCircle,
  PlayCircle,
  Repeat1,
  Repeat2,
  Search,
  Shuffle,
} from 'lucide-react'

import { useCatalogStore } from '@/features/sleep/stores/useCatalogStore'
import { usePlayerStore } from '@/features/sleep/stores/usePlayerStore'
import type { PlaybackMode } from '@/features/sleep/types'
import { useSettingsStore } from '@/features/sleep/stores/useSettingsStore'
import { zhCN } from '@/shared/copy/zh-CN'

import styles from './SleepListPage.module.less'

const fallbackCover = '/media/sleep/v1/covers/moon-river.svg'
const MINI_PLAYER_SWIPE_THRESHOLD = 56
const MINI_PLAYER_MAX_DRAG = 24

const PLAYBACK_MODE_META: Record<
  PlaybackMode,
  { label: string; nextMode: PlaybackMode; nextLabel: string; Icon: typeof Shuffle }
> = {
  shuffle: { label: '随机', nextMode: 'single', nextLabel: '单曲循环', Icon: Shuffle },
  single: { label: '单曲循环', nextMode: 'sequence', nextLabel: '顺序播放', Icon: Repeat1 },
  sequence: { label: '顺序播放', nextMode: 'shuffle', nextLabel: '随机', Icon: Repeat2 },
}

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
  const playPrev = usePlayerStore((state) => state.playPrev)
  const playNext = usePlayerStore((state) => state.playNext)
  const pause = usePlayerStore((state) => state.pause)
  const resumeCurrent = usePlayerStore((state) => state.resumeCurrent)
  const playbackMode = usePlayerStore((state) => state.playbackMode)
  const setPlaybackMode = usePlayerStore((state) => state.setPlaybackMode)
  const errorMessage = usePlayerStore((state) => state.errorMessage)
  const themeMode = useSettingsStore((state) => state.themeMode)
  const setThemeMode = useSettingsStore((state) => state.setThemeMode)
  const deferredKeyword = useDeferredValue(searchKeyword)
  const miniPlayerGestureRef = useRef<{ pointerId: number; x: number; y: number } | null>(null)
  const [miniPlayerDragX, setMiniPlayerDragX] = useState(0)
  const [isMiniPlayerDragging, setIsMiniPlayerDragging] = useState(false)

  const filteredSongs = deferredKeyword
    ? songs.filter((song) => searchIndex[song.id]?.includes(deferredKeyword))
    : songs

  const currentSong = songs.find((song) => song.id === currentSongId) ?? null
  const modeMeta = PLAYBACK_MODE_META[playbackMode]
  const ModeIcon = modeMeta.Icon
  const currentSongStatus = playerStatus === 'playing' ? '正在播放' : playerStatus === 'paused' ? '已暂停' : '准备播放'

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

  function handlePlaybackModeChange() {
    setPlaybackMode(modeMeta.nextMode)
  }

  function resetMiniPlayerGesture() {
    miniPlayerGestureRef.current = null
    setMiniPlayerDragX(0)
    setIsMiniPlayerDragging(false)
  }

  function handleMiniPlayerPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.target instanceof Element && event.target.closest('button')) {
      return
    }

    miniPlayerGestureRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setIsMiniPlayerDragging(true)
  }

  function handleMiniPlayerPointerMove(event: PointerEvent<HTMLElement>) {
    const gesture = miniPlayerGestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return
    }

    const deltaX = event.clientX - gesture.x
    const deltaY = event.clientY - gesture.y
    if (Math.abs(deltaX) <= Math.abs(deltaY)) {
      return
    }

    setMiniPlayerDragX(Math.max(-MINI_PLAYER_MAX_DRAG, Math.min(MINI_PLAYER_MAX_DRAG, deltaX)))
  }

  function handleMiniPlayerPointerUp(event: PointerEvent<HTMLElement>) {
    const gesture = miniPlayerGestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return
    }

    const deltaX = event.clientX - gesture.x
    const deltaY = event.clientY - gesture.y
    const isConfirmedSwipe = Math.abs(deltaX) >= MINI_PLAYER_SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)

    resetMiniPlayerGesture()

    if (isConfirmedSwipe) {
      void (deltaX < 0 ? playPrev() : playNext())
    }
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
            <button
              type="button"
              className={styles.modeButton}
              aria-label={`当前模式：${modeMeta.label}。点击切换到${modeMeta.nextLabel}`}
              onClick={handlePlaybackModeChange}
            >
              <ModeIcon size={20} />
              {modeMeta.label}
            </button>
          </div>

          <div className={styles.songList}>
            {filteredSongs.length ? (
              filteredSongs.map((song) => {
                const isCurrentSong = song.id === currentSongId
                const isPlayingSong = isCurrentSong && playerStatus === 'playing'

                return (
                <div key={song.id} className={`${styles.songRow} ${isCurrentSong ? styles.songRowActive : ''}`}>
                  <button type="button" className={styles.songMain} onClick={() => void handleSongAction(song.id)}>
                    <div
                      className={styles.songCover}
                      style={{ backgroundImage: `url("${song.cover ?? fallbackCover}")` }}
                    />
                    <div className={styles.songText}>
                      <p className={styles.songTitle}>{song.title}</p>
                      <p className={styles.songMeta}>
                        {isCurrentSong
                          ? `${currentSongStatus} · ${song.tags[0] ?? '自然音'}`
                          : (song.tags[0] ?? '自然音') + ' · ' + formatDuration(song.durationSec)}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={styles.songAction}
                    aria-label={`${isPlayingSong ? '暂停' : '播放'} ${song.title}`}
                    onClick={() => void handleSongAction(song.id)}
                  >
                    {isPlayingSong ? (
                      <PauseCircle size={34} />
                    ) : (
                      <PlayCircle size={34} />
                    )}
                  </button>
                </div>
                )
              })
            ) : (
              <div className={styles.empty}>{zhCN.sleep.noSong}</div>
            )}
          </div>
          {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
        </main>
      </div>
      {currentSong ? (
        <aside
          className={`${styles.miniPlayer} ${isMiniPlayerDragging ? styles.miniPlayerDragging : ''}`}
          aria-label="当前播放"
          style={{ '--mini-player-drag-x': `${miniPlayerDragX}px` } as CSSProperties}
          onPointerDown={handleMiniPlayerPointerDown}
          onPointerMove={handleMiniPlayerPointerMove}
          onPointerUp={handleMiniPlayerPointerUp}
          onPointerCancel={resetMiniPlayerGesture}
        >
          <div
            className={styles.miniCover}
            style={{ backgroundImage: `url("${currentSong.cover ?? fallbackCover}")` }}
            aria-hidden="true"
          />
          <div className={styles.miniContent}>
            <p className={styles.miniTitle}>{currentSong.title}</p>
            <p className={styles.miniMeta}>{currentSongStatus}</p>
          </div>
          <button
            type="button"
            className={styles.miniAction}
            aria-label={`${playerStatus === 'playing' ? '暂停' : '播放'} ${currentSong.title}`}
            onClick={() => void handleSongAction(currentSong.id)}
          >
            {playerStatus === 'playing' ? <PauseCircle size={34} /> : <PlayCircle size={34} />}
          </button>
        </aside>
      ) : null}
    </section>
  )
}
