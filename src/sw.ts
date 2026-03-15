/// <reference lib="webworker" />
export {}

const sw = globalThis as ServiceWorkerGlobalScope & typeof globalThis & {
  __WB_MANIFEST?: Array<{ url: string }>
}
const manifestEntries =
  (
    (self as unknown as ServiceWorkerGlobalScope & { __WB_MANIFEST?: Array<{ url: string }> }).__WB_MANIFEST || []
  ) as Array<{ url: string }>

const APP_SHELL_CACHE = 'app-shell-v2'

function getAppShellUrl(path: string) {
  return new URL(path, sw.registration.scope).toString()
}

sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(async (cache) => {
      const assets = manifestEntries.map((entry) => entry.url)
      if (assets.length) {
        await cache.addAll(assets)
      }
      await sw.skipWaiting()
    }),
  )
})

sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(sw.clients.claim())
})

sw.addEventListener('fetch', (event: FetchEvent) => {
  const request = event.request
  if (request.method !== 'GET') {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(APP_SHELL_CACHE)
        const cachedResponse = await cache.match(getAppShellUrl('index.html'))
        return cachedResponse ?? Response.redirect(getAppShellUrl(''), 302)
      }),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached
      }

      return fetch(request)
    }),
  )
})

sw.addEventListener('message', (event: ExtendableMessageEvent) => {
  const data = event.data
  if (!data || typeof data !== 'object') {
    return
  }

  if (
    data.type === 'sleep-cache-start' &&
    Array.isArray(data.urls) &&
    typeof data.catalogVersion === 'string'
  ) {
    event.waitUntil(cacheSleepAssets(data.urls, data.catalogVersion))
  }

  if (data.type === 'sleep-cache-clear') {
    event.waitUntil(clearSleepCaches())
  }
})

async function cacheSleepAssets(urls: string[], catalogVersion: string) {
  const cacheName = `sleep-offline-${catalogVersion}`
  const cache = await caches.open(cacheName)
  const uniqueUrls = [...new Set(urls)]
  const failedUrls: string[] = []

  for (let index = 0; index < uniqueUrls.length; index += 1) {
    const url = uniqueUrls[index]
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`缓存失败: ${url}`)
      }
      await cache.put(url, response.clone())
    } catch {
      failedUrls.push(url)
    }

    postProgress(Math.round(((index + 1) / uniqueUrls.length) * 100), failedUrls)
  }

  await cleanupSleepCaches(cacheName)

  const clients = await sw.clients.matchAll({ includeUncontrolled: true })
  clients.forEach((client) => {
    client.postMessage({
      type: 'sleep-cache-ready',
      failedUrls,
    })
  })
}

async function clearSleepCaches() {
  const keys = await caches.keys()
  await Promise.all(keys.filter((key) => key.startsWith('sleep-offline-')).map((key) => caches.delete(key)))
}

async function cleanupSleepCaches(activeName: string) {
  const keys = await caches.keys()
  await Promise.all(
    keys
      .filter((key) => key.startsWith('sleep-offline-') && key !== activeName)
      .map((key) => caches.delete(key)),
  )
}

function postProgress(progress: number, failedUrls: string[]) {
  sw.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'sleep-cache-progress',
        progress,
        failedUrls,
      })
    })
  })
}
