# 错误记录

记录遇到的错误和解决方案。

---

## 2026-07-05 错误：football-data.org 免费 API 不返回比赛事件

**原因**：免费版 API 的 `/matches` 和 `/matches/{id}` 端点不包含 `goals`、`bookings`、`substitutions` 字段。这些是付费功能。

**解决方案**：改用「简化版事件」方案——从半场/全场比分差推断进球，从射手榜匹配进球球员。

**预防措施**：使用新 API 前先测试单个请求确认数据完整性。

**置信度**：高

---

## 2026-07-05 错误：GitHub Actions push 失败 - 权限不足

**原因**：GitHub Actions 默认 GITHUB_TOKEN 没有 push 权限。

**解决方案**：在 workflow 文件中添加 `permissions: contents: write`。

**预防措施**：所有需要自动 push 的 workflow 都要加这个权限。

**置信度**：高

---

## 2026-07-05 错误：GitHub Actions push 失败 - 找不到文件

**原因**：checkout 默认 `fetch-depth: 1`（浅克隆），导致 git 历史不完整，push 失败。

**解决方案**：在 checkout 步骤添加 `fetch-depth: 0`。

**预防措施**：需要 push 的 workflow 都要设置完整克隆。

**置信度**：高

---

## 2026-07-05 错误：赛事阶段显示 null 队名

**原因**：未开始的淘汰赛还没有确定对阵双方，API 返回 null。

**解决方案**：前端过滤掉 `status !== 'FINISHED'` 的比赛。

**预防措施**：展示数据前先检查必要字段是否为空。

**置信度**：高

---

## 2026-07-05 错误：socks5 代理导致 SSL 握手失败

**原因**：Windows PowerShell 的 git 对 socks5 代理支持不好。

**解决方案**：改用 `http://127.0.0.1:7897` 代理。

**预防措施**：Windows 环境下优先用 http 代理。

**置信度**：高

---

## 2026-07-06 错误：所有比赛时间偏移8小时（北京时间双重叠加）

**原因**：`formatDate()` 和日期判断代码使用 `getHours()`、`getMonth()`、`getDate()` 等**本地时间方法**，而非 `getUTCHours()` 等UTC方法。当脚本在非UTC时区的机器上运行时（如本地 UTC+8），`new Date(utcTimestamp + 8h)` 的本地时间方法会再次应用时区偏移，导致双重叠加。

**示例**：巴西vs挪威 API 返回 `2026-07-05T20:00:00Z`
- 修复前（本地UTC+8运行）：`getHours()`=4（已是北京时间）→ +8 → 12:00 ❌
- 修复后：`getUTCHours()`=4（正确）→ 不再偏移 → 4:00 ✓

**解决方案**：所有时间计算统一使用 `toBeijing()` 辅助函数，内部用 `getUTC*()` 方法提取北京时间组件。

**预防措施**：涉及跨时区时间计算时，始终用 UTC 方法提取时间组件，避免依赖本地时区。

**置信度**：高

---
