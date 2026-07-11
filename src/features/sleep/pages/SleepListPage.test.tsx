import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  pause: vi.fn(),
  playSong: vi.fn(),
  playPrev: vi.fn(),
  playNext: vi.fn(),
  resumeCurrent: vi.fn(),
  setPlaybackMode: vi.fn(),
  setSearchKeyword: vi.fn(),
  setThemeMode: vi.fn(),
}))

const song = {
  id: 'moon-river',
  title: 'Moon River',
  src: '/media/moon-river.mp3',
  durationSec: 180,
  tags: ['摇篮曲'],
  aliases: [],
  order: 1,
}

const secondSong = {
  id: 'twinkle',
  title: 'Twinkle Twinkle',
  src: '/media/twinkle.mp3',
  durationSec: 120,
  tags: ['儿歌'],
  aliases: [],
  order: 2,
}

const catalogState = {
  songs: [song, secondSong],
  searchKeyword: '',
  searchIndex: { [song.id]: 'moon river 摇篮曲', [secondSong.id]: 'twinkle twinkle 儿歌' },
  setSearchKeyword: mocks.setSearchKeyword,
}

const playerState = {
  currentSongId: song.id,
  status: 'playing',
  playbackMode: 'shuffle',
  errorMessage: '',
  playSong: mocks.playSong,
  playPrev: mocks.playPrev,
  playNext: mocks.playNext,
  pause: mocks.pause,
  resumeCurrent: mocks.resumeCurrent,
  setPlaybackMode: mocks.setPlaybackMode,
}

const settingsState = {
  themeMode: 'auto',
  setThemeMode: mocks.setThemeMode,
}

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => mocks.navigate,
}))

vi.mock('@/features/sleep/stores/useCatalogStore', () => ({
  useCatalogStore: <T,>(selector: (state: typeof catalogState) => T) => selector(catalogState),
}))

vi.mock('@/features/sleep/stores/usePlayerStore', () => ({
  usePlayerStore: <T,>(selector: (state: typeof playerState) => T) => selector(playerState),
}))

vi.mock('@/features/sleep/stores/useSettingsStore', () => ({
  useSettingsStore: <T,>(selector: (state: typeof settingsState) => T) => selector(settingsState),
}))

import { SleepListPage } from './SleepListPage'

function firePointerEvent(
  node: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  { pointerId, clientX, clientY }: { pointerId: number; clientX: number; clientY: number },
) {
  const event = new MouseEvent(type, { bubbles: true, clientX, clientY })
  Object.defineProperty(event, 'pointerId', { value: pointerId })
  fireEvent(node, event)
}

