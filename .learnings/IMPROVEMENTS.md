# 改进方法

记录发现的更好工作方式。

---

## 2026-07-07 改进：数据抓取 + 部署合并为单个 workflow

**原来的方式**：`update-data.yml`（抓数据+推送）和 `deploy-pages.yml`（部署）是两个独立 workflow

**改进后**：在 `update-data.yml` 中直接添加 `peaceiris/actions-gh-pages@v4` 部署步骤

**优势**：解决了 GITHUB_TOKEN 推送不触发其他 workflow 的问题；部署不再依赖外部触发；逻辑更清晰

**适用场景**：任何需要"更新数据 → 部署网站"流水线的项目

**验证次数**：1

---

## 2026-07-07 改进：API 请求顺序执行 + 重试

**原来的方式**：`Promise.all` 同时发3个请求，无重试机制

**改进后**：顺序请求（间隔600ms）+ HTTP 错误/超时自动重试（最多3次，429等2秒）

**优势**：避免触发 API 速率限制；网络波动时自动恢复；错误信息更清晰

**适用场景**：调用任何有速率限制或不稳定的外部 API

**验证次数**：1

---

## 2026-07-06 改进：Pages 部署用 gh-pages 分支替代 Actions API

**原来的方式**：使用 `actions/deploy-pages@v4` + `actions/upload-pages-artifact@v3` + `configure-pages@v5`

**改进后**：使用 `peaceiris/actions-gh-pages@v4` 推送到 gh-pages 分支

**优势**：部署稳定，不依赖 GitHub Actions 部署 API；手动触发也能正常工作；Pages 设置更简单（Deploy from a branch）

**适用场景**：所有需要部署到 GitHub Pages 的静态网站

**验证次数**：1

---

## 2026-07-06 改进：增加 cron 定时次数

**原来的方式**：每天2次定时更新（07:00、12:00 北京时间）

**改进后**：每天4次定时更新（06:00、08:00、10:00、12:00 北京时间）

**优势**：即使 cron 延迟或失败，也能更频繁地更新数据；比赛进行中也能获取实时比分

**适用场景**：需要频繁更新数据的 GitHub Actions 项目

**验证次数**：1

---
