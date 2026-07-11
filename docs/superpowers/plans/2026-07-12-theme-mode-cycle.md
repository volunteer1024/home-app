# Theme Mode Cycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ambiguous top-right theme icon with an accessible three-state automatic/light/dark theme selector.

**Architecture:** Keep the existing persisted `ThemeMode` values and `setThemeMode` API. Define the cycle metadata in `SleepListPage.tsx`, derive the icon and next mode from the stored state, and verify all three transitions through the component's existing mocked settings store.

**Tech Stack:** React 19, TypeScript, lucide-react, Vitest, Testing Library.

## Global Constraints

- Keep `auto` as the default theme mode in `useSettingsStore`.
- Do not change persisted state shape, document theme application, button dimensions, or button styling.
- Cycle in the fixed order: `auto` → `light` → `dark` → `auto`.
- Use lucide-react `Monitor`, `Sun`, and `Moon` icons for `auto`, `light`, and `dark`, respectively.
- Update accessible labels to name the next selected mode.

---

### Task 1: Specify the three-state interaction with a failing component test

**Files:**
- Modify: `src/features/sleep/pages/SleepListPage.test.tsx:13-77, 230-251`

**Interfaces:**
- Consumes: `useSettingsStore(selector)` and `setThemeMode(mode)` from the existing mocked store.
- Produces: a regression test proving the button invokes `setThemeMode` with `light`, `dark`, and `auto` for the respective current modes.

- [x] **Step 1: Make the mocked settings mode mutable and add a failing cycle test**

```tsx
const settingsState = {
  themeMode: 'auto',
  setThemeMode: mocks.setThemeMode,
}

vi.mock('@/features/sleep/stores/useSettingsStore', () => ({
  useSettingsStore: <T,>(selector: (state: typeof settingsState) => T) => selector(settingsState),
}))

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
```

- [x] **Step 2: Run the focused test to verify it fails for the missing automatic-mode control**

Run: `pnpm test:run src/features/sleep/pages/SleepListPage.test.tsx`

Expected: FAIL because the page still renders the old two-state label and only switches between `light` and `dark`.

### Task 2: Implement the icon metadata and mode cycle

**Files:**
- Modify: `src/features/sleep/pages/SleepListPage.tsx:1-19, 25-30, 53-55, 145-153`
- Test: `src/features/sleep/pages/SleepListPage.test.tsx`

**Interfaces:**
- Consumes: `ThemeMode`, `themeMode`, and `setThemeMode` from `useSettingsStore`.
- Produces: `THEME_MODE_META`, a typed mapping from every theme mode to its current label, next mode, next label, and Lucide icon.

- [x] **Step 1: Add the mode metadata and render it from the settings state**

```tsx
const THEME_MODE_META: Record<
  ThemeMode,
  { label: string; nextMode: ThemeMode; nextLabel: string; Icon: typeof Monitor }
> = {
  auto: { label: '跟随系统', nextMode: 'light', nextLabel: '白天模式', Icon: Monitor },
  light: { label: '白天模式', nextMode: 'dark', nextLabel: '夜间模式', Icon: Sun },
  dark: { label: '夜间模式', nextMode: 'auto', nextLabel: '跟随系统', Icon: Moon },
}

const themeMeta = THEME_MODE_META[themeMode]
const ThemeIcon = themeMeta.Icon

<button
  type="button"
  className={styles.iconButton}
  aria-label={`当前主题：${themeMeta.label}。点击切换到${themeMeta.nextLabel}`}
  onClick={() => setThemeMode(themeMeta.nextMode)}
>
  <ThemeIcon size={28} />
</button>
```

Also replace the unused `Ellipsis` import with `Monitor`, `Moon`, and `Sun`, and import `ThemeMode` alongside `PlaybackMode`.

- [x] **Step 2: Run the focused test to verify the three-state cycle passes**

Run: `pnpm test:run src/features/sleep/pages/SleepListPage.test.tsx`

Expected: PASS with the automatic, light, and dark transition assertions green.

- [x] **Step 3: Run static and production verification**

Run: `pnpm typecheck && pnpm build`

Expected: both commands exit with status 0.

- [x] **Step 4: Commit the implementation**

```bash
git add src/features/sleep/pages/SleepListPage.tsx src/features/sleep/pages/SleepListPage.test.tsx docs/superpowers/plans/2026-07-12-theme-mode-cycle.md
git commit -m "feat: cycle theme modes from header"
```
