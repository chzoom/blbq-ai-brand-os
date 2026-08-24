@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo 未检测到 Node.js。
  echo 请先安装 Node.js 18 或更高版本。
  echo 如果只使用本地兜底，可直接打开“离线本地兜底版.html”。
  pause
  exit /b 1
)
if not exist ".env" (
  echo 尚未配置 Gemini API Key。
  echo AI 功能会提示密钥缺失，但本地兜底仍可使用。
  echo.
)
start "" "http://127.0.0.1:8787"
node server.mjs
pause
