import { TimerReset } from 'lucide-react'

import { useSettingsStore } from '@/features/sleep/stores/useSettingsStore'
import { formatTime } from '@/features/sleep/utils'
import { zhCN } from '@/shared/copy/zh-CN'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'

import styles from './TimerDialog.module.less'

const TIMER_OPTIONS = [10, 15, 30]

export function TimerDialog() {
  const remainingSec = useSettingsStore((state) => state.sleepTimerRemainingSec)
  const startSleepTimer = useSettingsStore((state) => state.startSleepTimer)
  const stopSleepTimer = useSettingsStore((state) => state.stopSleepTimer)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary">
          <TimerReset size={20} />
          {remainingSec > 0 ? `${zhCN.sleep.timer} · ${formatTime(remainingSec)}` : zhCN.sleep.timer}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{zhCN.sleep.timer}</DialogTitle>
          <DialogDescription>{zhCN.sleep.timerMinutes}</DialogDescription>
        </DialogHeader>

        <div className={styles.options}>
          {TIMER_OPTIONS.map((minutes) => (
            <Button key={minutes} type="button" variant="secondary" onClick={() => startSleepTimer(minutes)}>
              {minutes} 分钟
            </Button>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={stopSleepTimer}>
            {zhCN.sleep.timerOff}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
