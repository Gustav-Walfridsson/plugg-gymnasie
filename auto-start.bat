@echo off
title Next.js Auto-Start - Plugg Bot
color 0A
echo.
echo ========================================
echo   Plugg Bot - Next.js Development
echo   Auto-starting on: http://localhost:3000
echo ========================================
echo.
echo This script will:
echo - Check if port 3000 is available
echo - Start the development server
echo - Keep it running permanently
echo - Auto-restart if it crashes
echo.
echo Press Ctrl+C to stop completely.
echo.

cd /d "D:\Plugg hemsida\plugg-bot-1"

REM Check if port 3000 is in use
netstat -an | find "3000" >nul
if %errorlevel% == 0 (
    echo WARNING: Port 3000 is already in use!
    echo Trying to kill existing processes...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:restart
echo [%date% %time%] Starting Next.js development server...
echo.
npm run dev
echo.
echo [%date% %time%] Server stopped. Restarting in 5 seconds...
echo Press Ctrl+C to stop completely.
timeout /t 5 /nobreak >nul
goto restart

