import { Download, Moon, Sun, SunMoon, Volume2 } from 'lucide-react'

import { useCatalogStore } from '@/features/sleep/stores/useCatalogStore'
import { usePlayerStore } from '@/features/sleep/stores/usePlayerStore'
import { useSettingsStore } from '@/features/sleep/stores/useSettingsStore'
import type { PlaybackMode, ThemeMode } from '@/features/sleep/types'
import { zhCN } from '@/shared/copy/zh-CN'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Slider } from '@/shared/ui/slider'

import styles from './SleepSettingsPage.module.less'

const PLAYBACK_MODES: Array<{ mode: PlaybackMode; label: string }> = [
  { mode: 'single', label: zhCN.sleep.single },
  { mode: 'sequence', label: zhCN.sleep.sequence },
  { mode: 'shuffle', label: zhCN.sleep.shuffle },
]

const THEMES: Array<{ mode: ThemeMode; label: string; icon: typeof SunMoon }> = [
  { mode: 'auto', label: zhCN.sleep.themeAuto, icon: SunMoon },
  { mode: 'light', label: zhCN.sleep.themeLight, icon: Sun },
  { mode: 'dark', label: zhCN.sleep.themeDark, icon: Moon },
]

export function SleepSettingsPage() {
  const playbackMode = usePlayerStore((state) => state.playbackMode)
  const setPlaybackMode = usePlayerStore((state) => state.setPlaybackMode)
  const themeMode = useSettingsStore((state) => state.themeMode)
  const setThemeMode = useSettingsStore((state) => state.setThemeMode)
  const volume = useSettingsStore((state) => state.volume)
  const setVolume = useSettingsStore((state) => state.setVolume)
  const offlineStatus = useSettingsStore((state) => state.offlineStatus)
  const offlineProgress = useSettingsStore((state) => state.offlineProgress)
  const notice = useSettingsStore((state) => state.notice)
  const startOfflineCache = useSettingsStore((state) => state.startOfflineCache)
  const clearOfflineCache = useSettingsStore((state) => state.clearOfflineCache)
  const offlineCatalogVersion = useSettingsStore((state) => state.offlineCatalogVersion)
  const catalogVersion = useCatalogStore((state) => state.catalogVersion)

  return (
    <section className={styles.page}>
      <Card>
        <CardHeader>
          <CardTitle>{zhCN.sleep.modeTitle}</CardTitle>
          <CardDescription>{zhCN.sleep.settings}</CardDescription>
        </CardHeader>
        <CardContent className={styles.group}>
          <div className={styles.buttonGrid}>
            {PLAYBACK_MODES.map((item) => (
              <Button
                key={item.mode}
                type="button"
                variant={playbackMode === item.mode ? 'default' : 'secondary'}
                onClick={() => setPlaybackMode(item.mode)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{zhCN.sleep.themeTitle}</CardTitle>
        </CardHeader>
        <CardContent className={styles.group}>
          <div className={styles.buttonGrid}>
            {THEMES.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.mode}
                  type="button"
                  variant={themeMode === item.mode ? 'default' : 'secondary'}
                  onClick={() => setThemeMode(item.mode)}
                >
                  <Icon size={18} />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{zhCN.sleep.cacheTitle}</CardTitle>
          <CardDescription>{zhCN.sleep.cacheHint}</CardDescription>
        </CardHeader>
        <CardContent className={styles.group}>
          <div className={styles.sliderHeader}>
            <span>
              <Volume2 size={18} />
              默认音量
            </span>
            <strong>{Math.round(volume * 100)}%</strong>
          </div>
          <Slider
            value={[volume * 100]}
            min={0}
            max={80}
            step={1}
            onValueChange={(value) => {
              if (value[0] !== undefined) {
                setVolume(value[0] / 100)
              }
            }}
          />

          <div className={styles.buttonGrid}>
            <Button type="button" onClick={startOfflineCache}>
              <Download size={18} />
              {offlineStatus === 'caching' ? zhCN.sleep.cacheProgress.replace('{{progress}}', String(offlineProgress)) : zhCN.sleep.cacheStart}
            </Button>
            <Button type="button" variant="outline" onClick={clearOfflineCache}>
              {zhCN.sleep.cacheClear}
            </Button>
          </div>

          {offlineCatalogVersion && offlineCatalogVersion !== catalogVersion ? (
            <div className={styles.notice}>{zhCN.sleep.cacheUpdate}</div>
          ) : null}
          {notice ? <div className={styles.notice}>{notice}</div> : null}
          {offlineStatus === 'ready' ? <div className={styles.ready}>{zhCN.sleep.cacheReady}</div> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{zhCN.sleep.compatibilityTitle}</CardTitle>
          <CardDescription>{zhCN.sleep.compatibilityBody}</CardDescription>
        </CardHeader>
      </Card>
    </section>
  )
}
