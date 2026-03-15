import { type PropsWithChildren } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { House, ListMusic, Music4, Settings2 } from 'lucide-react'

import { zhCN } from '@/shared/copy/zh-CN'
import { cn } from '@/shared/utils/cn'

import styles from './SleepLayout.module.less'

const NAV_ITEMS = [
  { to: '/sleep/player', label: zhCN.nav.player, icon: Music4 },
  { to: '/sleep/list', label: zhCN.nav.list, icon: ListMusic },
  { to: '/sleep/settings', label: zhCN.nav.settings, icon: Settings2 },
] as const

export function SleepLayout({ children }: PropsWithChildren) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <main className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>{zhCN.sleep.moduleTitle}</h1>
          <p className={styles.subtitle}>{zhCN.sleep.moduleTip}</p>
        </div>
        <Link to="/" className={styles.homeLink}>
          <House size={18} />
          {zhCN.common.backHome}
        </Link>
      </div>

      <section className={styles.content}>{children}</section>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = pathname === item.to

          return (
            <Link key={item.to} to={item.to} className={cn(styles.navItem, active && styles.navItemActive)}>
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </main>
  )
}
