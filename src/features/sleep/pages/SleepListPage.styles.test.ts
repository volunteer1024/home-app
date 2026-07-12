import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const stylesheet = readFileSync(
  resolve(process.cwd(), 'src/features/sleep/pages/SleepListPage.module.less'),
  'utf8',
)

describe('SleepListPage bottom surface', () => {
  it('keeps mini-player clearance inside the white shell', () => {
    const pageRule = stylesheet.match(/\.page\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    const shellRule = stylesheet.match(/\.shell\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''

    expect(pageRule).not.toContain('padding-bottom')
    expect(shellRule).toContain('padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px));')
  })
})
