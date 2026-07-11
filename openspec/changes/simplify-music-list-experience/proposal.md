## Why

当前应用同时呈现首页、发票入口、播放页和设置页，但除助眠音乐外的功能尚未确定或完成，造成界面与导航分散。将体验收敛为单一音乐列表页面，可以让用户直接找到歌曲，并在同一页面完成播放与暂停。

## What Changes

- **BREAKING** 移除首页、发票页、独立播放器页和设置页的用户入口与路由；应用启动后直接进入音乐列表。
- **BREAKING** 移除列表页中指向首页、收藏、我的等未实现功能的导航与占位入口。
- 将播放、暂停、切换歌曲、当前播放状态和必要的错误提示收敛到音乐列表页；选择歌曲后不再跳转至独立播放页。
- 保留现有本地歌曲目录、播放引擎及播放状态，以维持歌曲可播放、暂停后可继续、切歌和刷新后的最近播放信息。
- 更新 PRD、技术设计和验收说明，使其只描述当前可交付的音乐列表体验；暂不承诺设置、离线缓存、播放模式、定时停止或其他未确定页面能力。

## Capabilities

### New Capabilities

- `music-list-only-experience`: 提供唯一的音乐列表入口，并在列表内完成歌曲播放、暂停与切换。
- `product-scope-documentation`: 维护与单页面音乐体验一致的产品需求、技术设计与验收范围。

### Modified Capabilities

无。当前仓库尚无已发布的 OpenSpec 能力规格。

## Impact

- 受影响代码：`src/routes/**`、`src/routeTree.gen.ts`、`src/features/home/**`、`src/features/invoice/**`、`src/features/sleep/pages/**`、`src/features/sleep/components/**` 及共享文案与样式。
- 保留并复用：歌曲目录、播放器状态、音频引擎及其本地持久化逻辑。
- 文档更新：根目录 `PRD-v1.md`，以及本变更中的需求规格、技术设计和实施任务。
