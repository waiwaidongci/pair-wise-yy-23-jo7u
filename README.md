# 盲文点字学习训练器

纯前端盲文点字学习与练习工具，支持点阵字符卡片、听写练习、错题本和学习进度统计，数据存 IndexedDB。

## 错题本整组补练功能

老师在**错题本页**（`/mistakes`）按**本周错误原因**整组安排补练，完整规则如下：

1. **先选错误原因和补练日期**：页面顶部列出本周实际出现过的错误原因卡片（本周答错次数、涉及未掌握字数），选定原因与日期后点“安排补练”。
2. **会话只收尚未掌握的点字**：建组时从本周答错记录中取未掌握点字；已掌握（补练答对或手动标记）的字自动排除。
3. **按首次出错时间排序 + 同原因连续不超过两题**：先按该字本周最早答错时间升序，再贪心交错（朴素顺序里 `b/c/k` 三连同原因时，会把后面的“数字号”提前，避免三连同原因）。
4. **重复布置沿用原会话**：同一错误原因已有未结束分组时，再次安排只刷新日期并重建队列，分组 id 与关联的练习会话 id 保持不变。
5. **未到日期的分组卡片可见但打不开**：按钮禁用并显示“可练日期”；打开动作抛 `REMEDIAL_LOCKED`，页面提示等到可练日期。
6. **补练进行中**：答对→本次移出该字并标记掌握；答错→该字排到组尾稍后再练；队列清空自动结组并结算会话分数。
7. **结果同步**：每次作答都写 `AnswerRecord`，掌握状态写 mastery，队列/状态写 `RemedialSession`，成绩写 `PracticeSession`；错题本页与学习进度页共用同一份 IndexedDB 数据。

### 三类职责的文件归属（刻意分离）

| 职责 | 位置 |
|---|---|
| 排序规则（未掌握过滤、首次出错时间排序、同原因限连两题） | `utils/remedialQueue.ts`、`utils/week.ts` |
| 会话保存（队列/状态/会话/记录/掌握的持久化与 store） | `utils/indexedDb.ts`、`api/*`、`stores/*`、`constructors/*` |
| 页面操作（安排、重复布置、打开锁定校验、答对移出/答错置尾的编排） | `hooks/useMistakeBook.ts`、`hooks/useRemedialRunner.ts`、`pages/MistakesPage.tsx` |

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20111>

首次打开会在 IndexedDB（库名 `braille-trainer`）自动灌入本周的练习、错题、掌握与补练分组种子数据；其中补练组 1 安排在今天（进行中），补练组 2 安排在明天（锁定演示）。需要重置时在浏览器清除站点数据，或 `docker compose down` 后清理浏览器存储。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 构建：`cd frontend && npm run build`（含 `tsc -b` 类型检查）

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Material UI + Zustand + IndexedDB |
| 后端 | - |
| 数据库 | IndexedDB（本地模拟数据种子，无第三方 API） |
| 部署 | Docker Compose（Nginx 托管 SPA） |

## 项目目录结构

```text
frontend/src/
├── api/                  # 按模型分文件的 async API（IndexedDB 封装）
├── stores/               # Zustand 独立 store（含 RemedialSessionStore、MasteryStore）
├── types/                # 数据模型类型（含 MistakeReason、RemedialSession）
├── constants/            # 枚举、日志模板、错误码/错误消息、状态文案
├── constructors/         # 默认对象/表单对象/响应对象构造器
├── components/common/    # BrailleCell、RemedialGroupCard、ChartPanel 等共享组件
├── hooks/                # useMistakeBook、useRemedialRunner 等页面操作 hook
├── pages/                # LearnPage / PracticePage / MistakesPage / ProgressPage
├── router/               # 哈希路由表
├── utils/                # remedialQueue（排序）、indexedDb（保存）、week、formatters、logger
└── mocks/                # buildSeedSnapshot 种子数据
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `braille-trainer`
- `FRONTEND_PORT`: 前端端口，默认 `20111`

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: braille-trainer`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-braille-trainer}` 前缀，前端端口映射 `${FRONTEND_PORT:-20111}:80`。
- 纯前端静态站无外部数据卷；用户练习数据在浏览器 IndexedDB 中。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v` 并清除浏览器站点数据。

