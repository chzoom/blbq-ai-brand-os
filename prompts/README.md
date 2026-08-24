# Prompt Registry

所有 AI Prompt 按任务和版本独立管理。`netlify/functions/ai.mjs` 继续保留现有 API 契约；后续迁移 Prompt 时，先保持任务名与输出字段兼容，再切换实现。

当前草案：

- `titles-v2.md`：标题策略与搜索意图
- `post-v2.md`：生活化正文结构
- `comments-v2.md`：评论分层与成交引导
