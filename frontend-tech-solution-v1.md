# 前端技术方案 v1

基于 [PRD-v1.md](./PRD-v1.md) 的前端实现方案，目标是在“纯静态部署、低内存、低流量、跨端兼容”的前提下，完成一个适合老人和家长使用的家庭工具站点。本文档采用 `React` 技术栈，重点覆盖“哄睡歌曲”模块与“发票打印入口”模块的前端落地方式。

## 1. 目标与实施原则

- 站点形态：纯前端静态站点，构建产物直接部署到 ECS 上的 Nginx。
- 资源约束：不引入服务端渲染、不接数据库、不依赖后端 API。
- 体验目标：首页轻、播放快、按钮大、文案短、路径短、弱网可用。
- 使用人群：老人和父母优先，默认按照“大字、大按钮、低学习成本、少层级”的交互标准设计。
- 文案规范：所有用户可见文案统一使用中文，不接入国际化框架，不出现英文按钮或英文主标题。
- 视觉原则：页面简洁，首屏只保留核心信息和核心操作，不做花哨装饰，不把关键能力藏进复杂悬浮交互。
- 技术原则：
  - 路由级懒加载，首页不带入哄睡模块逻辑。
  - 音频播放只维护一个全局播放器实例。
  - 静态资源与歌单配置分离，便于后续单独更新歌曲。
  - 离线缓存采用“手动一键离线”，避免首次使用额外流量。
  - `Tailwind` 仅作 `shadcn/ui` 基座，业务样式以 `Less Modules` 为主。
  - 图标只作为辅助信息，关键操作必须“图标 + 中文文字”同时出现。

## 2. 技术栈与依赖

### 2.1 选型结论

- 构建工具：`Vite`
- 开发语言：`TypeScript`
- UI 框架：`React`
- 路由：`TanStack Router`，采用 file-based routing
- 状态管理：`Zustand`
- UI 组件：`shadcn/ui`
- 图标库：`lucide-react`
- 样式方案：`Less Modules` + `CSS Variables`
- 样式基础设施：`Tailwind`，仅用于 `shadcn/ui` 与全局 design tokens
- PWA / Service Worker：`vite-plugin-pwa` + `injectManifest`
- 单元测试：`Vitest`
- 组件测试：`React Testing Library`
- 端到端测试：`Playwright`

### 2.2 依赖边界

- `shadcn/ui` 作为基础组件分发方案，只安装项目真正使用到的组件。
- `lucide-react` 按需导入图标，避免整库打包。
- `Zustand` 负责跨路由状态；业务页面不再使用 props drilling 传递播放器状态。
- `TanStack Router` 文件路由负责路由懒加载和类型安全的链接跳转。
- `vite-plugin-pwa` 负责应用壳缓存、歌单缓存和手动离线下载。

### 2.3 选择理由

- `React` 生态成熟，适合后续持续扩展更多家庭工具页面。
- `TanStack Router` 的文件路由适合当前多页面结构，目录即路由，维护直观。
- `Zustand` 足够轻量，适合播放器、设置、缓存状态这类横跨多个页面的场景。
- `shadcn/ui` 提供开源可改造的组件源码，便于保留“简洁、大字、老人友好”的界面风格。
- `Less Modules` 更适合业务页面做精细化排版和大字号控制，也便于建立统一样式约束。

## 3. 工程目录建议

