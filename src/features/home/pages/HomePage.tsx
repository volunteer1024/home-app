import { MoonStar, Music4, SunMedium } from 'lucide-react'

import { FeatureEntryCard } from '@/features/home/components/FeatureEntryCard'
import { usePlayerStore } from '@/features/sleep/stores/usePlayerStore'
import { useSettingsStore } from '@/features/sleep/stores/useSettingsStore'
import { zhCN } from '@/shared/copy/zh-CN'
import { Button } from '@/shared/ui/button'

import styles from './HomePage.module.less'

export function HomePage() {
  const currentSongId = usePlayerStore((state) => state.currentSongId)
  const themeMode = useSettingsStore((state) => state.themeMode)
  const setThemeMode = useSettingsStore((state) => state.setThemeMode)
  const isDark = themeMode === 'dark'

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <span className={styles.heroBadge}>{zhCN.app.title}</span>
          <Button
            type="button"
            variant="secondary"
            className={styles.themeButton}
            onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
          >
            {isDark ? <SunMedium size={20} /> : <MoonStar size={20} />}
            {isDark ? zhCN.home.switchToLight : zhCN.home.switchToDark}
          </Button>
        </div>
        <h1 className={styles.title}>{zhCN.home.heroTitle}</h1>
        <p className={styles.description}>{zhCN.home.heroDescription}</p>
      </section>

      <section className={styles.grid}>
        <FeatureEntryCard
          icon={<Music4 size={28} strokeWidth={2.25} />}
          title={zhCN.home.sleepTitle}
          description={zhCN.home.sleepDescription}
          href="/sleep/player"
          actionLabel={zhCN.home.sleepAction}
          secondaryActionLabel={currentSongId ? zhCN.home.resumeLastSong : undefined}
          secondaryActionHref={currentSongId ? '/sleep/player' : undefined}
        />

        {/*
          发票功能暂时下线，首页入口先注释保留，后续恢复时可直接打开。
        <FeatureEntryCard
          icon={<ReceiptText size={28} strokeWidth={2.25} />}
          title={zhCN.home.invoiceTitle}
          description={zhCN.home.invoiceDescription}
          href="/invoice"
          actionLabel={zhCN.home.invoiceAction}
          badge={zhCN.home.invoiceComingSoon}
        />
        */}
      </section>
    </main>
  )
}
