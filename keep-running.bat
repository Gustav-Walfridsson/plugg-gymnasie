@echo off
title Next.js Server - Keep Running
color 0A
echo.
echo ========================================
echo   Next.js Development Server
echo   Running on: http://localhost:3000
echo ========================================
echo.
echo This will keep the server running permanently.
echo Press Ctrl+C to stop.
echo.

cd /d "D:\Plugg hemsida"

:restart
echo [%date% %time%] Starting server...
npm run dev
echo.
echo [%date% %time%] Server stopped. Restarting in 5 seconds...
timeout /t 5 /nobreak >nul
goto restart