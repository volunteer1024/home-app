type TimerHandlers = {
  onTick: (remainingSeconds: number) => void
  onDone: () => void
}

class SleepTimer {
  private intervalId: number | null = null
  private timeoutId: number | null = null
  private endAt = 0

  start(minutes: number, handlers: TimerHandlers) {
    this.clear()

    const durationMs = minutes * 60 * 1000
    this.endAt = Date.now() + durationMs

    handlers.onTick(minutes * 60)

    this.intervalId = window.setInterval(() => {
      const remaining = Math.max(0, Math.round((this.endAt - Date.now()) / 1000))
      handlers.onTick(remaining)
    }, 1000)

    this.timeoutId = window.setTimeout(() => {
      handlers.onTick(0)
      handlers.onDone()
      this.clear()
    }, durationMs)
  }

  clear() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
    }

    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }
}

export const sleepTimer = new SleepTimer()
