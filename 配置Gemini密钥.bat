@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo 饱里宝气本地版：配置 Gemini API Key
echo 密钥只会保存在当前文件夹的 .env 文件中。
echo.
set /p API_KEY=请粘贴 Gemini API Key，然后按回车：
if "%API_KEY%"=="" (
  echo 没有输入密钥，未作修改。
  pause
  exit /b 1
)
> .env echo GEMINI_API_KEY=%API_KEY%
echo 配置成功。现在双击“启动工具.bat”。
pause
