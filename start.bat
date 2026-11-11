@echo off
title SpamOut Runner
setlocal
cd /d "%~dp0"

echo ==========================================================
echo               Starting SpamOut Platform
echo ==========================================================
echo.

echo [1/3] Starting Flask Web API (Port 5000)...
start "SpamOut - Backend API" cmd /k "cd /d ""%~dp0backend"" && call .venv\Scripts\activate.bat && python api/server.py"

echo [2/3] Starting Background Email Forwarding Daemon...
start "SpamOut - Email Daemon" cmd /k "cd /d ""%~dp0backend"" && call .venv\Scripts\activate.bat && python daemon/email_sec.py"

echo [3/3] Starting Next.js Web Dashboard (Port 3000)...
start "SpamOut - Frontend UI" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo ==========================================================
echo  All 3 services are running in their own windows:
echo  - Frontend Dashboard: http://localhost:3000
echo  - Backend API:        http://localhost:5000
echo  - Email Daemon:       Listening for incoming forwarded emails
echo ==========================================================
echo.
echo You can close this launcher window or press any key to exit.
pause >nul
