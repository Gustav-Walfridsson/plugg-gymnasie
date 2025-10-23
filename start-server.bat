@echo off
title Next.js Development Server - Permanent
color 0A
echo.
echo ========================================
echo   Next.js Development Server
echo   Running on: http://localhost:3000
echo ========================================
echo.
echo Starting server permanently...
echo This window will stay open and monitor the server.
echo Press Ctrl+C to stop the server.
echo.

cd /d "D:\Plugg hemsida"

:restart
echo [%date% %time%] Starting Next.js development server...
npm run dev
echo.
echo [%date% %time%] Server stopped. Restarting in 5 seconds...
echo Press Ctrl+C to stop monitoring.
timeout /t 5 /nobreak >nul
goto restart