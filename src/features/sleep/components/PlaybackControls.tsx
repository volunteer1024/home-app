import { PauseCircle, PlayCircle, Repeat1, SkipBack, SkipForward, Square } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { zhCN } from '@/shared/copy/zh-CN'

import styles from './PlaybackControls.module.less'

type PlaybackControlsProps = {
  isPlaying: boolean
  isLoopActive: boolean
  disabled?: boolean
  onPlayPause: () => void
  onStop: () => void
  onPrev: () => void
  onNext: () => void
  onToggleLoop: () => void
}

export function PlaybackControls({
  isPlaying,
  isLoopActive,
  disabled,
  onPlayPause,
  onStop,
  onPrev,
  onNext,
  onToggleLoop,
}: PlaybackControlsProps) {
  return (
    <div className={styles.grid}>
      <Button type="button" variant="secondary" disabled={disabled} onClick={onPrev}>
        <SkipBack size={22} />
        {zhCN.sleep.prev}
      </Button>
      <Button type="button" disabled={disabled} onClick={onPlayPause}>
        {isPlaying ? <PauseCircle size={22} /> : <PlayCircle size={22} />}
        {isPlaying ? zhCN.sleep.pause : zhCN.sleep.resume}
      </Button>
      <Button type="button" variant="secondary" disabled={disabled} onClick={onNext}>
        <SkipForward size={22} />
        {zhCN.sleep.next}
      </Button>
      <Button type="button" variant={isLoopActive ? 'default' : 'outline'} disabled={disabled} onClick={onToggleLoop}>
        <Repeat1 size={22} />
        {zhCN.sleep.loop}
      </Button>
      <Button type="button" variant="outline" disabled={disabled} onClick={onStop}>
        <Square size={22} />
        {zhCN.sleep.stop}
      </Button>
    </div>
  )
}
