import { Music3 } from 'lucide-react'

import type { SongItem } from '@/features/sleep/types'
import { cn } from '@/shared/utils/cn'

import styles from './SongListItem.module.less'

type SongListItemProps = {
  song: SongItem
  active: boolean
  onClick: () => void
}

export function SongListItem({ song, active, onClick }: SongListItemProps) {
  return (
    <button
      type="button"
      className={cn(styles.item, active && styles.active)}
      onClick={onClick}
      aria-pressed={active}
    >
      <div className={styles.info}>
        <span className={styles.iconWrap}>
          <Music3 size={18} />
        </span>
        <div className={styles.texts}>
          <strong>{song.title}</strong>
          <span>{song.tags.join(' · ')}</span>
        </div>
      </div>
      {active ? <span className={styles.badge}>正在播放</span> : null}
    </button>
  )
}