```text
the-pai/
├─ public/
│  ├─ data/
│  │  └─ sleep-catalog.v1.json
│  ├─ media/
│  │  └─ sleep/
│  │     └─ v1/
│  │        ├─ songs/
│  │        └─ covers/
│  ├─ icons/
│  └─ manifest.webmanifest
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ main.tsx
│  │  ├─ router.tsx
│  │  ├─ providers/
│  │  └─ styles/
│  │     ├─ globals.css
│  │     ├─ tokens.css
│  │     ├─ tailwind.css
│  │     └─ reset.less
│  ├─ routes/
│  │  ├─ __root.tsx
│  │  ├─ index.tsx
│  │  ├─ invoice.tsx
│  │  ├─ sleep/
│  │  │  ├─ route.tsx
│  │  │  ├─ index.tsx
│  │  │  ├─ player.tsx
│  │  │  ├─ list.tsx
│  │  │  └─ settings.tsx
│  │  └─ routeTree.gen.ts
│  ├─ features/
│  │  ├─ home/
│  │  │  ├─ pages/
│  │  │  ├─ components/
│  │  │  └─ styles/
│  │  ├─ invoice/
│  │  │  ├─ pages/
│  │  │  └─ styles/
│  │  └─ sleep/
│  │     ├─ pages/
│  │     ├─ components/
│  │     ├─ stores/
│  │     │  ├─ useCatalogStore.ts
│  │     │  ├─ usePlayerStore.ts
│  │     │  └─ useSettingsStore.ts
│  │     ├─ services/
│  │     │  ├─ audio-engine.ts
│  │     │  ├─ playback-queue.ts
│  │     │  ├─ sleep-timer.ts
│  │     │  ├─ offline-cache.ts
│  │     │  └─ catalog-loader.ts
│  │     ├─ types.ts
│  │     └─ utils.ts
│  ├─ shared/
│  │  ├─ copy/
│  │  │  └─ zh-CN.ts
│  │  ├─ ui/
│  │  │  ├─ button.tsx
│  │  │  ├─ card.tsx
│  │  │  ├─ input.tsx
│  │  │  ├─ slider.tsx
│  │  │  ├─ switch.tsx
│  │  │  ├─ dialog.tsx
│  │  │  ├─ sheet.tsx
│  │  │  ├─ separator.tsx
│  │  │  └─ scroll-area.tsx
│  │  ├─ styles/
│  │  ├─ storage/
│  │  └─ utils/
│  ├─ sw.ts
│  └─ vite-env.d.ts
├─ index.html
├─ vite.config.ts
├─ components.json
└─ package.json
```

### 3.1 目录约定

- `src/routes/` 只承载路由入口和路由级布局，不堆放业务逻辑。
- `src/features/` 按业务模块组织页面、组件、store、service。
- `src/shared/copy/zh-CN.ts` 统一维护全部中文文案。
- `src/shared/ui/` 统一收口 `shadcn/ui` 基础组件和二次包装组件。
- 页面样式与页面组件同目录放置，命名统一为 `PageName.module.less`。
- `routeTree.gen.ts` 为路由自动生成文件，不手动修改。

## 4. 路由方案

### 4.1 路由组织方式

采用 `TanStack Router` 的 file-based routing，并接入官方 Vite 插件生成路由树。`sleep` 模块使用目录路由组织子页面，目录结构和 URL 结构保持一致。

### 4.2 路由文件建议

- `src/routes/__root.tsx`：根布局、全局错误边界、主题初始化、PWA 注册。
- `src/routes/index.tsx`：首页。
- `src/routes/invoice.tsx`：发票打印入口占位页。
- `src/routes/sleep/route.tsx`：哄睡模块共享布局，承载底部导航和全局状态初始化。
- `src/routes/sleep/index.tsx`：进入 `/sleep` 时重定向到 `/sleep/player`。
- `src/routes/sleep/player.tsx`：当前播放页。
- `src/routes/sleep/list.tsx`：歌曲列表页。
- `src/routes/sleep/settings.tsx`：播放设置页。

### 4.3 路由行为约束

- 首页只加载首页 chunk，不主动读取歌单 JSON，不创建音频对象。
- 进入 `sleep` 模块后，才加载歌单、播放器状态和音频引擎。
- `sleep` 子路由切换时不销毁全局音频引擎。
- `invoice` 页面独立懒加载，不引入打印功能依赖。

### 4.4 路由代码示意

```tsx
// src/routes/sleep/player.tsx
import { createFileRoute } from '@tanstack/react-router'
import { SleepPlayerPage } from '@/features/sleep/pages/SleepPlayerPage'

export const Route = createFileRoute('/sleep/player')({
  component: SleepPlayerPage,
})
```

## 5. 状态与数据模型

### 5.1 歌单配置结构

歌单继续使用 `public/data/sleep-catalog.v1.json`，运行时按需 `fetch`，避免把歌单打进首页 bundle。

```ts
export type PlaybackMode = 'single' | 'sequence' | 'shuffle'
export type ThemeMode = 'auto' | 'light' | 'dark'

export interface SongItem {
  id: string
  title: string
  src: string
  cover?: string
  durationSec: number
  tags: string[]
  aliases: string[]
  order: number
}

export interface SleepCatalog {
  catalogVersion: string
  songs: SongItem[]
}

export interface PersistedPlayerState {
  lastSongId: string | null
  lastPositionSec: number
  playbackMode: PlaybackMode
  lastNonSingleMode: Exclude<PlaybackMode, 'single'>
  themeMode: ThemeMode
  offlineCatalogVersion: string | null
}
```

