## Why

底部迷你播放器当前只能播放或暂停，用户切换歌曲仍需回到列表点击目标歌曲。为使连续聆听时的切歌更直接，需要在不增加额外按钮的前提下提供明确、低误触的手势导航。

## What Changes

- 在固定底部迷你播放器的非按钮区域支持水平滑动：向左切换上一曲，向右切换下一曲。
- 播放条在拖动时跟随手指轻微位移，达到阈值后切歌并回弹；纵向滚动、短距离移动和播放/暂停按钮点击不触发切歌。
- 手势切歌后立即播放目标歌曲。
- 顺序播放在歌单首尾循环；随机和单曲循环沿用其既有基础队列语义，并支持前后切换。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `music-list-only-experience`: 固定底部迷你播放器新增基于水平滑动的上一曲与下一曲导航，以及相应的循环和误触保护行为。

## Impact

- `src/features/sleep/pages/SleepListPage.tsx` 与其样式：接收并呈现播放条手势及回弹反馈。
- `src/features/sleep/services/playback-queue.ts` 与 `usePlayerStore.ts`：顺序和随机队列的前后循环导航。
- 现有页面与队列测试：覆盖手势、首尾循环、暂停状态切歌和按钮隔离。
