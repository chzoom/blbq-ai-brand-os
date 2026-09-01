#!/bin/bash
cd "$(dirname "$0")"
echo ""
echo "饱里宝气本地版：配置 Gemini API Key"
echo "密钥只会保存在当前文件夹的 .env 文件中。"
echo ""
read -s -p "请粘贴 GEMINI API Key，然后按回车：" API_KEY
echo ""
if [ -z "$API_KEY" ]; then
  echo "没有输入密钥，未作修改。"
  read -p "按回车关闭..."
  exit 1
fi
printf "GEMINI_API_KEY=%s\n" "$API_KEY" > .env
chmod 600 .env 2>/dev/null
echo "配置成功。现在双击“启动工具.command”。"
read -p "按回车关闭..."
