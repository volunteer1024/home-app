import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  pause: vi.fn(),
  playSong: vi.fn(),
  resumeCurrent: vi.fn(),
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
  searchIndex: { [song.id]: 'moon river 摇篮曲' },
  setSearchKeyword: mocks.setSearchKeyword,
}

const playerState = {
  currentSongId: song.id,
  status: 'playing',
  errorMessage: '',
  playSong: mocks.playSong,
  pause: mocks.pause,
  resumeCurrent: mocks.resumeCurrent,
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
    playerState.status = 'playing'
    playerState.errorMessage = ''
    mocks.navigate.mockReset()
    mocks.pause.mockReset()
    mocks.playSong.mockReset()
    mocks.resumeCurrent.mockReset()
  })

  afterEach(cleanup)

  it('pauses the current song from the list without navigating away', async () => {
    const user = userEvent.setup()

    render(<SleepListPage />)
    await user.click(screen.getByRole('button', { name: /Moon River/ }))

    expect(mocks.pause).toHaveBeenCalledOnce()
    expect(mocks.playSong).not.toHaveBeenCalled()
    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  it('resumes the current paused song from the list', async () => {
    playerState.status = 'paused'
    const user = userEvent.setup()

    render(<SleepListPage />)
    await user.click(screen.getByRole('button', { name: /Moon River/ }))

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
})
