# 盲文点字学习训练器

纯前端盲文点字学习与练习工具，支持点阵字符卡片、听写练习、错题本和学习进度统计，数据存 IndexedDB。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20111>



## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`



## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Material UI + Zustand + IndexedDB |
| 后端 | - |
| 数据库 | 本地模拟数据 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `braille-trainer`
- `FRONTEND_PORT`: 前端端口，默认 `20111`


## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: braille-trainer`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-braille-trainer}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- PracticeMode: constants/PracticeMode、types/PracticeMode、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- SymbolCategory: constants/SymbolCategory、types/SymbolCategory、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- MasteryLevel: constants/MasteryLevel、types/MasteryLevel、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- RemedialSessionStatus: constants/RemedialSessionStatus、types/RemedialSessionStatus、statusText、RemedialSessionCard、MistakesPage、ProgressPage 均有引用。

## 错题本整组补练

错题本支持按本周错误原因整组布置补练，三层职责分开承担：

- **排序规则** `frontend/src/utils/remedialOrdering.ts`：只收尚未掌握（非 MASTERED）的点字，按首次出错时间升序，且同一原因连续不超过两题（`MAX_CONSECUTIVE_SAME_REASON`），无法满足时按时间兜底。
- **会话保存** `frontend/src/stores/RemedialSessionStore.ts` + `frontend/src/api/RemedialSession.ts`：相同原因组合 + 相同补练日期重复布置时沿用原会话；答对后本次移出该字，答错排到组尾；会话持久化到 localStorage。
- **页面操作** `frontend/src/hooks/useRemedialPractice.ts` + `frontend/src/pages/MistakesPage.tsx`：选择原因与日期、打开会话、提交答案，并把结果同步到答题记录与掌握度（错题本、学习进度页随之更新）。

未到补练日期时会话卡片可见但打不开，并显示可练日期（`RemedialSessionCard` + `resolveRemedialStatus`）。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
