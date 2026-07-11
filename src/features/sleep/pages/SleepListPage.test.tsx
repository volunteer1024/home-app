import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  pause: vi.fn(),
  playSong: vi.fn(),
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
  pause: mocks.pause,
  resumeCurrent: mocks.resumeCurrent,
  setPlaybackMode: mocks.setPlaybackMode,
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
  useSettingsStore: <T,>(
    selector: (state: { themeMode: string; setThemeMode: typeof mocks.setThemeMode }) => T,
  ) => selector({ themeMode: 'light', setThemeMode: mocks.setThemeMode }),
}))

import { SleepListPage } from './SleepListPage'

describe('SleepListPage', () => {
  beforeEach(() => {
    playerState.currentSongId = song.id
    playerState.status = 'playing'
    playerState.playbackMode = 'shuffle'
    playerState.errorMessage = ''
    catalogState.searchKeyword = ''
    mocks.navigate.mockReset()
    mocks.pause.mockReset()
    mocks.playSong.mockReset()
    mocks.resumeCurrent.mockReset()
    mocks.setPlaybackMode.mockReset()
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
})
