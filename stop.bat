@echo off
title SpamOut Stopper
setlocal

echo ==========================================================
echo               Stopping SpamOut Services
echo ==========================================================
echo.

echo Stopping any process listening on port 5000 (Flask)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo Stopping any process listening on port 3000 (Next.js)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo Stopping running SpamOut Python and Node processes...
taskkill /f /fi "WINDOWTITLE eq SpamOut*" >nul 2>&1

echo.
echo All SpamOut services stopped.
pause