describe('SleepListPage', () => {
  beforeEach(() => {
    playerState.currentSongId = song.id
    playerState.status = 'playing'
    playerState.playbackMode = 'shuffle'
    playerState.errorMessage = ''
    catalogState.searchKeyword = ''
    settingsState.themeMode = 'auto'
    mocks.navigate.mockReset()
    mocks.pause.mockReset()
    mocks.playSong.mockReset()
    mocks.playPrev.mockReset()
    mocks.playNext.mockReset()
    mocks.resumeCurrent.mockReset()
    mocks.setPlaybackMode.mockReset()
    mocks.setThemeMode.mockReset()
  })

  afterEach(cleanup)

  it('pauses the current song from the list without navigating away', async () => {
    const user = userEvent.setup()

    render(<SleepListPage />)
    await user.click(screen.getByRole('button', { name: 'Moon River 正在播放 · 摇篮曲' }))

    expect(mocks.pause).toHaveBeenCalledOnce()
    expect(mocks.playSong).not.toHaveBeenCalled()
    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  it('resumes the current paused song from the list', async () => {
    playerState.status = 'paused'
    const user = userEvent.setup()

    render(<SleepListPage />)
    await user.click(screen.getByRole('button', { name: 'Moon River 已暂停 · 摇篮曲' }))

    expect(mocks.resumeCurrent).toHaveBeenCalledOnce()
    expect(mocks.playSong).not.toHaveBeenCalled()
  })

  it('starts a newly selected song from the list without navigating away', async () => {
    const user = userEvent.setup()

    render(<SleepListPage />)
    await user.click(screen.getByRole('button', { name: /^Twinkle Twinkle/ }))

    expect(mocks.playSong).toHaveBeenCalledWith(secondSong.id, 0)
    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  it('shows playback errors within the list', () => {
    playerState.errorMessage = '歌曲暂时无法播放，请重试'

    render(<SleepListPage />)

    expect(screen.getByText('歌曲暂时无法播放，请重试')).toBeTruthy()
  })

  it('keeps the catalog order when the current song is not the first song', () => {
    playerState.currentSongId = secondSong.id

    render(<SleepListPage />)

    const songList = screen.getByRole('main')
    const firstSongTitle = within(songList).getByText(song.title)
    const secondSongTitle = within(songList).getByText(secondSong.title)

    expect(firstSongTitle.compareDocumentPosition(secondSongTitle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('keeps search result order when the current song is in the results', () => {
    playerState.currentSongId = secondSong.id
    catalogState.searchKeyword = 't'

    render(<SleepListPage />)

    const songList = screen.getByRole('main')
    expect(within(songList).queryByText(song.title)).toBeNull()
    expect(within(songList).getByText(secondSong.title)).toBeTruthy()
  })

  it('controls the current song from a fixed bottom mini player', async () => {
    const user = userEvent.setup()

    render(<SleepListPage />)
    await user.click(within(screen.getByLabelText('当前播放')).getByRole('button', { name: '暂停 Moon River' }))

    expect(mocks.pause).toHaveBeenCalledOnce()
  })

  it('switches to the previous song after a confirmed left swipe on the mini player', () => {
    render(<SleepListPage />)
    const miniPlayer = screen.getByLabelText('当前播放')

    firePointerEvent(miniPlayer, 'pointerdown', { pointerId: 1, clientX: 160, clientY: 20 })
    firePointerEvent(miniPlayer, 'pointermove', { pointerId: 1, clientX: 90, clientY: 20 })
    firePointerEvent(miniPlayer, 'pointerup', { pointerId: 1, clientX: 90, clientY: 20 })

    expect(mocks.playPrev).toHaveBeenCalledOnce()
    expect(mocks.playNext).not.toHaveBeenCalled()
  })

  it('switches to the next song after a confirmed right swipe on the mini player', () => {
    render(<SleepListPage />)
    const miniPlayer = screen.getByLabelText('当前播放')

    firePointerEvent(miniPlayer, 'pointerdown', { pointerId: 1, clientX: 90, clientY: 20 })
    firePointerEvent(miniPlayer, 'pointerup', { pointerId: 1, clientX: 160, clientY: 20 })

    expect(mocks.playNext).toHaveBeenCalledOnce()
    expect(mocks.playPrev).not.toHaveBeenCalled()
  })

  it('does not switch songs after a short or vertical mini-player gesture', () => {
    render(<SleepListPage />)
    const miniPlayer = screen.getByLabelText('当前播放')

    firePointerEvent(miniPlayer, 'pointerdown', { pointerId: 1, clientX: 100, clientY: 20 })
    firePointerEvent(miniPlayer, 'pointerup', { pointerId: 1, clientX: 140, clientY: 20 })
    firePointerEvent(miniPlayer, 'pointerdown', { pointerId: 2, clientX: 100, clientY: 20 })
    firePointerEvent(miniPlayer, 'pointerup', { pointerId: 2, clientX: 170, clientY: 120 })

    expect(mocks.playNext).not.toHaveBeenCalled()
    expect(mocks.playPrev).not.toHaveBeenCalled()
  })

  it('keeps pointer gestures starting from the play button out of song navigation', () => {
    render(<SleepListPage />)
    const miniPlayer = screen.getByLabelText('当前播放')
    const playButton = within(miniPlayer).getByRole('button', { name: '暂停 Moon River' })

    firePointerEvent(playButton, 'pointerdown', { pointerId: 1, clientX: 160, clientY: 20 })
    firePointerEvent(playButton, 'pointerup', { pointerId: 1, clientX: 90, clientY: 20 })

    expect(mocks.playNext).not.toHaveBeenCalled()
    expect(mocks.playPrev).not.toHaveBeenCalled()
  })

  it('cycles the playback mode through shuffle, single repeat, and sequence', async () => {
    const user = userEvent.setup()
    mocks.setPlaybackMode.mockImplementation((mode) => {
      playerState.playbackMode = mode
    })

    const view = render(<SleepListPage />)
    await user.click(screen.getByRole('button', { name: '当前模式：随机。点击切换到单曲循环' }))

    expect(mocks.setPlaybackMode).toHaveBeenCalledWith('single')

    view.rerender(<SleepListPage />)
    await user.click(screen.getByRole('button', { name: '当前模式：单曲循环。点击切换到顺序播放' }))

    expect(mocks.setPlaybackMode).toHaveBeenLastCalledWith('sequence')

    view.rerender(<SleepListPage />)
    await user.click(screen.getByRole('button', { name: '当前模式：顺序播放。点击切换到随机' }))

    expect(mocks.setPlaybackMode).toHaveBeenLastCalledWith('shuffle')
  })

  it('cycles the theme mode through automatic, light, and dark modes', async () => {
    const user = userEvent.setup()
    mocks.setThemeMode.mockImplementation((mode) => {
      settingsState.themeMode = mode
    })

    const view = render(<SleepListPage />)
    await user.click(screen.getByRole('button', { name: '当前主题：跟随系统。点击切换到白天模式' }))
    expect(mocks.setThemeMode).toHaveBeenCalledWith('light')

    view.rerender(<SleepListPage />)
    await user.click(screen.getByRole('button', { name: '当前主题：白天模式。点击切换到夜间模式' }))
    expect(mocks.setThemeMode).toHaveBeenLastCalledWith('dark')

    view.rerender(<SleepListPage />)
    await user.click(screen.getByRole('button', { name: '当前主题：夜间模式。点击切换到跟随系统' }))
    expect(mocks.setThemeMode).toHaveBeenLastCalledWith('auto')
  })
})
