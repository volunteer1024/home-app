import { startTransition, useDeferredValue, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'

import { SongListItem } from '@/features/sleep/components/SongListItem'
import { useCatalogStore } from '@/features/sleep/stores/useCatalogStore'
import { usePlayerStore } from '@/features/sleep/stores/usePlayerStore'
import { zhCN } from '@/shared/copy/zh-CN'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

import styles from './SleepListPage.module.less'

export function SleepListPage() {
  const navigate = useNavigate()
  const songs = useCatalogStore((state) => state.songs)
  const searchKeyword = useCatalogStore((state) => state.searchKeyword)
  const searchIndex = useCatalogStore((state) => state.searchIndex)
  const setSearchKeyword = useCatalogStore((state) => state.setSearchKeyword)
  const currentSongId = usePlayerStore((state) => state.currentSongId)
  const playSong = usePlayerStore((state) => state.playSong)

  const deferredKeyword = useDeferredValue(searchKeyword)

  const filteredSongs = useMemo(() => {
    if (!deferredKeyword) {
      return songs
    }

    return songs.filter((song) => searchIndex[song.id]?.includes(deferredKeyword))
  }, [deferredKeyword, searchIndex, songs])

  return (
    <section className={styles.page}>
      <Card>
        <CardHeader>
          <CardTitle>{zhCN.sleep.songList}</CardTitle>
        </CardHeader>
        <CardContent className={styles.content}>
          <label className={styles.searchWrap}>
            <span className={styles.searchIcon}>
              <Search size={20} />
            </span>
            <Input
              value={searchKeyword}
              placeholder={zhCN.sleep.searchPlaceholder}
              onChange={(event) => {
                startTransition(() => {
                  setSearchKeyword(event.target.value)
                })
              }}
            />
          </label>

          <div className={styles.list}>
            {filteredSongs.length ? (
              filteredSongs.map((song) => (
                <SongListItem
                  key={song.id}
                  song={song}
                  active={song.id === currentSongId}
                  onClick={async () => {
                    await playSong(song.id, 0)
                    await navigate({ to: '/sleep/player' })
                  }}
                />
              ))
            ) : (
              <div className={styles.empty}>{zhCN.sleep.noSong}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
