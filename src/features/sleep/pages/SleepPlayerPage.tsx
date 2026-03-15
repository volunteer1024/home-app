import { useMemo } from 'react'
import { AlertCircle, Disc3, Music4 } from 'lucide-react'

import { PlaybackControls } from '@/features/sleep/components/PlaybackControls'
import { TimerDialog } from '@/features/sleep/components/TimerDialog'
import { useCatalogStore } from '@/features/sleep/stores/useCatalogStore'
import { usePlayerStore } from '@/features/sleep/stores/usePlayerStore'
import { useSettingsStore } from '@/features/sleep/stores/useSettingsStore'
import { formatTime } from '@/features/sleep/utils'
import { zhCN } from '@/shared/copy/zh-CN'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Slider } from '@/shared/ui/slider'

import styles from './SleepPlayerPage.module.less'

export function SleepPlayerPage() {
  const songs = useCatalogStore((state) => state.songs)
  const catalogLoading = useCatalogStore((state) => state.loading)
  const catalogError = useCatalogStore((state) => state.errorMessage)
  const currentSongId = usePlayerStore((state) => state.currentSongId)
  const status = usePlayerStore((state) => state.status)
  const currentTimeSec = usePlayerStore((state) => state.currentTimeSec)
  const durationSec = usePlayerStore((state) => state.durationSec)
  const playbackMode = usePlayerStore((state) => state.playbackMode)
  const errorMessage = usePlayerStore((state) => state.errorMessage)
  const playSong = usePlayerStore((state) => state.playSong)
  const resumeCurrent = usePlayerStore((state) => state.resumeCurrent)
  const pause = usePlayerStore((state) => state.pause)
  const stop = usePlayerStore((state) => state.stop)
  const playPrev = usePlayerStore((state) => state.playPrev)
  const playNext = usePlayerStore((state) => state.playNext)
  const toggleQuickLoop = usePlayerStore((state) => state.toggleQuickLoop)
  const seek = usePlayerStore((state) => state.seek)
  const remainingSec = useSettingsStore((state) => state.sleepTimerRemainingSec)

  const currentSong = useMemo(() => {
    if (currentSongId) {
      return songs.find((song) => song.id === currentSongId) ?? null
    }

    return songs[0] ?? null
  }, [currentSongId, songs])

  const isPlaying = status === 'playing'
  const canControl = Boolean(currentSong)

  const handlePlayPause = async () => {
    if (!currentSong) {
      return
    }

    if (isPlaying) {
      pause()
      return
    }

    if (status === 'paused' && currentSongId) {
      await resumeCurrent()
      return
    }

    await playSong(currentSong.id, currentTimeSec)
  }

  return (
    <section className={styles.page}>
      <Card className={styles.heroCard}>
        <CardHeader className={styles.heroHeader}>
          <div className={styles.coverWrap}>
            {currentSong?.cover ? (
              <img className={styles.cover} src={currentSong.cover} alt={currentSong.title} />
            ) : (
              <div className={styles.coverPlaceholder}>
                <Music4 size={36} />
              </div>
            )}
          </div>
          <div className={styles.meta}>
            <span className={styles.eyebrow}>{zhCN.sleep.currentSong}</span>
            <CardTitle>{currentSong?.title ?? zhCN.sleep.noSong}</CardTitle>
            <CardDescription>
              {currentSong ? currentSong.tags.join(' · ') : zhCN.sleep.noSongTip}
            </CardDescription>
            <div className={styles.statusRow}>
              <span className={styles.statusBadge}>
                <Disc3 size={16} />
                {status === 'loading'
                  ? zhCN.common.loading
                  : isPlaying
                    ? zhCN.sleep.currentPlaying
                    : zhCN.sleep.moduleTip}
              </span>
              {remainingSec > 0 ? <span className={styles.timerBadge}>{formatTime(remainingSec)}</span> : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className={styles.content}>
          <div className={styles.progressBlock}>
            <div className={styles.progressHead}>
              <span>{zhCN.sleep.progress}</span>
              <span>
                {formatTime(currentTimeSec)} / {formatTime(durationSec || currentSong?.durationSec || 0)}
              </span>
            </div>
            <Slider
              value={[currentTimeSec]}
              min={0}
              max={durationSec || currentSong?.durationSec || 0}
              step={1}
              disabled={!canControl || !(durationSec || currentSong?.durationSec)}
              onValueChange={(value) => {
                if (value[0] !== undefined) {
                  seek(value[0])
                }
              }}
            />
          </div>

          <PlaybackControls
            isPlaying={isPlaying}
            isLoopActive={playbackMode === 'single'}
            disabled={!canControl}
            onPlayPause={() => void handlePlayPause()}
            onStop={stop}
            onPrev={() => void playPrev()}
            onNext={() => void playNext()}
            onToggleLoop={toggleQuickLoop}
          />

          <div className={styles.extraActions}>
            <TimerDialog />
            {currentSong ? (
              <Button type="button" variant="outline" onClick={() => void playSong(currentSong.id, 0)}>
                {zhCN.sleep.play}
              </Button>
            ) : null}
          </div>

          {catalogLoading ? <p className={styles.info}>{zhCN.sleep.loadingCatalog}</p> : null}
          {catalogError ? (
            <p className={styles.error}>
              <AlertCircle size={18} />
              {catalogError}
            </p>
          ) : null}
          {errorMessage ? (
            <p className={styles.error}>
              <AlertCircle size={18} />
              {errorMessage}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
