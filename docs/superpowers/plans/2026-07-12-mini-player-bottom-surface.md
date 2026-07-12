# Mini Player Bottom Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the fixed mini player's reserved bottom area inside the white music-list shell, eliminating the grey band beneath the shell on mobile screens.

**Architecture:** The mini player remains viewport-fixed. Move its existing `104px + safe-area` layout reservation from the outer `.page` into the inner `.shell`, whose white surface owns the music-list content. This preserves the list's scroll clearance without changing playback or gesture behavior.

**Tech Stack:** React 19, TypeScript, Less CSS Modules, Vitest.

## Global Constraints

- Keep the mini player fixed and preserve `env(safe-area-inset-bottom, 0px)` support.
- Preserve the existing 104px reservation so the last song remains fully accessible.
- Do not change playback, swipe-navigation, or theme behavior.

---

### Task 1: Place the bottom reservation in the music shell

**Files:**
- Create: `src/features/sleep/pages/SleepListPage.styles.test.ts`
- Modify: `src/features/sleep/pages/SleepListPage.module.less:1-18`

**Interfaces:**
- Consumes: `.page` and `.shell` layout rules in `SleepListPage.module.less`.
- Produces: A full-height white shell containing the mini-player clearance and a source-level regression test for that layout contract.

- [ ] **Step 1: Write the failing layout-contract test**

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const stylesheet = readFileSync(new URL('./SleepListPage.module.less', import.meta.url), 'utf8')

describe('SleepListPage bottom surface', () => {
  it('keeps mini-player clearance inside the white shell', () => {
    const pageRule = stylesheet.match(/\\.page\\s*\\{([\\s\\S]*?)\\n\\}/)?.[1] ?? ''
    const shellRule = stylesheet.match(/\\.shell\\s*\\{([\\s\\S]*?)\\n\\}/)?.[1] ?? ''

    expect(pageRule).not.toContain('padding-bottom')
    expect(shellRule).toContain('padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px));')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails before the style change**

Run: `pnpm vitest run src/features/sleep/pages/SleepListPage.styles.test.ts`

Expected: FAIL because `.page` currently owns `padding-bottom` and `.shell` does not.

- [ ] **Step 3: Move the reservation into `.shell`**

```less
.page {
  min-height: 100dvh;
  background: #f6f8f8;
}

.shell {
  width: min(100%, 28rem);
  min-height: 100dvh;
  margin: 0 auto;
  padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px));
  background: #ffffff;
}
```

- [ ] **Step 4: Run the layout test and existing page tests**

Run: `pnpm vitest run src/features/sleep/pages/SleepListPage.styles.test.ts src/features/sleep/pages/SleepListPage.test.tsx`

Expected: PASS with the style contract and playback/gesture tests green.

- [ ] **Step 5: Build the application and visually inspect a mobile viewport**

Run: `pnpm build`

Expected: exit code 0. In a narrow viewport with a selected song, the region behind and below the mini player is white; the final song can still scroll completely above the player.

- [ ] **Step 6: Commit only the implementation files when the working tree permits it**

Run `git add src/features/sleep/pages/SleepListPage.module.less src/features/sleep/pages/SleepListPage.styles.test.ts` followed by `git commit -m "fix: keep mini player clearance in shell"`.

Do not stage or commit the unrelated existing modifications shown by `git status`.