### 5.2 Zustand store 划分

#### `useCatalogStore()`

职责：

- 加载歌单 JSON。
- 按 `order` 生成顺序播放列表。
- 生成搜索用索引。
- 管理搜索关键字和搜索结果。

建议状态：

```ts
{
  catalogVersion: '',
  songs: [] as SongItem[],
  loaded: false,
  searchKeyword: '',
  loadCatalog: async () => {},
  setSearchKeyword: (keyword: string) => {},
}
```

#### `usePlayerStore()`

职责：

- 管理当前歌曲、播放状态、时长、错误状态。
- 控制上一曲、下一曲、暂停、继续、停止。
- 管理播放模式、随机队列、循环快捷切换。
- 与 `AudioEngine` 同步状态。

建议状态：

```ts
{
  currentSongId: null as string | null,
  status: 'idle' as 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error',
  currentTimeSec: 0,
  durationSec: 0,
  playbackMode: 'sequence' as PlaybackMode,
  lastNonSingleMode: 'sequence' as 'sequence' | 'shuffle',
  shuffleQueue: [] as string[],
  shuffleCursor: -1,
  errorMessage: '',
  playSong: async (songId: string, startAtSec?: number) => {},
  pause: () => {},
  resume: async () => {},
  stop: () => {},
  playPrev: async () => {},
  playNext: async () => {},
  toggleQuickLoop: () => {},
}
```

#### `useSettingsStore()`

职责：

- 管理主题模式。
- 管理音量默认值与上限。
- 管理定时停止状态。
- 管理离线缓存状态和进度。

建议状态：

```ts
{
  themeMode: 'auto' as ThemeMode,
  volume: 0.3,
  volumeMax: 0.8,
  sleepTimerMinutes: 0,
  sleepTimerRemainingSec: 0,
  offlineCatalogVersion: null as string | null,
  offlineStatus: 'idle' as 'idle' | 'caching' | 'ready' | 'error',
  offlineProgress: 0,
  offlineFailedUrls: [] as string[],
  setThemeMode: (mode: ThemeMode) => {},
  setVolume: (value: number) => {},
  startOfflineCache: async () => {},
  clearOfflineCache: async () => {},
}
```

### 5.3 持久化策略

- 使用 `zustand/middleware/persist` 持久化轻量状态。
- `useCatalogStore()` 不持久化歌曲列表本身，只持久化必要元信息。
- `usePlayerStore()` 持久化：
  - `lastSongId`
  - `lastPositionSec`
  - `playbackMode`
  - `lastNonSingleMode`
- `useSettingsStore()` 持久化：
  - `themeMode`
  - `offlineCatalogVersion`
- 音量每次冷启动强制回到 `0.3`，不做跨刷新持久化。

### 5.4 React 场景下的职责边界

- `AudioEngine` 保持单例，游离于 React 渲染树之外。
- store 只维护业务状态，不把 `HTMLAudioElement` 放进状态容器。
- 页面组件只通过 `useCatalogStore()`、`usePlayerStore()`、`useSettingsStore()` 读取数据和触发动作。
- 搜索关键字推荐结合 `useDeferredValue` 降低快速输入时的渲染抖动。

## 6. 音频播放内核设计

### 6.1 方案

使用单例 `AudioEngine` 封装一个全局 `HTMLAudioElement`，由 `src/features/sleep/services/audio-engine.ts` 提供。

```ts
class AudioEngine extends EventTarget {
  init(): void
  load(song: SongItem, startAtSec?: number): Promise<void>
  play(): Promise<void>
  pause(): void
  stop(): void
  seek(seconds: number): void
  setVolume(volume: number): void
  destroy(): void
}
```

### 6.2 事件同步

`AudioEngine` 监听以下事件并同步给 `usePlayerStore()`：

- `loadedmetadata`
- `timeupdate`
- `play`
- `pause`
- `ended`
- `error`

### 6.3 播放规则

