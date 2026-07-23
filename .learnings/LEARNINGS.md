# 经验教训

记录在开发过程中学到的知识和经验。

---

## 2026-07-06 任务：修复世界杯网页 GitHub Pages 部署

**经验**：GitHub Actions 的 `actions/deploy-pages@v4` 部署 API 不稳定，artifact 上传成功但 deploy 步骤会随机失败。`peaceiris/actions-gh-pages@v4`（推送到 gh-pages 分支）更可靠。

**场景**：需要将 GitHub Actions 工作流部署到 GitHub Pages 时。

**置信度**：高

**验证次数**：1

---

## 2026-07-07 任务：修复数据自动更新不生效

**经验**：GitHub Actions 安全机制——用 `GITHUB_TOKEN` 推送代码触发的 push 事件，**不会**再触发其他 workflow。如果 `update-data.yml` 推送到 master，`deploy-pages.yml` 永远不会被触发。必须把数据抓取和部署合并在同一个 workflow 中。

**场景**：多个 workflow 之间有依赖关系（A 推送后 B 需要运行）时。

**置信度**：高

**验证次数**：1

---

## 2026-07-07 任务：免费版 API 速率限制处理

**经验**：football-data.org 免费版有速率限制（约10次/分钟）。同时发多个请求容易触发 429 错误。改为顺序请求（间隔600ms）+ 自动重试（最多3次）可以稳定获取数据。

**场景**：调用有速率限制的免费 API 时。

**置信度**：高

**验证次数**：1

---

## 2026-07-06 任务：配置 git 代理

**经验**：很多 VPN 只代理浏览器流量，终端的 git 命令需要单独配置代理。代理端口在 VPN 软件的"本地代理"设置里找。

**场景**：git push/pull 报连接超时错误时。

**置信度**：高

**验证次数**：1

---

## 2026-07-06 任务：GitHub Pages Source 设置

**经验**：使用 `peaceiris/actions-gh-pages@v4` 部署时，Pages Source 必须设为 "Deploy from a branch" → gh-pages。选 "GitHub Actions" 会导致部署失败。

**场景**：配置 GitHub Pages 部署方式时。

**置信度**：高

**验证次数**：1

---

## 2026-07-06 任务：GitHub Actions cron 定时延迟

**经验**：GitHub Actions 免费账户的 cron 定时任务不精确，可能延迟几十分钟到几小时。无法修复，只能通过增加定时次数缓解。

**场景**：需要精确定时执行 GitHub Actions 工作流时。

**置信度**：中

**验证次数**：1

---
