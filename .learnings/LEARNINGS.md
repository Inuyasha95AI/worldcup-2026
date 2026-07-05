# 经验教训

记录在开发过程中学到的知识和经验。

---

## 2026-07-05 任务：世界杯网站自动更新系统

**经验**：football-data.org 免费版 API 不提供比赛事件数据（进球时间线、黄牌、换人），只提供基础比分和射手榜。如果需要详细事件，必须用付费 API 或其他数据源。

**场景**：需要实时比赛事件数据时

**置信度**：高

**验证次数**：1

---

## 2026-07-06 任务：跨时区时间计算

**经验**：在 JavaScript 中将 UTC 时间转为其他时区（如北京时间 UTC+8）时，必须使用 `getUTCHours()`、`getUTCDate()` 等 UTC 方法提取时间组件，不能用 `getHours()`、`getDate()` 等本地时间方法。因为 `new Date(utcTimestamp + offset)` 创建的 Date 对象，其 `getHours()` 会在本地时区基础上再次偏移，导致双重叠加。

**正确模式**：
```javascript
function toBeijing(utcDate) {
  const d = new Date(utcDate);
  const b = new Date(d.getTime() + 8*60*60*1000);
  return { year: b.getUTCFullYear(), month: b.getUTCMonth()+1, day: b.getUTCDate(),
           hours: b.getUTCHours(), minutes: b.getUTCMinutes() };
}
```

**场景**：需要在不同运行环境中正确处理时区转换时

**置信度**：高

**验证次数**：2

---

## 2026-07-05 任务：GitHub Actions 定时任务配置

**经验**：GitHub Actions cron 用 UTC 时区，北京时间需要 -8 小时。07:00 BJT = 23:00 UTC，12:00 BJT = 04:00 UTC。

**场景**：配置中国时区的定时任务时

**置信度**：高

**验证次数**：1

---

## 2026-07-05 任务：GitHub Actions 自动 push 权限

**经验**：GitHub Actions 默认没有 push 权限。需要在 workflow 文件中添加 `permissions: contents: write` 和 checkout 时设置 `fetch-depth: 0` 才能自动 push。

**场景**：GitHub Actions 需要自动提交代码时

**置信度**：高

**验证次数**：2

---

## 2026-07-05 任务：足球数据 API 数据获取

**经验**：football-data.org 的 `/competitions/WC/scorers` 端点默认只返回少量数据，需要设置 `limit` 参数获取更多。免费版最多可获取 50 名射手数据。

**场景**：需要获取完整射手榜数据时

**置信度**：高

**验证次数**：1

---

## 2026-07-05 任务：球队总进球数统计

**经验**：积分榜只包含小组赛数据。要统计球队总进球数（含淘汰赛），需要从所有已结束的比赛中按队伍累加。点球大战的进球不算在 `score.fullTime` 里，但需要显式过滤 `score.winner === 'PENS'` 的比赛以确保准确。

**场景**：需要统计跨阶段的球队数据时

**置信度**：高

**验证次数**：1

---

## 2026-07-05 任务：前端数据排序逻辑

**经验**：「近期淘汰赛」应优先显示今天 → 进行中 → 未开始 → 已结束，而不是简单按日期排序。同时需要过滤掉未确定对阵（team 为 null）和未结束（status !== 'FINISHED'）的比赛。

**场景**：展示赛事进度时

**置信度**：高

**验证次数**：1

---

## 2026-07-05 任务：Git push 代理配置

**经验**：Windows PowerShell 中设置代理需要用 `http` 协议（`http://127.0.0.1:7897`），`socks5` 会导致 SSL 握手失败。需要同时设置 `HTTP_PROXY` 和 `HTTPS_PROXY`。

**场景**：需要通过代理 push 到 GitHub 时

**置信度**：高

**验证次数**：3

---

## 2026-07-05 任务：GitHub Actions 数据文件类型

**经验**：GitHub Actions 自动生成的 `data.json` 与本地合并时容易冲突。使用 `git pull --no-edit --strategy=ours` 可以快速解决，保留本地版本。

**场景**：本地修改与 Actions 自动提交冲突时

**置信度**：高

**验证次数**：2

---

## 2026-07-06 任务：GitHub Pages 部署失败

**经验**：GitHub Pages 默认使用 Jekyll 处理静态站点。如果仓库没有 `_config.yml` 或 `Gemfile`，纯 HTML 项目需要添加空的 `.nojekyll` 文件跳过 Jekyll 构建，否则部署会失败。

**场景**：静态 HTML 站点部署到 GitHub Pages 时

**置信度**：高

**验证次数**：1

---

## 2026-07-06 任务：GitHub Pages 缓存

**经验**：推送代码后 GitHub Pages 不会立即更新，有 CDN 缓存延迟（通常几分钟）。可以通过 URL 添加 `?t=时间戳` 参数强制刷新，或等待自动过期。

**场景**：GitHub Pages 更新后页面未生效时

**置信度**：高

**验证次数**：1

---