## 枚举/常量出现位置清单

### PracticeMode（CELL_TO_TEXT / TEXT_TO_CELL / LISTENING / MIXED / **REMEDIAL**）

- 常量与类型：`constants/PracticeMode.ts`、`types/PracticeMode.ts`
- 构造器：`constructors/PracticeSessionConstructor.ts`（补练会话默认 mode=REMEDIAL）
- 日志：`constants/logTemplates.ts`（PracticeSession 模板由 `utils/logger.ts` 调用，见 `stores/PracticeSessionStore.ts`）
- 错误消息：`constants/errorMessages.ts`（补练相关错误码 `REMEDIAL_LOCKED/EMPTY/NOT_FOUND`）
- 筛选器：`pages/PracticePage.tsx`（模式下拉过滤掉 REMEDIAL，补练只从错题本进入）
- 展示：`constants/statusText.ts`、`pages/ProgressPage.tsx`（PracticeModeText 显示“错题补练”）

### MistakeReason（DOT_CONFUSION / DIRECTION_FLIP / PREFIX_FORGOT / RHYTHM_MISS / HOMOPHONE_CONFUSE）

- 常量与类型：`constants/MistakeReason.ts`、`types/MistakeReason.ts`
- 构造器：`constructors/RemedialSessionConstructor.ts`、错题记录在 `constructors/AnswerRecordConstructor.ts` 中默认空原因
- 日志：`constants/logTemplates.ts` 的 RemedialSession 模板（创建/沿用/答对移出/答错置尾/完成），由 `hooks/useMistakeBook.ts`、`hooks/useRemedialRunner.ts` 调用
- 错误：`constants/errorCodes.ts` + `constants/errorMessages.ts` 的 `REMEDIAL_*`
- 筛选器：`hooks/useMistakeBook.ts`（本周原因卡片）、`utils/remedialQueue.ts`（同原因限连判定）、`pages/PracticePage.tsx`（答错原因选择）
- 展示：`constants/statusText.ts`、`components/common/RemedialGroupCard.tsx`、`pages/MistakesPage.tsx`、`pages/ProgressPage.tsx`

### SymbolCategory（LETTER / NUMBER / PUNCTUATION / CONTRACTION）

- 常量与类型：`constants/SymbolCategory.ts`、`types/SymbolCategory.ts`
- 构造器：`constructors/BrailleSymbolConstructor.ts`；种子数据 `mocks/seedData.ts`
- 展示：`constants/statusText.ts`、`pages/LearnPage.tsx`（SymbolCategoryText）

### MasteryLevel（NEW / LEARNING / FAMILIAR / MASTERED）

- 常量与类型：`constants/MasteryLevel.ts`、`types/MasteryLevel.ts`
- 展示：`constants/statusText.ts`、`components/common/StatusBadge.tsx`、`pages/LearnPage.tsx`、`pages/MistakesPage.tsx`（MASTERED 徽标）
- 掌握数据本身落在 IndexedDB 的 mastery 仓库（`api/Mastery.ts`、`stores/MasteryStore.ts`），驱动“只收未掌握点字”

## 为什么会牵一发动全身

- **排序规则、会话保存、页面操作拆成三层**：改排序口径要动 `utils/remedialQueue.ts` 与 `mocks/seedData.ts` 验证数据；改保存结构要同步 `types`、`constructors`、`utils/indexedDb.ts`、`api`、`stores`；改页面行为要动两个 hooks 与错题本页面。
- **新增一个错误原因枚举值**至少触达：`constants/MistakeReason.ts`（文案）、`types/MistakeReason.ts`、`constants/statusText.ts`、`logTemplates.ts`、错题本原因卡片、排序限连逻辑、练习页原因下拉、进度页分布统计。
- **日志模板、错误码、错误消息、构造器各自独立成文件**，被 hooks、stores、api 多层直接引用；改字段必须同步类型、构造器、种子数据与 IndexedDB 仓库。
- `utils/formatters.ts` 混合日期、百分比、状态文案，被错题本卡片、进度页等多处共用。

## License

MIT