- 默认不自动播放，只有用户点击“播放”“继续播放”“切歌”后才触发 `audio.play()`。
- 单曲模式：
  - `ended` 后重新从 `0` 秒播放当前歌曲。
- 顺序模式：
  - `ended` 后切到顺序列表下一首。
  - 最后一首结束后停止。
- 随机模式：
  - 进入随机模式时生成一轮洗牌队列。
  - 当前轮次内不重复。
  - 一轮播放完成后重新洗牌。
- 循环快捷开关：
  - 开启时切到 `single`。
  - 关闭时恢复 `lastNonSingleMode`，默认恢复 `sequence`。
- `single` 模式下手动上一曲和下一曲仍按 `lastNonSingleMode` 的队列规则执行。

### 6.4 错误处理

- 若 `audio.play()` 被浏览器拒绝：
  - `status` 设为 `error`
  - 页面展示“点击重新播放”
  - 保留当前歌曲和已恢复的进度
- 若资源加载失败：
  - 显示中文错误提示
  - 不自动切换下一首
  - 保持用户当前选择不丢失

## 7. 样式方案与 UI 约束

### 7.1 总体规则

- 业务样式默认使用 `*.module.less`。
- `Tailwind` 仅作 `shadcn/ui` 基座，业务样式以 `Less Modules` 为主。
- 禁止新增业务页面用大段 `Tailwind utility` 直接堆样式。
- `Tailwind` 只允许出现在：
  - `shadcn/ui` 组件源码
  - 全局 tokens
  - 极少量根布局辅助类

### 7.2 全局样式文件建议

- `src/app/styles/tailwind.css`：导入 `Tailwind` 基础能力和 `shadcn/ui` 所需 tokens。
- `src/app/styles/tokens.css`：颜色、字体、圆角、阴影、尺寸等 CSS 变量。
- `src/app/styles/globals.css`：全局布局、基础元素、滚动条、暗色主题挂载。
- `src/app/styles/reset.less`：浏览器默认样式归一化。

### 7.3 Less Modules 约定

- 页面组件：`HomePage.tsx` 对应 `HomePage.module.less`
- 业务组件：`PlaybackControls.tsx` 对应 `PlaybackControls.module.less`
- 不在一个 Less 文件内混入多个页面的样式。
- 主题颜色和字号全部通过 CSS Variables 读取，不在模块文件中硬编码品牌色和暗色值。

### 7.4 shadcn/ui 使用范围

本项目只安装并维护以下基础组件：

- `Button`
- `Card`
- `Input`
- `Slider`
- `Switch`
- `Dialog`
- `Sheet`
- `Separator`
- `ScrollArea`

使用原则：

- 可以修改组件源码以匹配大字和大按钮规范。
- 业务页面优先使用二次包装组件，不在业务页直接拼复杂原子类。
- 不把 `DropdownMenu`、`Tooltip`、复杂 `Popover` 作为主要操作入口。

### 7.5 lucide-react 图标规则

- 图标统一来自 `lucide-react`。
- 图标按需导入，避免整包引入。
- 所有关键操作必须“图标 + 中文文字”同时展示。
- 老人常用页面不允许出现只显示图标、不显示文字的主按钮。
- 图标默认作为辅助识别，不承担唯一信息表达。

## 8. 中文文案与老人友好设计

### 8.1 中文文案策略

- 所有用户可见文案统一维护在 `src/shared/copy/zh-CN.ts`。
- 不接入国际化框架，首版只支持中文。
- 页面组件通过文案常量引用，不在业务逻辑里散落硬编码字符串。

建议结构：

```ts
export const zhCN = {
  common: {
    backHome: '返回首页',
    confirm: '确认',
    cancel: '取消',
  },
  home: {
    sleepTitle: '哄睡歌曲',
    invoiceTitle: '发票打印',
    invoiceComingSoon: '建设中',
    resumeLastSong: '继续上次播放',
  },
  sleep: {
    play: '播放',
    pause: '暂停',
    resume: '继续播放',
    stop: '停止',
    prev: '上一曲',
    next: '下一曲',
    loop: '单曲循环',
    list: '歌曲列表',
    settings: '播放设置',
    timer: '定时停止',
    cache: '离线下载',
    clearCache: '清除离线内容',
  },
} as const
```

### 8.2 文案风格

- 使用短句和动宾结构。
- 优先使用日常表达，不使用技术术语。
- 示例：
  - “继续播放”
  - “上一曲”
  - “下一曲”
  - “定时停止”
  - “清除离线内容”

