@echo off
cd /d %~dp0
echo Starting ALRAKEEN Web...
start http://localhost:3000
npm run dev
pause
