# 1·\`AQw345Netlify 部署版

## 部署

推荐将本目录上传到 GitHub 后连接 Netlify，或使用 Netlify CLI/API 部署，这样会同时部署静态文件和 `netlify/functions` 下的 Functions。仅使用 Netlify Drop/普通静态压缩包拖拽时，应视为静态站部署方式，不能假设 `netlify/functions/ai.mjs` 会一并发布；如果 Function 未部署，在线 AI 请求会失败。

`netlify.toml` 已配置：

- 发布目录：项目根目录
- Functions：`netlify/functions`
- AI 接口：`/.netlify/functions/ai`

## 环境变量

在 Netlify 的 Site configuration → Environment variables 中配置，不要上传 `.env`：

### BeeAPI / OpenAI 兼容接口

```text
AI_PROVIDER=beeapi
BEEAPI_API_KEY=你的 BeeAPI Key
BEEAPI_MODEL=gpt-5.3-codex
OPENAI_BASE_URL=https://beeapi.ai/v1
```

### Gemini

```text
AI_PROVIDER=gemini
GEMINI_API_KEY=你的 Gemini API Key
GEMINI_MODEL=gemini-2.5-flash
```

保存环境变量后点击 **Deploys → Trigger deploy → Deploy site**，再打开网站的“测试 AI”。

## 安全

部署包不包含 `.env`。API Key 只能放在 Netlify 环境变量或本地 `.env`，不要写入 `index.html`、前端模块或提交到公开仓库。