### 8.3 大字与大按钮规范

- 手机端正文最小字号：`18px`
- 平板和桌面端正文最小字号：`20px`
- 辅助文字最小字号：`16px`
- 主按钮最小高度：`56px`
- 输入框最小高度：`56px`
- 列表项最小高度：`64px`
- 行高不低于：`1.5`
- 可点击区域最小尺寸：`44px`

### 8.4 页面层级约束

- 单屏不出现超过 `3` 个同权重主操作。
- 关键功能不折叠进二级菜单。
- 不使用隐藏手势。
- 不依赖 hover 提示完成核心操作。
- 播放页首屏必须直接看到“暂停/继续、上一曲、下一曲、停止”。

## 9. 页面与组件设计

### 9.1 首页

页面目标：

- 展示两个大卡片入口：“哄睡歌曲”“发票打印”
- 哄睡卡片显示“继续上次播放”状态
- 发票打印卡片显示“建设中”

组件建议：

- `FeatureEntryCard`
- `LastSessionSummary`

### 9.2 哄睡当前播放页

页面目标：

- 显示封面、歌名、播放进度、播放状态
- 提供暂停、继续、停止、上一曲、下一曲、循环快捷开关
- 提供定时停止入口
- 提供列表页和设置页入口

组件建议：

- `NowPlayingCard`
- `PlaybackControls`
- `ProgressBar`
- `SleepTimerDialog`
- `QuickActionNav`

### 9.3 歌曲列表页

页面目标：

- 展示歌单
- 支持搜索
- 标识当前播放歌曲
- 点击后切歌并跳回播放页

组件建议：

- `SearchBox`
- `SongList`
- `SongListItem`

### 9.4 设置页

页面目标：

- 播放模式切换
- 主题模式切换
- 一键离线缓存
- 清除离线缓存
- 显示兼容性提示

组件建议：

- `PlaybackModeSelector`
- `ThemeModeSelector`
- `OfflineCachePanel`
- `CompatibilityNotice`

## 10. 搜索与列表策略

### 10.1 搜索规则

- 搜索字段：`title + aliases + tags`
- 搜索方式：前端实时包含匹配
- 匹配逻辑：
  - 忽略大小写
  - 去除首尾空格
  - 中文不做分词

### 10.2 性能策略

- 过滤逻辑基于内存数组执行，不请求网络。
- 搜索关键字可配合 `useDeferredValue` 保持输入顺滑。
- 列表封面采用懒加载。

### 10.3 行为约束

- 搜索结果只影响当前列表展示，不改播放队列。
- 从搜索结果点击歌曲后立即开始播放，并跳转到 `/sleep/player`。
- 当前播放歌曲在列表页必须有明显高亮或状态标识。

## 11. 定时停止设计

### 11.1 业务规则

- 提供 `10`、`15`、`30` 分钟三档。
- 同时仅允许一个倒计时。
- 倒计时结束时执行 `3` 秒淡出，再停止并清零进度。

### 11.2 技术实现

- 使用 `setInterval` 每秒更新剩余时间。
- 使用 `setTimeout` 触发停止逻辑。
- 淡出逻辑通过 `requestAnimationFrame` 或短周期定时器逐步降低音量。
- 停止完成后恢复设置音量值为 `0.3`，保证下次进入的统一体验。

## 12. 主题与响应式适配

### 12.1 主题模式

- 使用 `html[data-theme='light|dark']` 挂载主题。
- `auto` 模式优先读取 `prefers-color-scheme`。
- 若浏览器不支持系统主题，则按本地时间 `20:00-06:00` 使用深色。

### 12.2 响应式断点

- `<= 767px`：手机
- `768px - 1199px`：平板
- `>= 1200px`：桌面

### 12.3 布局策略

- 手机端以单列为主，保证大按钮和大字号。
- 平板端采用更宽松的间距，可切换为两栏。
- 桌面端允许左侧播放卡、右侧辅助区域的双栏布局。
- 使用 `clamp()` 管理字号和间距，减少断点分支。

### 12.4 移动端细节

- 使用 `100dvh` 代替 `100vh`。
- 处理安全区：
  - `padding-bottom: env(safe-area-inset-bottom);`
