const CACHE_MESSAGE = {
  START: 'sleep-cache-start',
  CLEAR: 'sleep-cache-clear',
} as const

export type OfflineProgressPayload = {
  progress: number
  failedUrls: string[]
}

function ensureController() {
  const controller = navigator.serviceWorker?.controller

  if (!controller) {
    throw new Error('当前浏览器暂不支持离线缓存')
  }

  return controller
}

export function startOfflineCache(urls: string[], catalogVersion: string) {
  const controller = ensureController()
  controller.postMessage({
    type: CACHE_MESSAGE.START,
    urls,
    catalogVersion,
  })
}

export function clearOfflineCache() {
  const controller = ensureController()
  controller.postMessage({
    type: CACHE_MESSAGE.CLEAR,
  })
}
