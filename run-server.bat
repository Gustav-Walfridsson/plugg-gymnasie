@echo off
title Next.js Server - Always Running
color 0A
echo.
echo ========================================
echo   Next.js Development Server
echo   Starting on: http://localhost:3000
echo ========================================
echo.

cd /d "D:\Plugg hemsida\plugg-bot-1"

:start
echo [%date% %time%] Starting Next.js server...
echo.
npm run dev
echo.
echo [%date% %time%] Server stopped. Restarting in 3 seconds...
echo Press Ctrl+C to stop completely.
timeout /t 3 /nobreak >nul
goto start
