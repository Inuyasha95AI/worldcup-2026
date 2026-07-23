# 核心知识

从经验中提炼的、已验证的核心知识。这是最重要的文件。

---

## 规则

- GitHub Actions 用 `GITHUB_TOKEN` 推送不会触发其他 workflow，有依赖关系的 workflow 必须合并或用 `workflow_run`
- GitHub Pages 部署优先用 `peaceiris/actions-gh-pages@v4`（gh-pages 分支），不用 `actions/deploy-pages@v4`（Actions API）
- 使用 gh-pages 分支部署时，Pages Source 必须设为 "Deploy from a branch" → gh-pages
- 调用免费 API 时默认顺序请求（间隔600ms），必须有自动重试机制
- 操作 GitHub 前先确认 git 代理配置是否正确
- 指导用户上传文件时明确说明目标路径

## 模式

- **Workflow 链式依赖失败**：A推送→B不触发 → 合并A和B为一个workflow
- **VPN + 终端问题**：VPN 只代理浏览器 → 配置 git 全局代理
- **GitHub Pages 部署失败**：Actions API 不稳定 → 改用 gh-pages 分支部署
- **定时任务延迟**：GitHub 免费账户 cron 不精确 → 增加定时次数缓解
- **API 速率限制**：并发请求触发429 → 顺序请求 + 自动重试

## 最佳实践

- 多个 workflow 有依赖关系时，优先合并为一个
- 调用外部 API 始终加 retry 逻辑（至少3次）
- 遇到 git push 连接超时，先检查代理配置
- 新项目部署 GitHub Pages，直接用 gh-pages 分支方案
- cron 定时任务多设几个时间点，避免完全错过更新

---
