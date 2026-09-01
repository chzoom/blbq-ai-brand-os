#!/bin/bash
cd "$(dirname "$0")"
echo ""
if ! command -v node >/dev/null 2>&1; then
  echo "未检测到 Node.js。"
  echo "请先安装 Node.js 18 或更高版本，再重新双击启动。"
  echo "如果只使用本地兜底，可直接双击“离线本地兜底版.html”。"
  read -p "按回车关闭..."
  exit 1
fi

if [ ! -f ".env" ]; then
  echo "尚未配置 Gemini API Key。"
  echo "AI 功能会提示密钥缺失，但本地兜底仍可使用。"
  echo "可先关闭窗口，再双击“配置Gemini密钥.command”。"
  echo ""
fi

(open "http://127.0.0.1:8787" >/dev/null 2>&1 &) 
node server.mjs
