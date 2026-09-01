#!/bin/bash
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "未检测到 Node.js 18 或更高版本。"
  read -p "按回车关闭..."
  exit 1
fi

echo "饱里宝气 AI 新媒体运营平台"
echo "项目目录：$(pwd)"
echo "打开地址：http://127.0.0.1:8787"
echo "关闭服务：按 Control + C"
echo ""
open "http://127.0.0.1:8787" >/dev/null 2>&1 || true
exec node server.mjs
