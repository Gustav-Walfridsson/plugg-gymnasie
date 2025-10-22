# 🚀 Snabbstart - Plugg Bot

## Automatisk serverstart

Du har flera alternativ för att starta servern automatiskt:

### 1. Enklaste sättet (Rekommenderat)
```bash
# Kör detta i terminalen i Cursor:
npm run dev
```

### 2. Permanent start (Windows Batch)
```bash
# Dubbelklicka på filen eller kör i terminalen:
auto-start.bat
```

### 3. Permanent start (PowerShell)
```powershell
# Kör i PowerShell:
.\auto-start.ps1
```

### 4. Bakgrundsstart (PowerShell)
```powershell
# Startar servern i bakgrunden:
.\auto-start.ps1 -Background
```

## Befintliga skript

Du har redan dessa skript som fungerar:

- `start-server.bat` - Enkel start med restart
- `start-server.ps1` - PowerShell version
- `start-permanent.bat` - Permanent start med monitoring
- `start-permanent.ps1` - Avancerad PowerShell version
- `keep-running.bat` - Enkel permanent start
- `keep-running.ps1` - PowerShell permanent start

## Automatisk start i Cursor

För att få servern att starta automatiskt när du öppnar projektet:

1. Öppna Command Palette (Ctrl+Shift+P)
2. Sök efter "Tasks: Run Task"
3. Välj "Start Next.js Dev Server"

Eller skapa en kortkommando genom att lägga till detta i dina inställningar.

## Serverinformation

- **URL**: http://localhost:3000
- **Port**: 3000
- **Hot Reload**: Aktiverat
- **TypeScript**: Stöd för TypeScript
- **Tailwind CSS**: Konfigurerat

## Felsökning

Om port 3000 är upptagen:
```bash
# Stoppa alla Node.js processer:
taskkill /f /im node.exe
```

Eller använd PowerShell:
```powershell
Get-Process -Name "node" | Stop-Process -Force
```

