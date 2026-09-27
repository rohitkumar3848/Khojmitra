# KhojMitra (खोज-मित्र) - Production Quick Start Script
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " 🚀 Starting KhojMitra Full Stack Portal" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Check MongoDB Service
$mongo = Get-Service -Name "*mongo*" -ErrorAction SilentlyContinue
if ($mongo -and $mongo.Status -eq 'Running') {
    Write-Host "✅ MongoDB service is running on localhost:27017." -ForegroundColor Green
} else {
    Write-Host "⚠️ Starting MongoDB Service..." -ForegroundColor Yellow
    Start-Service MongoDB -ErrorAction SilentlyContinue
}

# 2. Launch Backend (Executable JAR) in dedicated window
Write-Host "🚀 Launching Spring Boot Backend on http://localhost:8080..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.ui.RawUI.WindowTitle = 'KhojMitra Backend (Port 8080)'; Write-Host 'Starting Spring Boot Backend...' -ForegroundColor Green; & 'C:\Program Files\Java\jdk-21.0.12\bin\java.exe' -jar '$PSScriptRoot\backend\target\khojmitra-backend-1.0.0.jar'"

# 3. Launch Frontend (Vite Dev Server) in dedicated window
Write-Host "🚀 Launching React Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.ui.RawUI.WindowTitle = 'KhojMitra Frontend (Port 5173)'; cd '$PSScriptRoot\frontend'; Write-Host 'Starting React Frontend...' -ForegroundColor Cyan; & 'C:\Program Files\nodejs\node.exe' '$PSScriptRoot\frontend\node_modules\vite\bin\vite.js' --host"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Both servers are launching in separate windows!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "⚙️ Backend API: http://localhost:8080" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
