@echo off
title Next.js Server - Simple Start
color 0A
echo.
echo ========================================
echo   Starting Next.js Development Server
echo ========================================
echo.

cd /d "D:\Plugg hemsida\plugg-bot-1"

echo Checking if server is already running...
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo Server is already running on port 3000!
    echo Opening browser...
    start http://localhost:3000
    pause
    exit
)

echo Starting server...
echo.
echo The server will start in a new window.
echo Keep this window open to monitor the server.
echo.

start "Next.js Server" cmd /k "cd /d D:\Plugg hemsida\plugg-bot-1 && npm run dev"

echo.
echo Server starting... Please wait 10 seconds...
timeout /t 10 /nobreak >nul

echo Checking if server started...
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ✓ Server is running on http://localhost:3000
    echo Opening browser...
    start http://localhost:3000
) else (
    echo ✗ Server failed to start. Check the server window for errors.
)

echo.
echo Press any key to exit...
pause >nul
