import { isRedirect } from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'

import { Route as HomeRoute } from './index'
import { Route as InvoiceRoute } from './invoice'
import { Route as SleepIndexRoute } from './sleep/index'
import { Route as SleepPlayerRoute } from './sleep/player'
import { Route as SleepSettingsRoute } from './sleep/settings'

const legacyRoutes = [HomeRoute, SleepIndexRoute, SleepPlayerRoute, SleepSettingsRoute, InvoiceRoute]

describe('legacy routes', () => {
  it.each(legacyRoutes)('redirects %s to the music list', (route) => {
    expect(route.options.beforeLoad).toEqual(expect.any(Function))

    try {
      route.options.beforeLoad?.({} as never)
    } catch (error) {
      if (!isRedirect(error)) {
        throw error
      }

      expect(error.options.to).toBe('/sleep/list')
      return
    }

    throw new Error('Expected the legacy route to redirect')
  })
})
