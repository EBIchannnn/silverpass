@echo off
echo SilverPass 開発サーバーを起動します...
set NEXT_TELEMETRY_DISABLED=1
cd /d %~dp0
npm run dev
