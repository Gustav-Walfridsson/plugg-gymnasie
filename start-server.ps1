# PowerShell script to keep Next.js server running
Set-Location "D:\Plugg hemsida\plugg-bot-1"

while ($true) {
    Write-Host "Starting Next.js development server..." -ForegroundColor Green
    try {
        npm run dev
    }
    catch {
        Write-Host "Server stopped with error: $_" -ForegroundColor Red
    }
    
    Write-Host "Server stopped. Restarting in 5 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}
