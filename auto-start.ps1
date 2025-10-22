# PowerShell script for automatic Next.js server startup
# This script provides better error handling and monitoring

param(
    [switch]$Silent,
    [switch]$Background
)

$ErrorActionPreference = "Continue"
Set-Location "D:\Plugg hemsida\plugg-bot-1"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Test-PortAvailable {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -eq $null
}

function Stop-ExistingServers {
    Write-ColorOutput "Checking for existing Node.js processes..." "Yellow"
    
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*plugg-bot-1*" -or 
        $_.CommandLine -like "*npm run dev*" -or
        $_.CommandLine -like "*next dev*"
    }
    
    if ($nodeProcesses) {
        Write-ColorOutput "Found $($nodeProcesses.Count) existing Node.js process(es), stopping..." "Yellow"
        $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

function Start-DevServer {
    Write-ColorOutput "Starting Next.js development server..." "Green"
    
    if ($Background) {
        $process = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
        Write-ColorOutput "Server started in background with PID: $($process.Id)" "Green"
        return $process
    } else {
        # Run in foreground
        npm run dev
    }
}

# Main execution
if (-not $Silent) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Plugg Bot - Next.js Development" -ForegroundColor Cyan
    Write-Host "  Auto-starting on: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This script will:" -ForegroundColor White
    Write-Host "- Check if port 3000 is available" -ForegroundColor White
    Write-Host "- Start the development server" -ForegroundColor White
    Write-Host "- Keep it running permanently" -ForegroundColor White
    Write-Host "- Auto-restart if it crashes" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Ctrl+C to stop completely." -ForegroundColor Yellow
    Write-Host ""
}

# Check if port is available
if (-not (Test-PortAvailable -Port 3000)) {
    Write-ColorOutput "Port 3000 is in use, attempting to free it..." "Yellow"
    Stop-ExistingServers
    
    if (-not (Test-PortAvailable -Port 3000)) {
        Write-ColorOutput "Could not free port 3000. Please close other applications using this port." "Red"
        exit 1
    }
}

if ($Background) {
    # Background mode - monitor and restart
    $serverProcess = $null
    
    while ($true) {
        if ($serverProcess -eq $null -or $serverProcess.HasExited) {
            if ($serverProcess -ne $null -and $serverProcess.HasExited) {
                Write-ColorOutput "Server process exited, restarting..." "Yellow"
            }
            $serverProcess = Start-DevServer
            Start-Sleep -Seconds 10
        }
        
        if (Test-PortAvailable -Port 3000) {
            Write-ColorOutput "Server not responding, will restart..." "Red"
        } else {
            Write-ColorOutput "✓ Server is running on localhost:3000" "Green"
        }
        
        Start-Sleep -Seconds 30
    }
} else {
    # Foreground mode - simple restart loop
    while ($true) {
        Start-DevServer
        Write-ColorOutput "Server stopped. Restarting in 5 seconds..." "Yellow"
        Write-ColorOutput "Press Ctrl+C to stop completely." "Yellow"
        Start-Sleep -Seconds 5
    }
}

