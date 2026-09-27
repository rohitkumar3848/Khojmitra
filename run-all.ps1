# KhojMitra (खोज-मित्र) - Production Quick Start Script
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " 🚀 Starting KhojMitra Full Stack Portal" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Load .env file if present
$envFile = Join-Path $PSScriptRoot ".env"
$mongoUri = ""
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $k = $parts[0].Trim()
            $v = $parts[1].Trim()
            [System.Environment]::SetEnvironmentVariable($k, $v, [System.EnvironmentVariableTarget]::Process)
            if ($k -eq "MONGODB_URI") { $mongoUri = $v }
        }
    }
    Write-Host "✅ Loaded configuration from .env" -ForegroundColor Green
}

if ($mongoUri -like "*mongodb+srv*") {
    Write-Host "☁️ Using MongoDB Atlas Cloud Cluster!" -ForegroundColor Green
} else {
    # Check Local MongoDB Service
    $mongo = Get-Service -Name "*mongo*" -ErrorAction SilentlyContinue
    if ($mongo -and $mongo.Status -eq 'Running') {
        Write-Host "✅ Local MongoDB service is running." -ForegroundColor Green
    } else {
        Write-Host "⚠️ Local MongoDB service not detected, starting if available..." -ForegroundColor Yellow
        Start-Service MongoDB -ErrorAction SilentlyContinue
    }
}

# 2. Launch Backend (Executable JAR) in dedicated window
Write-Host "🚀 Launching Spring Boot Backend on http://localhost:8080..." -ForegroundColor Cyan
$backendCmd = "`$host.ui.RawUI.WindowTitle = 'KhojMitra Backend (Port 8080)'; "
if ($mongoUri) {
    $backendCmd += "`$env:MONGODB_URI = '$mongoUri'; "
}
$backendCmd += "Write-Host 'Starting Spring Boot Backend...' -ForegroundColor Green; & 'C:\Program Files\Java\jdk-21.0.12\bin\java.exe' -jar '$PSScriptRoot\backend\target\khojmitra-backend-1.0.0.jar'"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

# 3. Launch Frontend (Vite Dev Server) in dedicated window
Write-Host "🚀 Launching React Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.ui.RawUI.WindowTitle = 'KhojMitra Frontend (Port 5173)'; cd '$PSScriptRoot\frontend'; Write-Host 'Starting React Frontend...' -ForegroundColor Cyan; & 'C:\Program Files\nodejs\node.exe' '$PSScriptRoot\frontend\node_modules\vite\bin\vite.js' --host"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Both servers are launching in separate windows!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "⚙️ Backend API: http://localhost:8080" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
