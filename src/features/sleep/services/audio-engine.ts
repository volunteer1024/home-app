import type { SongItem } from '@/features/sleep/types'

type AudioEventName = 'audio:play' | 'audio:pause' | 'audio:timeupdate' | 'audio:loaded' | 'audio:ended' | 'audio:error'

class AudioEngine extends EventTarget {
  private audio: HTMLAudioElement | null = null

  init() {
    if (typeof window === 'undefined') {
      return
    }

    if (this.audio) {
      return
    }

    this.audio = new Audio()
    this.audio.preload = 'none'
    this.audio.setAttribute('playsinline', 'true')
    this.audio.crossOrigin = 'anonymous'

    this.audio.addEventListener('play', () => this.dispatch('audio:play'))
    this.audio.addEventListener('pause', () => this.dispatch('audio:pause'))
    this.audio.addEventListener('timeupdate', () => this.dispatch('audio:timeupdate'))
    this.audio.addEventListener('loadedmetadata', () => this.dispatch('audio:loaded'))
    this.audio.addEventListener('ended', () => this.dispatch('audio:ended'))
    this.audio.addEventListener('error', () => this.dispatch('audio:error'))
  }

  private dispatch(type: AudioEventName) {
    this.dispatchEvent(new Event(type))
  }

  async load(song: SongItem, startAtSec = 0) {
    this.init()
    if (!this.audio) {
      return
    }

    if (this.audio.src !== song.src) {
      this.audio.src = song.src
    }

    this.audio.currentTime = startAtSec
    this.audio.load()
  }

  async play() {
    this.init()
    if (!this.audio) {
      return
    }

    await this.audio.play()
  }

  pause() {
    this.audio?.pause()
  }

  stop() {
    if (!this.audio) {
      return
    }

    this.audio.pause()
    this.audio.currentTime = 0
  }

  seek(seconds: number) {
    if (!this.audio) {
      return
    }

    this.audio.currentTime = seconds
  }

  setVolume(volume: number) {
    if (!this.audio) {
      return
    }

    this.audio.volume = volume
  }

  getCurrentTime() {
    return this.audio?.currentTime ?? 0
  }

  getDuration() {
    return this.audio?.duration ?? 0
  }

  destroy() {
    if (!this.audio) {
      return
    }

    this.audio.pause()
    this.audio.src = ''
    this.audio.load()
    this.audio = null
  }
}

export const audioEngine = new AudioEngine()
