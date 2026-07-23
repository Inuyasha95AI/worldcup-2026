# 错误记录

记录遇到的错误和解决方案。

---

## 2026-07-07 错误：workflow 推送不触发其他 workflow

**错误信息**：数据更新后网站不刷新，gh-pages 分支永远是旧数据

**原因**：`update-data.yml` 用 `GITHUB_TOKEN` 推送到 master，但 GitHub Actions 安全机制规定 workflow 触发的 push 不会再触发其他 workflow。所以 `deploy-pages.yml` 永远不会被数据更新推送触发。

**解决方案**：将数据抓取和 gh-pages 部署合并在同一个 workflow 中，一步完成。

**预防措施**：多个 workflow 有依赖关系时，优先考虑合并为一个 workflow，或使用 `workflow_run` 事件触发。

**置信度**：高

---

## 2026-07-07 错误：免费 API 并发请求触发 429

**错误信息**：`Error: HTTP 429 for https://api.football-data.org/v4/...`

**原因**：football-data.org 免费版限制约10次/分钟，`Promise.all` 同时发3个请求容易超限。

**解决方案**：改为顺序请求（间隔600ms）+ 自动重试（最多3次，429时等2秒）。

**预防措施**：调用免费 API 时默认用顺序请求，避免并发。

**置信度**：高

---

## 2026-07-06 错误：GitHub Pages 部署持续失败

**错误信息**：`Deployment failed, try again later.`

**原因**：使用 `actions/deploy-pages@v4`（GitHub Actions 部署 API）部署不稳定，artifact 上传成功但 deploy 步骤总是报错。这是 GitHub 基础设施问题，不是配置问题。

**解决方案**：改用 `peaceiris/actions-gh-pages@v4`，将文件推送到 gh-pages 分支部署。

**预防措施**：新项目优先用 gh-pages 分支部署，不用 GitHub Actions 部署 API。

**置信度**：高

---

## 2026-07-06 错误：git push 连接 github.com:443 超时

**错误信息**：`Failed to connect to github.com:443 after 21000 ms: Could not connect to server`

**原因**：VPN 默认只代理浏览器流量，终端（PowerShell）的 git 命令不经过 VPN 代理。

**解决方案**：配置 git 全局代理 `git config --global http.proxy http://127.0.0.1:7897`

**预防措施**：使用 GitHub CLI 或操作 git 时，先确认代理配置是否生效。

**置信度**：高

---

## 2026-07-06 错误：deploy-pages.yml 放错位置

**错误信息**：workflow 未被 GitHub 识别

**原因**：用户手动上传文件时放到了仓库根目录，而不是 `.github/workflows/` 目录下。

**解决方案**：确保 workflow 文件在 `.github/workflows/` 路径下。

**预防措施**：指导用户上传文件时明确说明路径。

**置信度**：高

---