- 音频元素使用 `playsInline`。
- 禁止以 hover 作为唯一反馈方式。

## 13. 离线缓存与 PWA 方案

### 13.1 总体策略

- 首页和基础路由资源：预缓存。
- 歌单 JSON：运行时缓存，优先网络，失败回退缓存。
- 歌曲与封面：仅在用户点击“一键离线”后缓存。

### 13.2 插件与模式

- 使用 `vite-plugin-pwa`
- 采用 `injectManifest`
- 自定义 Service Worker 文件：`src/sw.ts`

选择 `injectManifest` 的原因：ç

- 可以控制“手动一键离线”的缓存进度。
- 可以通过 `postMessage` 和页面通信。
- 可以按 `catalogVersion` 分组缓存。

### 13.3 缓存分层

- `app-shell-v1`
  - `index.html`
  - 公共静态资源
  - 路由 chunk
- `catalog-runtime`
  - `sleep-catalog.v1.json`
- `sleep-offline-${catalogVersion}`
  - 当前版本全部歌曲
  - 当前版本封面

### 13.4 一键离线流程

1. 设置页确认歌单已加载。
2. 获取当前 `catalogVersion` 和全部待缓存资源 URL。
3. 页面通过 `postMessage` 通知 Service Worker 开始缓存。
4. Service Worker 逐个请求资源并写入对应 cache。
5. 每完成一个资源，向页面回传缓存进度。
6. 全部成功后更新 `offlineCatalogVersion`。
7. 若部分失败，保留成功结果并展示失败列表。

### 13.5 清除缓存流程

- 页面向 Service Worker 发送清理消息。
- Service Worker 删除所有 `sleep-offline-*` cache。
- `useSettingsStore()` 清空 `offlineCatalogVersion`、进度和失败记录。

### 13.6 更新策略

- `catalogVersion` 变化时，在设置页提示“歌单已更新，请重新下载离线内容”。
- 新旧缓存不自动混用。
- 用户确认重新缓存后，先写入新版本，再删除旧版本。

### 13.7 容量与失败处理

- 缓存前优先调用 `navigator.storage.estimate()` 做容量预估。
- 空间不足时优先给出中文提示，而不是静默失败。
- Safari 下缓存可能被系统清理，设置页需明确说明“离线内容可能被系统自动清除，可重新下载”。

## 14. 静态资源策略

### 14.1 文件组织

- 歌曲文件：`/media/sleep/v1/songs/*.mp3`
- 封面文件：`/media/sleep/v1/covers/*.webp`
- 歌单配置：`/data/sleep-catalog.v1.json`

### 14.2 资源规范

- 音频格式：优先 `mp3`
- 建议码率：`48kbps - 64kbps mono`
- 封面格式：`webp`
- 封面尺寸建议：`512x512` 或 `768x768`
- 封面体积建议：单张控制在 `40KB` 以内

### 14.3 缓存头建议

- `index.html`：`Cache-Control: no-cache`
- `/assets/*`：`Cache-Control: public, max-age=31536000, immutable`
- `/media/sleep/v1/*`：`Cache-Control: public, max-age=31536000, immutable`
- `/data/*.json`：`Cache-Control: public, max-age=60`

## 15. 性能优化方案

- 首页只加载功能入口，不读取歌单、不创建音频对象。
- `sleep` 子路由按页面自动拆 chunk。
- 音频不设置 `preload="auto"`。
- 图标按需引入，不引入额外图标包。
- 不引入外部字体、统计 SDK、复杂动画库。
- `timeupdate` 写本地存储需节流，建议每 `5` 秒持久化一次。
- 搜索结果和长列表渲染优先保证输入流畅度。
- 非关键 UI 更新可配合 `startTransition` 保持页面响应。

## 16. iOS / Android 兼容策略

### 16.1 自动播放限制

- 所有播放行为必须来自用户点击。
- 恢复上次播放时只恢复状态，不自动触发 `play()`。

### 16.2 音量限制

- 非 iOS 浏览器直接使用 `audio.volume` 控制音量，默认 `30%`，最大 `80%`。
- iOS Safari 可能不完全遵守程序化音量设置。
- 设置页明确提示：`80%` 上限在 iOS 上属于软约束。

### 16.3 媒体异常

- `audio.play()` Promise reject 时：
  - 页面显示“点击重新播放”
  - 保留当前歌曲和已恢复进度
