# PowerShell script to keep Next.js server running persistently
param(
    [switch]$Background
)

$ErrorActionPreference = "Continue"
Set-Location "D:\Plugg hemsida\plugg-bot-1"

function Write-Timestamp {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor Cyan
}

function Start-DevServer {
    Write-Timestamp "Starting Next.js development server..."
    $process = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
    return $process
}

function Test-ServerRunning {
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    return $port3000 -ne $null
}

Write-Timestamp "Next.js Server Monitor Started"
Write-Timestamp "Server will auto-restart if it stops"
Write-Timestamp "Press Ctrl+C to stop monitoring"

$serverProcess = $null

while ($true) {
    if ($serverProcess -eq $null -or $serverProcess.HasExited) {
        if ($serverProcess -ne $null -and $serverProcess.HasExited) {
            Write-Timestamp "Server process exited, restarting..."
        }
        $serverProcess = Start-DevServer
        Start-Sleep -Seconds 10  # Wait for server to start
    }
    
    if (Test-ServerRunning) {
        Write-Timestamp "Server is running on localhost:3000"
    } else {
        Write-Timestamp "Server not responding, will restart on next check"
    }
    
    Start-Sleep -Seconds 30  # Check every 30 seconds
}
