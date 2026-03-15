import { create } from 'zustand'

import { loadSleepCatalog } from '@/features/sleep/services/catalog-loader'
import type { SongItem } from '@/features/sleep/types'
import { buildSongSearchIndex, normalizeSearchText } from '@/features/sleep/utils'

type CatalogState = {
  catalogVersion: string
  songs: SongItem[]
  loaded: boolean
  loading: boolean
  errorMessage: string
  searchKeyword: string
  searchIndex: Record<string, string>
  loadCatalog: () => Promise<void>
  setSearchKeyword: (keyword: string) => void
}

export const useCatalogStore = create<CatalogState>((set) => ({
  catalogVersion: '',
  songs: [],
  loaded: false,
  loading: false,
  errorMessage: '',
  searchKeyword: '',
  searchIndex: {},
  async loadCatalog() {
    set({ loading: true, errorMessage: '' })

    try {
      const catalog = await loadSleepCatalog()
      const searchIndex = Object.fromEntries(
        catalog.songs.map((song) => [song.id, buildSongSearchIndex(song)]),
      )

      set({
        catalogVersion: catalog.catalogVersion,
        songs: catalog.songs,
        searchIndex,
        loaded: true,
        loading: false,
      })
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : '歌单读取失败',
        loading: false,
      })
    }
  },
  setSearchKeyword(keyword) {
    set({ searchKeyword: normalizeSearchText(keyword) })
  },
}))
