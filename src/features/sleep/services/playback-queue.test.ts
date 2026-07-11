import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getSequenceNextId,
  getSequencePrevId,
  getShuffleNextId,
  getShufflePrevId,
} from './playback-queue'

const songs = [
  { id: 'first', title: 'First', src: '/first.mp3', durationSec: 60, tags: [], aliases: [], order: 1 },
  { id: 'middle', title: 'Middle', src: '/middle.mp3', durationSec: 60, tags: [], aliases: [], order: 2 },
  { id: 'last', title: 'Last', src: '/last.mp3', durationSec: 60, tags: [], aliases: [], order: 3 },
]

describe('playback queue navigation', () => {
  afterEach(() => vi.restoreAllMocks())

  it('wraps sequence navigation from the last song to the first', () => {
    expect(getSequenceNextId(songs, 'last')).toBe('first')
  })

  it('wraps sequence navigation from the first song to the last', () => {
    expect(getSequencePrevId(songs, 'first')).toBe('last')
  })

  it('rebuilds a random queue past the current song at its end', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    expect(getShuffleNextId(songs, ['first', 'middle', 'last'], 2, 'last')).toEqual({
      nextId: 'middle',
      queue: ['last', 'middle', 'first'],
      cursor: 1,
    })
  })

  it('wraps random previous navigation from the first queue item to the last', () => {
    expect(getShufflePrevId(['first', 'middle', 'last'], 0)).toEqual({
      prevId: 'last',
      cursor: 2,
    })
  })
})