- 资源加载失败时：
  - 展示中文错误提示
  - 不自动跳走到其他歌曲

## 17. 测试方案

### 17.1 单元测试

- `playback-queue.ts`
  - 顺序模式上下首逻辑
  - 随机模式一轮内不重复
  - 单曲快捷开关恢复逻辑
- `sleep-timer.ts`
  - 倒计时触发
  - 淡出后停止
- `catalog-loader.ts`
  - JSON 结构合法性
  - 搜索索引生成

### 17.2 组件测试

使用 `React Testing Library + Vitest` 覆盖：

- 首页卡片跳转
- 列表搜索和切歌
- 播放页控制按钮状态
- 设置页播放模式与主题切换
- `player/list/settings` 切换时播放不中断

### 17.3 端到端测试

使用 `Playwright` 覆盖：

- 从首页进入哄睡模块并开始播放
- 暂停、继续、停止、切歌
- 切换随机模式后连续播放不重复
- 刷新页面后恢复上次歌曲但不自动播放
- 一键离线后断网播放已缓存歌曲

### 17.4 文案与可读性验收

- 所有主按钮、标题、状态文案均为中文。
- 关键操作均为“图标 + 中文文字”。
- 手机端正文不少于 `18px`。
- 主按钮高度不少于 `56px`。
- 老人常用页面首屏无复杂浮层交互依赖。

### 17.5 手工验证重点

- iPhone Safari
- Android Chrome
- iPad Safari
- 桌面 Chrome
- 桌面 Safari

## 18. 实施顺序

1. 初始化 `Vite + React + TypeScript` 工程。
2. 接入 `TanStack Router` 文件路由和 Vite 路由插件。
3. 初始化 `shadcn/ui`、`Tailwind` 基座、`Less Modules` 和全局样式文件。
4. 建立 `src/shared/copy/zh-CN.ts`、全局主题变量和老人友好字号规范。
5. 完成首页、发票占位页和哄睡模块路由壳。
6. 实现歌单 JSON 加载、类型定义和搜索索引。
7. 实现 `AudioEngine`、播放模式、随机队列和状态同步。
8. 接入 `Zustand` 持久化、上次歌曲恢复、主题切换和音量锁定。
9. 实现播放页、列表页、设置页基础交互。
10. 接入定时停止、离线缓存、跨端适配和测试。

## 19. 部署方案

- 构建命令：`vite build`
- 输出目录：`dist/`
- 部署方式：上传 `dist/` 到 ECS 的 Nginx 静态目录
- Nginx 建议开启：
  - 文本资源压缩
  - SPA 路由回退到 `/index.html`
  - 长缓存静态资源头
- 音频资源不做二次压缩。
- HTTPS 证书直接挂到 Nginx，不需要 Node 常驻进程。

## 20. 风险与应对

- iOS 音量控制不稳定：按产品约束视为软限制，并在设置页明确说明。
- Safari 离线缓存容量有限：采用手动缓存、缓存进度和失败回显，避免静默失败。
- 图标被误用为唯一表达：通过“图标 + 中文文字”规则统一规避。
- 页面样式回退到大量 utility class：通过“业务样式统一使用 Less Modules”的工程约定控制。
- 路由切换打断播放：通过模块外单例音频引擎和全局 store 保证连续播放。

## 21. 最终交付物

- 一个基于 `Vite + React` 的多路由前端工程。
- 一份静态歌单配置文件和静态媒体资源目录规范。
- 一套适合老人使用的大字、简洁、中文化 UI 方案。
- 一套可工作的播放器、列表、设置、离线缓存能力。
- 一套可直接部署到阿里云低配 ECS 的静态构建产物。

## 22. 参考依据

- [shadcn/ui Introduction](https://ui.shadcn.com/docs)
- [shadcn/ui Vite 安装文档](https://ui.shadcn.com/docs/installation/vite)
- [TanStack Router Quick Start](https://tanstack.com/router/latest/docs/quick-start)
- [TanStack Router File-Based Routing](https://tanstack.com/router/latest/docs/routing/file-based-routing)
- [Zustand Introduction](https://zustand.docs.pmnd.rs/getting-started/introduction)
- [Zustand Persisting Store Data](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)
- [lucide-react 使用说明](https://lucide.dev/guide/packages/lucide-react)
