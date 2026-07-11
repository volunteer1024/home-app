# Mini Player Swipe Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let listeners swipe the fixed mini player left for the previous track and right for the next track, with drag feedback and cyclic queue navigation.

**Architecture:** Keep all playlist and playback-mode decisions in `playback-queue.ts` and `usePlayerStore.ts`. `SleepListPage` owns transient pointer coordinates and translates only a confirmed, non-button swipe into the existing store navigation methods.

**Tech Stack:** React 19, TypeScript, Zustand, Vitest, Testing Library, Less modules.

## Global Constraints

- Left swipe selects the previous song; right swipe selects the next song.
- A confirmed swipe immediately plays the destination song, including from paused state.
- Sequential navigation wraps from first to last and last to first.
- Pointer movement that is vertical, below threshold, or begins from the play/pause button MUST not switch songs.
- No new dependency, visible navigation button, route, or persisted player field.

---

### Task 1: Queue boundary behavior

**Files:**
- Modify: `src/features/sleep/services/playback-queue.ts`
- Create: `src/features/sleep/services/playback-queue.test.ts`

**Interfaces:**
- Consumes: `SongItem[]`, queue IDs, queue cursor, and current song ID.
- Produces: cyclic target IDs from `getSequenceNextId`, `getSequencePrevId`, `getShuffleNextId`, and `getShufflePrevId`.

- [ ] **Step 1: Write failing boundary tests**

```ts
expect(getSequenceNextId(songs, 'last')).toBe('first')
expect(getSequencePrevId(songs, 'first')).toBe('last')
```

- [ ] **Step 2: Run the queue test to verify it fails**

Run: `pnpm vitest run src/features/sleep/services/playback-queue.test.ts`

Expected: FAIL because the existing sequential helper stops at the list edge.

- [ ] **Step 3: Implement minimal cyclic queue resolution**

```ts
const currentIndex = songs.findIndex((song) => song.id === currentSongId)
return songs[(currentIndex + 1) % songs.length]?.id ?? null
```

Apply the inverse modulo operation for previous navigation and ensure a rebuilt random queue selects an item after the current song when more than one song exists.

- [ ] **Step 4: Run the queue test to verify it passes**

Run: `pnpm vitest run src/features/sleep/services/playback-queue.test.ts`

Expected: PASS.

### Task 2: Mini-player pointer gesture

**Files:**
- Modify: `src/features/sleep/pages/SleepListPage.tsx`
- Modify: `src/features/sleep/pages/SleepListPage.module.less`
- Modify: `src/features/sleep/pages/SleepListPage.test.tsx`

**Interfaces:**
- Consumes: `playPrev(): Promise<void>` and `playNext(): Promise<void>` from `usePlayerStore`.
- Produces: a bounded `--mini-player-drag-x` visual offset and one navigation call per confirmed pointer gesture.

- [ ] **Step 1: Write failing page interaction tests**

```tsx
fireEvent.pointerDown(miniPlayer, { pointerId: 1, clientX: 160, clientY: 20 })
fireEvent.pointerUp(miniPlayer, { pointerId: 1, clientX: 90, clientY: 20 })
expect(mocks.playPrev).toHaveBeenCalledOnce()
```

Add separate tests for a right swipe, short movement, vertical movement, and pointer events starting at the play button.

- [ ] **Step 2: Run the page test to verify it fails**

Run: `pnpm vitest run src/features/sleep/pages/SleepListPage.test.tsx`

Expected: FAIL because the mini player has no pointer gesture handlers or navigation store selections.

- [ ] **Step 3: Implement minimal pointer state and event handlers**

```tsx
const deltaX = event.clientX - gestureStart.x
if (Math.abs(deltaX) >= 56 && Math.abs(deltaX) > Math.abs(deltaY)) {
  void (deltaX < 0 ? playPrev() : playNext())
}
```

Record a gesture only outside `button` descendants, clamp the live visual offset, and always clear it on pointer up/cancel.

- [ ] **Step 4: Add the visual drag feedback**

```less
.miniPlayerDragging {
  transition: none;
  transform: translateX(var(--mini-player-drag-x));
}
```

Keep the existing fixed positioning and re-enable the normal transition after the interaction ends.

- [ ] **Step 5: Run the page test to verify it passes**

Run: `pnpm vitest run src/features/sleep/pages/SleepListPage.test.tsx`

Expected: PASS.

### Task 3: Integrated verification

**Files:**
- Modify: `openspec/changes/add-mini-player-swipe-navigation/tasks.md`

- [ ] **Step 1: Run focused regression tests**

Run: `pnpm vitest run src/features/sleep/services/playback-queue.test.ts src/features/sleep/pages/SleepListPage.test.tsx`

Expected: PASS with no test failures.

- [ ] **Step 2: Run static and production checks**

Run: `pnpm typecheck && pnpm build`

Expected: both commands exit with status 0.
