@echo off
title Next.js Development Server - Permanent
cd /d "D:\Plugg hemsida\plugg-bot-1"

echo Starting Next.js development server permanently...
echo This window will stay open and keep the server running.
echo Press Ctrl+C to stop the server.
echo.

:restart
echo [%date% %time%] Starting server...
npm run dev
echo [%date% %time%] Server stopped. Restarting in 3 seconds...
timeout /t 3 /nobreak >nul
goto restart
