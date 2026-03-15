import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { audioEngine } from '@/features/sleep/services/audio-engine'
import {
  buildShuffleQueue,
  getSequenceNextId,
  getSequencePrevId,
  getShuffleNextId,
  getShufflePrevId,
  resolveBaseMode,
} from '@/features/sleep/services/playback-queue'
import type { PlaybackMode, PlayerStatus } from '@/features/sleep/types'
import { useCatalogStore } from '@/features/sleep/stores/useCatalogStore'
import { useSettingsStore } from '@/features/sleep/stores/useSettingsStore'
import { zhCN } from '@/shared/copy/zh-CN'

type PlayerState = {
  currentSongId: string | null
  status: PlayerStatus
  currentTimeSec: number
  durationSec: number
  playbackMode: PlaybackMode
  lastNonSingleMode: 'sequence' | 'shuffle'
  shuffleQueue: string[]
  shuffleCursor: number
  errorMessage: string
  bootstrapped: boolean
  ensureReady: () => void
  playSong: (songId: string, startAtSec?: number) => Promise<void>
  resumeCurrent: () => Promise<void>
  pause: () => void
  stop: () => void
  playNext: () => Promise<void>
  playPrev: () => Promise<void>
  seek: (seconds: number) => void
  setPlaybackMode: (mode: PlaybackMode) => void
  toggleQuickLoop: () => void
}

let audioBound = false

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSongId: null,
      status: 'idle',
      currentTimeSec: 0,
      durationSec: 0,
      playbackMode: 'sequence',
      lastNonSingleMode: 'sequence',
      shuffleQueue: [],
      shuffleCursor: -1,
      errorMessage: '',
      bootstrapped: false,
      ensureReady() {
        audioEngine.init()
        audioEngine.setVolume(useSettingsStore.getState().volume)

        if (!audioBound) {
          audioBound = true

          audioEngine.addEventListener('audio:play', () => set({ status: 'playing', errorMessage: '' }))
          audioEngine.addEventListener('audio:pause', () => {
            const currentTimeSec = audioEngine.getCurrentTime()
            set((state) => ({
              status: state.status === 'ended' ? 'ended' : 'paused',
              currentTimeSec,
            }))
          })
          audioEngine.addEventListener('audio:timeupdate', () => {
            set({
              currentTimeSec: audioEngine.getCurrentTime(),
              durationSec: audioEngine.getDuration(),
            })
          })
          audioEngine.addEventListener('audio:loaded', () => {
            set({
              durationSec: audioEngine.getDuration(),
            })
          })
          audioEngine.addEventListener('audio:error', () => {
            set({
              status: 'error',
              errorMessage: zhCN.sleep.mediaError,
            })
          })
          audioEngine.addEventListener('audio:ended', async () => {
            set({ status: 'ended', currentTimeSec: 0 })

            const state = get()
            if (state.playbackMode === 'single') {
              if (state.currentSongId) {
                await state.playSong(state.currentSongId, 0)
              }
              return
            }

            await state.playNext()
          })
        }

        if (!get().bootstrapped) {
          set({ bootstrapped: true })
        }
      },
      async playSong(songId, startAtSec = 0) {
        get().ensureReady()

        const song = useCatalogStore.getState().songs.find((item) => item.id === songId)
        if (!song) {
          set({
            status: 'error',
            errorMessage: zhCN.sleep.noSongTip,
          })
          return
        }

        try {
          set({
            status: 'loading',
            currentSongId: songId,
            errorMessage: '',
          })

          await audioEngine.load(song, startAtSec)
          await audioEngine.play()

          set({
            currentSongId: songId,
            currentTimeSec: startAtSec,
            durationSec: song.durationSec,
            status: 'playing',
          })

          const baseMode = resolveBaseMode(get().playbackMode, get().lastNonSingleMode)
          if (baseMode === 'shuffle') {
            const queue = get().shuffleQueue.length
              ? get().shuffleQueue
              : buildShuffleQueue(useCatalogStore.getState().songs, songId)

            set({
              shuffleQueue: queue,
              shuffleCursor: Math.max(0, queue.indexOf(songId)),
            })
          }
        } catch (error) {
          set({
            status: 'error',
            errorMessage: error instanceof Error ? error.message : zhCN.sleep.mediaError,
          })
        }
      },
      async resumeCurrent() {
        const state = get()
        const targetSongId = state.currentSongId
        if (!targetSongId) {
          return
        }

        await state.playSong(targetSongId, state.currentTimeSec)
      },
      pause() {
        audioEngine.pause()
        set({ status: 'paused' })
      },
      stop() {
        audioEngine.stop()
        set({
          status: 'idle',
          currentTimeSec: 0,
        })
      },
      async playNext() {
        const songs = useCatalogStore.getState().songs
        const state = get()
        const baseMode = resolveBaseMode(state.playbackMode, state.lastNonSingleMode)

        if (baseMode === 'shuffle') {
          const result = getShuffleNextId(songs, state.shuffleQueue, state.shuffleCursor, state.currentSongId)
          set({
            shuffleQueue: result.queue,
            shuffleCursor: result.cursor,
          })
          if (result.nextId) {
            await state.playSong(result.nextId, 0)
          } else {
            state.stop()
          }
          return
        }

        const nextId = getSequenceNextId(songs, state.currentSongId)
        if (nextId) {
          await state.playSong(nextId, 0)
        } else {
          state.stop()
        }
      },
      async playPrev() {
        const songs = useCatalogStore.getState().songs
        const state = get()
        const baseMode = resolveBaseMode(state.playbackMode, state.lastNonSingleMode)

        if (baseMode === 'shuffle') {
          const result = getShufflePrevId(state.shuffleQueue, state.shuffleCursor)
          if (result?.prevId) {
            set({ shuffleCursor: result.cursor })
            await state.playSong(result.prevId, 0)
          }
          return
        }

        const prevId = getSequencePrevId(songs, state.currentSongId)
        if (prevId) {
          await state.playSong(prevId, 0)
        }
      },
      seek(seconds) {
        audioEngine.seek(seconds)
        set({ currentTimeSec: seconds })
      },
      setPlaybackMode(mode) {
        const currentSongId = get().currentSongId
        const songs = useCatalogStore.getState().songs

        if (mode === 'single') {
          set({ playbackMode: 'single' })
          return
        }

        set({
          playbackMode: mode,
          lastNonSingleMode: mode,
          shuffleQueue: mode === 'shuffle' ? buildShuffleQueue(songs, currentSongId) : [],
          shuffleCursor: mode === 'shuffle' && currentSongId ? 0 : -1,
        })
      },
      toggleQuickLoop() {
        const { playbackMode, lastNonSingleMode } = get()
        if (playbackMode === 'single') {
          get().setPlaybackMode(lastNonSingleMode)
          return
        }

        set({ playbackMode: 'single' })
      },
    }),
    {
      name: 'pai-player',
      partialize: (state) => ({
        currentSongId: state.currentSongId,
        currentTimeSec: state.currentTimeSec,
        playbackMode: state.playbackMode,
        lastNonSingleMode: state.lastNonSingleMode,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
