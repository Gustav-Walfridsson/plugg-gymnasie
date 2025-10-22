# PowerShell script to keep Next.js server running permanently
# This script will restart the server if it stops

$ErrorActionPreference = "Continue"
Set-Location "D:\Plugg hemsida\plugg-bot-1"

function Write-Timestamp {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor Green
}

Write-Timestamp "Starting Next.js Development Server Monitor"
Write-Host "This script will keep your server running permanently." -ForegroundColor Yellow
Write-Host "The server will auto-restart if it stops." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop monitoring." -ForegroundColor Yellow
Write-Host ""

$serverProcess = $null

while ($true) {
    # Check if server is running on port 3000
    $portCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    
    if ($portCheck -eq $null) {
        Write-Timestamp "Server not running on port 3000, starting..."
        
        # Kill any existing node processes for this project
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
            $_.CommandLine -like "*plugg-bot-1*" -or $_.CommandLine -like "*npm run dev*"
        } | Stop-Process -Force -ErrorAction SilentlyContinue
        
        # Start the server
        $serverProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
        Write-Timestamp "Server started with PID: $($serverProcess.Id)"
        
        # Wait for server to start
        Start-Sleep -Seconds 10
        
        # Verify server is running
        $portCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
        if ($portCheck -ne $null) {
            Write-Timestamp "✓ Server is now running on localhost:3000"
        } else {
            Write-Timestamp "✗ Failed to start server"
        }
    } else {
        Write-Timestamp "✓ Server is running on localhost:3000"
    }
    
    # Wait before next check
    Start-Sleep -Seconds 30
}