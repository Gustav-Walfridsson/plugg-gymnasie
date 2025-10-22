@echo off
REM AI Database Management Setup Script for Windows
REM This script helps you set up the AI database management system

echo 🚀 Setting up AI Database Management System
echo ==========================================

REM Check if .env.local exists
if not exist ".env.local" (
    echo 📝 Creating .env.local file...
    copy env.example .env.local
    echo ✅ Created .env.local from env.example
    echo ⚠️  Please edit .env.local with your actual Supabase credentials
) else (
    echo ✅ .env.local already exists
)

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI not found
    echo 📦 Installing Supabase CLI...
    npm install -g supabase
) else (
    echo ✅ Supabase CLI is installed
)

REM Check if local Supabase is running
echo 🔍 Checking if local Supabase is running...
curl -s http://localhost:54321/health >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Local Supabase is running
) else (
    echo ⚠️  Local Supabase is not running
    echo 🚀 Starting local Supabase...
    supabase start
)

REM Apply migrations
echo 📊 Applying database migrations...
supabase db reset

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo Next steps:
echo 1. Edit .env.local with your Supabase credentials
echo 2. Get your service role key from Supabase Dashboard ^> Settings ^> API
echo 3. Visit http://localhost:3000/admin/database to use the AI database manager
echo.
echo 🔑 To get your service role key:
echo    - Go to https://supabase.com/dashboard
echo    - Select your project
echo    - Go to Settings ^> API
echo    - Copy the 'service_role' key
echo    - Add it to .env.local as SUPABASE_SERVICE_ROLE_KEY
echo.
echo 🌐 Access the database manager at: http://localhost:3000/admin/database

pause
