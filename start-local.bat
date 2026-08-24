@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo 未检测到 Node.js 18 或更高版本。
  pause
  exit /b 1
)
echo 饱里宝气 AI 新媒体运营平台
echo 项目目录：%cd%
echo 打开地址：http://127.0.0.1:8787
start "" "http://127.0.0.1:8787"
node server.mjs
pause
